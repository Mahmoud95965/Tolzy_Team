import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Trigger: When a vote document is written (created, updated, deleted)
 * Path: tools/{toolId}/votes/{userId}
 */
export const aggregateToolVotes = onDocumentWritten("tools/{toolId}/votes/{userId}", async (event) => {
    const toolId = event.params.toolId;
    const toolRef = db.collection("tools").doc(toolId);

    // Run aggregation in a transaction to ensure accuracy
    await db.runTransaction(async (transaction) => {
        const toolDoc = await transaction.get(toolRef);
        if (!toolDoc.exists) return; // Tool deleted?

        const votesSnapshot = await transaction.get(toolRef.collection("votes"));

        let helpfulCount = 0;
        let notHelpfulCount = 0;

        votesSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.voteType === "helpful") helpfulCount++;
            if (data.voteType === "notHelpful") notHelpfulCount++;
        });

        const totalVotes = helpfulCount + notHelpfulCount;

        // Calculate weighted rating if needed, for now just updating stats
        // Simple rating logic: (helpful / total) * 5 ? Or just keep counts.
        // User asked for "Recalculate average rating". 
        // Let's assume rating is based on ratio of helpfulness for now, or just store the raw counts 
        // and let frontend decide layout. 
        // Based on "Tool" type, it has "rating" (number). 
        // A simple algorithm: Rating = (Helpful / Total) * 5.

        const rating = totalVotes > 0 ? (helpfulCount / totalVotes) * 5 : 0;

        transaction.update(toolRef, {
            votingStats: {
                helpfulCount,
                notHelpfulCount,
                totalVotes
            },
            rating: Number(rating.toFixed(1)),
            reviewCount: totalVotes // Assuming votes = reviews count for this simple model
        });
    });
});
