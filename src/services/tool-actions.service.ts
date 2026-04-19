import { db } from '../config/firebase'; // Kept for other functions if any
import { doc } from 'firebase/firestore'; // Kept for typing or other util usage

export const updateToolVote = async (
  toolId: string,
  userId: string,
  isHelpful: boolean
) => {
  try {
    const response = await fetch('/api/tools/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolId,
        userId,
        voteType: isHelpful ? 'helpful' : 'notHelpful'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Vote failed');
    }

    const data = await response.json();
    return {
      success: true,
      updates: {
        rating: data.rating,
        votingStats: data.votingStats,
        reviewCount: data.reviewCount
      }
    };
  } catch (error: any) {
    console.error('Error updating vote:', error);
    if (error?.message?.includes('permission')) {
      throw new Error('يجب تسجيل الدخول للتصويت');
    }
    throw new Error(error.message || 'فشل تحديث التصويت. يرجى المحاولة مرة أخرى.');
  }
};

export const updateToolSave = async (
  toolId: string,
  userId: string,
  shouldSave?: boolean
) => {
  try {
    const response = await fetch('/api/tools/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolId,
        userId,
        shouldSave
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Save failed');
    }

    const data = await response.json();
    return { success: true, isSaved: data.isSaved };

  } catch (error: any) {
    console.error('Error updating save:', error);
    if (error?.message?.includes('permission')) {
      throw new Error('يجب تسجيل الدخول لحفظ الأداة');
    }
    throw new Error('فشل تحديث حالة الحفظ. يرجى المحاولة مرة أخرى.');
  }
};
