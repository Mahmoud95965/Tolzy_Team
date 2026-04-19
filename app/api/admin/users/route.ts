import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb, logError } from '@/lib/firebase-admin';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/src/config/supabase-admin';

// Ensure Firebase Admin is initialized
// adminDb is initialized in the lib file, we just need to ensure the side effect runs
if (!adminDb) {
    console.error('Firebase Admin not initialized properly');
}

const ADMIN_EMAIL = 'mahmoud.m.moussa5310@gmail.com';

const getAdminToken = (request: NextRequest) => {
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return null;
    return authHeader.slice('Bearer '.length).trim();
};

const ensureAdmin = async (request: NextRequest) => {
    const token = getAdminToken(request);
    if (!token) {
        console.warn('⚠️ No authorization token provided');
        return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 }) };
    }

    try {
        // Verify the token with Firebase Admin SDK
        const decoded = await getAuth().verifyIdToken(token);
        const email = (decoded.email || '').toLowerCase();
        
        console.log(`✅ Token verified for email: ${email}`);
        
        if (email !== ADMIN_EMAIL) {
            console.warn(`⚠️ Access denied for email: ${email} (expected: ${ADMIN_EMAIL})`);
            return { ok: false as const, response: NextResponse.json({ error: `Forbidden: ${email} is not an admin` }, { status: 403 }) };
        }
        
        return { ok: true as const };
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Token verification failed: ${errorMsg}`);
        return { 
            ok: false as const, 
            response: NextResponse.json({ error: `Invalid token: ${errorMsg}` }, { status: 401 }) 
        };
    }
};

export async function GET(request: NextRequest) {
    try {
        const authCheck = await ensureAdmin(request);
        if (!authCheck.ok) return authCheck.response;

        console.log('📊 Fetching admin users list...');
        const listUsersResult = await getAuth().listUsers(1000); // Fetch up to 1000 users
        const userIds = listUsersResult.users.map(userRecord => userRecord.uid);
        console.log(`✅ Retrieved ${listUsersResult.users.length} users from Firebase Auth`);

        const plansByUserId = new Map<string, string>();
        if (userIds.length > 0 && hasSupabaseAdminConfig) {
            try {
                const { data: plansRows, error: plansError } = await supabaseAdmin
                    .from('user_limits')
                    .select('user_id, plan')
                    .in('user_id', userIds);

                if (plansError) {
                    const errorMsg = plansError.message || '';
                    const isTableError = errorMsg.includes('user_limits') || errorMsg.includes('not found') || 
                                        errorMsg.includes('does not exist') || errorMsg.includes('schema cache');
                    
                    if (isTableError) {
                        console.warn(`⚠️ Supabase table/schema cache not updated: ${errorMsg}`);
                        console.warn(`⚠️ ACTION NEEDED: Go to Supabase → SQL Editor → Run quick fix:`);
                        console.warn(`   REINDEX TABLE public.user_limits;`);
                        console.warn(`   INSERT INTO public.user_limits (user_id, plan) VALUES ('cache-refresh', 'free');`);
                        // Continue without plan data - users will show as free
                    } else {
                        throw new Error(errorMsg);
                    }
                } else {
                    for (const row of plansRows || []) {
                        const normalized = String(row.plan || 'free').toLowerCase();
                        plansByUserId.set(row.user_id, normalized.includes('pro') ? 'pro' : normalized.includes('plus') ? 'pro' : 'free');
                    }
                    console.log(`✅ Fetched plans for ${plansRows?.length || 0} users from Supabase`);
                }
            } catch (e: any) {
                console.error(`❌ Error fetching user plans: ${e?.message}`);
                // Continue without plan data
            }
        }

        const users = listUsersResult.users.map(userRecord => ({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
            plan: plansByUserId.get(userRecord.uid) || 'free',
            emailVerified: Boolean(userRecord.emailVerified),
            disabled: Boolean(userRecord.disabled),
            providers: (userRecord.providerData || []).map((provider) => provider.providerId),
        }));

        return NextResponse.json({ users });

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error fetching users list: ${errorMsg}`);
        logError(error, 'Error fetching users list');
        return NextResponse.json({ error: 'Failed to fetch users', details: errorMsg }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const authCheck = await ensureAdmin(request);
        if (!authCheck.ok) return authCheck.response;

        const body = await request.json();
        const uid = String(body?.uid || '').trim();
        const rawPlan = String(body?.plan || '').toLowerCase().trim();
        const plan = rawPlan === 'pro' ? 'pro' : 'free';

        if (!uid) {
            console.warn('⚠️ Missing uid in request body');
            return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
        }

        console.log(`🔄 Updating user ${uid} to plan: ${plan}`);

        let supabaseSuccess = false;
        let supabaseErrorMsg = '';

        // Try Supabase first if configured
        if (hasSupabaseAdminConfig) {
            try {
                const { error } = await supabaseAdmin
                    .from('user_limits')
                    .upsert(
                        {
                            user_id: uid,
                            plan,
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: 'user_id' }
                    );

                if (error) {
                    const errorMsg = error.message || '';
                    // Check for quota exceeded error
                    if (errorMsg.includes('exceed_cached_egress_quota') || errorMsg.includes('restricted')) {
                        console.warn(`⚠️ Supabase quota exceeded, using Firebase fallback for ${uid}`);
                        supabaseErrorMsg = 'Supabase quota exceeded';
                    } else {
                        const isTableError = errorMsg.includes('user_limits') || errorMsg.includes('not found') || 
                                            errorMsg.includes('does not exist') || errorMsg.includes('schema cache');
                        
                        if (isTableError) {
                            console.warn(`⚠️ Supabase table/schema error for ${uid}: ${errorMsg}`);
                        } else {
                            console.error(`❌ Supabase error updating user ${uid}: ${errorMsg}`);
                            supabaseErrorMsg = errorMsg;
                        }
                    }
                } else {
                    supabaseSuccess = true;
                    console.log(`✅ Supabase updated successfully for user ${uid}`);
                }
            } catch (supabaseError: any) {
                const errorMsg = supabaseError?.message || String(supabaseError);
                if (errorMsg.includes('exceed_cached_egress_quota') || errorMsg.includes('restricted')) {
                    console.warn(`⚠️ Supabase quota exceeded, using Firebase fallback for ${uid}`);
                    supabaseErrorMsg = 'Supabase quota exceeded';
                } else if (errorMsg.includes('user_limits') || errorMsg.includes('not found')) {
                    console.warn(`⚠️ user_limits table not found, using Firebase fallback for ${uid}`);
                } else {
                    console.error(`❌ Supabase error: ${errorMsg}`);
                    supabaseErrorMsg = errorMsg;
                }
            }
        } else {
            console.warn(`⚠️ Supabase not configured, using Firebase only for ${uid}`);
        }

        // Always update Firestore as primary/fallback storage
        if (adminDb) {
            try {
                await adminDb.collection('users').doc(uid).set(
                    {
                        plan,
                        updatedAt: new Date().toISOString(),
                    },
                    { merge: true }
                );
                console.log(`✅ Firestore user document updated for ${uid}`);
                
                // If Supabase failed but Firestore succeeded, still return success
                return NextResponse.json({ 
                    success: true, 
                    uid, 
                    plan,
                    source: supabaseSuccess ? 'supabase+firebase' : 'firebase',
                    warning: supabaseErrorMsg || undefined
                }, { status: 200 });
            } catch (firestoreError: any) {
                console.error(`❌ Firestore error for ${uid}:`, firestoreError);
                
                // If both failed, return error
                if (!supabaseSuccess) {
                    return NextResponse.json({ 
                        error: 'Failed to update plan in both databases',
                        details: supabaseErrorMsg || String(firestoreError)
                    }, { status: 500 });
                }
                
                // If only Firestore failed but Supabase succeeded
                return NextResponse.json({ 
                    success: true, 
                    uid, 
                    plan,
                    source: 'supabase',
                    warning: 'Firestore sync failed but Supabase updated'
                }, { status: 200 });
            }
        }

        // No Firestore available
        if (!supabaseSuccess) {
            return NextResponse.json({ 
                error: 'No database available for update',
                details: supabaseErrorMsg
            }, { status: 503 });
        }

        return NextResponse.json({ success: true, uid, plan, source: 'supabase' }, { status: 200 });
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error updating user subscription: ${errorMsg}`);
        logError(error, 'Error updating user subscription');
        return NextResponse.json({ error: 'Failed to update subscription', details: errorMsg }, { status: 500 });
    }
}
