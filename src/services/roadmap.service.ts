import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface RoadmapItem {
  id?: string;
  title: string;
  description: string;
  status: 'planned' | 'in_progress' | 'done';
  badge: string; // e.g. "تطوير 💻", "ميزة كبرى 🔥"
  order?: number;
}

export interface ChangelogItem {
  id?: string;
  version: string;
  date: string; // ISO date string or formatted date
  title: string;
  changes: string[];
  type: 'major' | 'minor' | 'patch';
}

// === ROADMAP API ===

export const getRoadmapItems = async (): Promise<RoadmapItem[]> => {
  try {
    const q = query(collection(db, 'roadmap'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoadmapItem));
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return [];
  }
};

export const addRoadmapItem = async (item: RoadmapItem) => {
  return await addDoc(collection(db, 'roadmap'), { ...item, order: item.order || Date.now() });
};

export const updateRoadmapItem = async (id: string, updates: Partial<RoadmapItem>) => {
  const ref = doc(db, 'roadmap', id);
  return await updateDoc(ref, updates);
};

export const deleteRoadmapItem = async (id: string) => {
  return await deleteDoc(doc(db, 'roadmap', id));
};


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
