import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

export const voteTool = async (
  toolId: string,
  userId: string,
  voteType: 'helpful' | 'notHelpful'
) => {
  try {
    const response = await fetch('/api/tools/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolId,
        userId,
        voteType
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return true;
  } catch (error) {
    console.error('Error voting for tool:', error);
    return false;
  }
};
