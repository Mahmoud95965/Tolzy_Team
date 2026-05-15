import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ChangelogItem {
  id?: string;
  version: string;
  date: string; // ISO date string or formatted date
  title: string;
  changes: string[];
  type: 'major' | 'minor' | 'patch';
  category?: 'ai' | 'ui' | 'community' | 'bugfix' | 'other';
  isHero?: boolean;
  isExploreCard?: boolean;
  link?: string;
  iconType?: 'sparkles' | 'cpu' | 'layout' | 'shield' | 'zap';
  imageUrl?: string;
  htmlContent?: string;
}

// === CHANGELOG/UPDATES API ===

export const getChangelogItems = async (): Promise<ChangelogItem[]> => {
  try {
    // Order by date descending (newest first)
    const q = query(collection(db, 'changelog'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChangelogItem));
  } catch (error) {
    console.error('Error fetching changelog:', error);
    return [];
  }
};

export const getChangelogItemById = async (id: string): Promise<ChangelogItem | null> => {
  try {
    const docRef = doc(db, 'changelog', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ChangelogItem;
    }
    return null;
  } catch (error) {
    console.error('Error fetching changelog item:', error);
    return null;
  }
};

export const addChangelogItem = async (item: ChangelogItem) => {
  return await addDoc(collection(db, 'changelog'), item);
};

export const updateChangelogItem = async (id: string, updates: Partial<ChangelogItem>) => {
  const ref = doc(db, 'changelog', id);
  return await updateDoc(ref, updates);
};

export const deleteChangelogItem = async (id: string) => {
  return await deleteDoc(doc(db, 'changelog', id));
};
