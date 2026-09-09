import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin safely
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!admin.apps.length && projectId && clientEmail && privateKey) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
    });
}

export async function POST(req: Request) {
  try {
    // 1. Verify Authentication (Don't Trust Frontend)
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { recipientUid, type, postId } = await req.json();

    if (!recipientUid || !type) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const actorUid = decodedToken.uid;
    const actorName = decodedToken.name || decodedToken.email?.split('@')[0] || 'مستخدم';

    // 2. Authorization Checks
    if (actorUid === recipientUid) {
      return NextResponse.json({ error: 'Cannot send notification to yourself' }, { status: 400 });
    }

    // Initialize Supabase Client (For DB queries)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Optional: Verify if the post exists
    if (postId) {
      const { data: postCheck } = await supabase.from('community_posts').select('id').eq('id', postId).single();
      if (!postCheck) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
    }

    // Fetch FCM token from Supabase profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('fcm_token')
      .eq('id', recipientUid)
      .single();

    if (error || !profile?.fcm_token) {
      return NextResponse.json({ success: false, message: 'No FCM token found for this user' }, { status: 200 });
    }

    // Construct the notification securely on the backend
    const title = type === 'like' ? 'إعجاب جديد ❤️' : 'تعليق جديد 💬';
    const body = type === 'like' ? `أعجب ${actorName} بمنشورك` : `ردّ ${actorName} على منشورك`;

    // Send the notification using Firebase Admin SDK
    const message = {
      notification: { title, body },
      data: { 
        postId: postId || '',
        url: `/community?action=comment&postId=${postId}#post-${postId}`
      },
      token: profile.fcm_token,
    };

    const response = await admin.messaging().send(message);
    
    return NextResponse.json({ success: true, messageId: response }, { status: 200 });

  } catch (error: any) {
    console.error('Error sending FCM message:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
