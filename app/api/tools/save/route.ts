import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { toolId, userId, shouldSave } = body;

        if (!toolId || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const toolRef = adminDb.collection('tools').doc(toolId);

        let isSaved = false;

        // Optimization: If shouldSave is explicit, us atomic update without transaction/read
        if (shouldSave !== undefined) {
            await toolRef.update({
                savedBy: shouldSave ? FieldValue.arrayUnion(userId) : FieldValue.arrayRemove(userId)
            });
            isSaved = shouldSave;
        } else {
            // Toggle logic using transaction
            await adminDb.runTransaction(async (transaction: any) => {
                const toolDoc = await transaction.get(toolRef);
                if (!toolDoc.exists) throw new Error('Tool not found');

                const savedBy = toolDoc.data()?.savedBy || [];
                const wasSaved = savedBy.includes(userId);

                if (wasSaved) {
                    transaction.update(toolRef, { savedBy: FieldValue.arrayRemove(userId) });
                    isSaved = false;
                } else {
                    transaction.update(toolRef, { savedBy: FieldValue.arrayUnion(userId) });
                    isSaved = true;
                }
            });
        }

        return NextResponse.json({ success: true, isSaved });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('❌ Save transaction failed:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }
}
