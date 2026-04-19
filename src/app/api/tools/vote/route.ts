import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { toolId, voteType, userId } = body;

        if (!toolId || !voteType || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!['helpful', 'notHelpful'].includes(voteType)) {
            return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const toolRef = adminDb.collection('tools').doc(toolId);
        const voteRef = toolRef.collection('votes').doc(userId);

        await adminDb.runTransaction(async (transaction: any) => {
            const toolDoc = await transaction.get(toolRef);
            const voteDoc = await transaction.get(voteRef);

            if (!toolDoc.exists) {
                throw new Error('Tool not found');
            }

            const toolData = toolDoc.data();
            const currentStats = toolData?.votingStats || {
                helpfulCount: 0,
                notHelpfulCount: 0,
                totalVotes: 0
            };

            // Legacy arrays for rating calculation
            const votes = {
                helpful: [...(toolData?.votes?.helpful || [])],
                notHelpful: [...(toolData?.votes?.notHelpful || [])]
            };

            let newRating = toolData?.rating || 0;
            let newHelpful = currentStats.helpfulCount || 0;
            let newNotHelpful = currentStats.notHelpfulCount || 0;
            const updates: any = {};

            if (voteDoc.exists) {
                const existingVote = voteDoc.data();
                if (existingVote?.voteType === voteType) {
                    // Toggle OFF (remove vote)
                    if (voteType === 'helpful') {
                        newHelpful--;
                        updates[`votes.helpful`] = FieldValue.arrayRemove(userId);

                        // Rating calc
                        const index = votes.helpful.indexOf(userId);
                        if (index > -1) {
                            votes.helpful.splice(index, 1);
                            newRating = Math.max(0, newRating - 0.25);
                        }
                    } else {
                        newNotHelpful--;
                        updates[`votes.notHelpful`] = FieldValue.arrayRemove(userId);

                        // Rating calc
                        const index = votes.notHelpful.indexOf(userId);
                        if (index > -1) {
                            votes.notHelpful.splice(index, 1);
                            newRating = Math.min(5, newRating + 0.25);
                        }
                    }

                    transaction.delete(voteRef);
                } else {
                    // Change vote
                    if (voteType === 'helpful') {
                        newHelpful++;
                        newNotHelpful--;
                        updates[`votes.helpful`] = FieldValue.arrayUnion(userId);
                        updates[`votes.notHelpful`] = FieldValue.arrayRemove(userId);

                        // Rating calc
                        const index = votes.notHelpful.indexOf(userId);
                        if (index > -1) votes.notHelpful.splice(index, 1);
                        votes.helpful.push(userId);
                        newRating = Math.min(5, newRating + 0.5); // +0.25 for removing bad, +0.25 for adding good
                    } else {
                        newHelpful--;
                        newNotHelpful++;
                        updates[`votes.notHelpful`] = FieldValue.arrayUnion(userId);
                        updates[`votes.helpful`] = FieldValue.arrayRemove(userId);

                        // Rating calc
                        const index = votes.helpful.indexOf(userId);
                        if (index > -1) votes.helpful.splice(index, 1);
                        votes.notHelpful.push(userId);
                        newRating = Math.max(0, newRating - 0.5); // -0.25 for removing good, -0.25 for adding bad
                    }

                    transaction.set(voteRef, {
                        voteType,
                        userId,
                        updatedAt: FieldValue.serverTimestamp()
                    });
                }
            } else {
                // New vote
                if (voteType === 'helpful') {
                    newHelpful++;
                    updates[`votes.helpful`] = FieldValue.arrayUnion(userId);

                    // Rating calc
                    votes.helpful.push(userId);
                    newRating = Math.min(5, newRating + 0.25);
                } else {
                    newNotHelpful++;
                    updates[`votes.notHelpful`] = FieldValue.arrayUnion(userId);

                    // Rating calc
                    votes.notHelpful.push(userId);
                    newRating = Math.max(0, newRating - 0.25);
                }

                transaction.set(voteRef, {
                    voteType,
                    userId,
                    createdAt: FieldValue.serverTimestamp()
                });
            }

            // Ensure no negatives
            newHelpful = Math.max(0, newHelpful);
            newNotHelpful = Math.max(0, newNotHelpful);
            newRating = Math.min(5, Math.max(0, newRating)); // Clamp rating 0-5

            updates.votingStats = {
                helpfulCount: newHelpful,
                notHelpfulCount: newNotHelpful,
                totalVotes: newHelpful + newNotHelpful
            };

            updates.rating = newRating;
            updates.reviewCount = newHelpful + newNotHelpful;

            transaction.update(toolRef, updates);
        });

        const updatedTool = await toolRef.get();
        const data = updatedTool.data();

        return NextResponse.json({
            success: true,
            votingStats: data?.votingStats,
            rating: data?.rating,
            reviewCount: data?.reviewCount
        });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('❌ Vote transaction failed:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            console.error('❌ Vote transaction failed (unknown error):', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }
}
