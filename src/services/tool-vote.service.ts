import { db } from '@/src/config/firebase';
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface VoteResponse {
    success?: boolean;
    error?: string;
}

/**
 * Casts a vote for a tool securely via direct Firestore write.
 * The Cloud Function will handle aggregation.
 * 
 * @param toolId The ID of the tool.
 * @param userId The ID of the logged-in user.
 * @param voteType 'helpful' or 'notHelpful'.
 */
export async function castToolVote(toolId: string, userId: string, voteType: 'helpful' | 'notHelpful'): Promise<VoteResponse> {
    try {
        const voteRef = doc(db, 'tools', toolId, 'votes', userId);

        // Check if user is clicking the same vote to toggle it off
        const currentVoteSnap = await getDoc(voteRef);

        if (currentVoteSnap.exists() && currentVoteSnap.data().voteType === voteType) {
            // Toggle OFF
            await deleteDoc(voteRef);
        } else {
            // New Vote or Change Vote
            await setDoc(voteRef, {
                voteType,
                userId,
                updatedAt: serverTimestamp(),
                // If new, createdAt would be nice, but setDoc with merge or overwrite is fine.
                // Simplified: always overwrite with latest vote.
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error casting vote:', error);
        return { error: error.message };
    }
}
