import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, DocumentData, QueryDocumentSnapshot, startAfter, DocumentSnapshot, getCountFromServer } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Tool } from '../types/index';

 const categoryCountCache = new Map<string, { value: number; timestamp: number }>();
 const categoryCountInFlight = new Map<string, Promise<number>>();
 const CATEGORY_COUNT_TTL_MS = 24 * 60 * 60 * 1000;

export const convertFirestoreDoc = (doc: QueryDocumentSnapshot<DocumentData>): Tool => {
  const data = doc.data();
  let imageUrl = data.imageUrl || data.image || data.logo || data.icon || data.img || '';

  if (imageUrl && imageUrl.startsWith('public/')) {
    imageUrl = imageUrl.replace('public/', '/');
  } else if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
    imageUrl = '/' + imageUrl;
  }

  return {
    ...data,
    id: doc.id,
    imageUrl: imageUrl, 
    votes: data.votes || { helpful: [], notHelpful: [] },
    savedBy: data.savedBy || [],
    votingStats: data.votingStats || { helpfulCount: 0, notHelpfulCount: 0, totalVotes: 0 },
    isNew: data.isNew || false,
    isFeatured: data.isFeatured || false,
    isPopular: data.isPopular || false
  } as Tool;
};

export interface PaginatedToolsResult {
  tools: Tool[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

export const getCategoryCount = async (categoryInput: any): Promise<number> => {
  const category = typeof categoryInput === 'object' ? categoryInput?.category : categoryInput;
  if (!category || typeof category !== 'string' || category === 'All') return 0;

  const cached = categoryCountCache.get(category);
  if (cached && Date.now() - cached.timestamp < CATEGORY_COUNT_TTL_MS) {
    return cached.value;
  }

  const existingPromise = categoryCountInFlight.get(category);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = (async () => {
    try {
      const toolsRef = collection(db, 'tools');
      const constraintsArray = [where('category', 'array-contains', category)];
      const constraintsString = [where('category', '==', category)];

      const [snapshotArray, snapshotString] = await Promise.all([
        getCountFromServer(query(toolsRef, ...constraintsArray)),
        getCountFromServer(query(toolsRef, ...constraintsString))
      ]);

      const value = snapshotArray.data().count + snapshotString.data().count;
      categoryCountCache.set(category, { value, timestamp: Date.now() });
      return value;
    } catch (error) {
      console.error('Error in getCategoryCount:', error);
      categoryCountCache.set(category, { value: 0, timestamp: Date.now() });
      return 0;
    } finally {
      categoryCountInFlight.delete(category);
    }
  })();

  categoryCountInFlight.set(category, promise);
  return promise;
};

export const getPaginatedTools = async (
  pageSize: number = 20,
  startAfterParam?: any,
  categoryFilterParam?: any
): Promise<PaginatedToolsResult> => {
  try {
    const toolsRef = collection(db, 'tools');
    let category = null;

    // استخراج الفئة بشكل آمن وصارم
    if (categoryFilterParam && typeof categoryFilterParam === 'object') {
      category = categoryFilterParam.category;
    } else if (typeof categoryFilterParam === 'string') {
      category = categoryFilterParam;
    }

    // تصحيح الخطأ إذا تم تمرير الفلاتر في مكان startAfterParam
    if (startAfterParam && typeof startAfterParam === 'object' && !startAfterParam.data && !Array.isArray(startAfterParam)) {
      category = category || startAfterParam.category;
      startAfterParam = null;
    }

    if (typeof category !== 'string' || category === 'All') {
      category = null;
    }

    // Build constraints in correct order: where -> orderBy -> limit -> startAfter
    const baseConstraints: any[] = [];

    if (category) {
      // Category filter will be added separately for each query
    }

    // Always add orderBy and limit
    baseConstraints.push(orderBy('__name__'));
    baseConstraints.push(limit(pageSize));

    // Add pagination last
    if (startAfterParam) {
      if (Array.isArray(startAfterParam)) {
        baseConstraints.push(startAfter(...startAfterParam));
      } else {
        baseConstraints.push(startAfter(startAfterParam));
      }
    }

    if (!category) {
      const snapshot = await getDocs(query(toolsRef, ...baseConstraints));
      const tools = snapshot.docs.map(convertFirestoreDoc);
      return {
        tools,
        lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
        hasMore: snapshot.docs.length === pageSize
      };
    }

    // For category queries, prepend where clauses to baseConstraints
    const arrayConstraints = [where('category', 'array-contains', category), ...baseConstraints];
    const stringConstraints = [where('category', '==', category), ...baseConstraints];

    const [snapshotArray, snapshotString] = await Promise.all([
      getDocs(query(toolsRef, ...arrayConstraints)),
      getDocs(query(toolsRef, ...stringConstraints))
    ]);

    const mergedDocsMap = new Map<string, QueryDocumentSnapshot<DocumentData>>();
    snapshotArray.docs.forEach(d => mergedDocsMap.set(d.id, d));
    snapshotString.docs.forEach(d => mergedDocsMap.set(d.id, d));

    const mergedDocs = Array.from(mergedDocsMap.values()).sort((a, b) => a.id.localeCompare(b.id));
    const pageDocs = mergedDocs.slice(0, pageSize);

    return {
      tools: pageDocs.map(convertFirestoreDoc),
      lastDoc: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null,
      hasMore: snapshotArray.docs.length === pageSize || snapshotString.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error getting paginated tools:', error);
    throw error;
  }
};

export const getFeaturedTools = async (maxTools: number = 4): Promise<Tool[]> => {
  try {
    // Use simple query without orderBy to avoid composite index requirement
    const q = query(collection(db, 'tools'), where('isFeatured', '==', true), limit(maxTools * 2));
    const snapshot = await getDocs(q);
    const tools = snapshot.docs.map(convertFirestoreDoc);
    // Sort client-side by rating
    return tools.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, maxTools);
  } catch (error) {
    console.error('Error getting featured tools:', error);
    return [];
  }
};

export const getPopularTools = async (maxTools: number = 4): Promise<Tool[]> => {
  try {
    // Use simple query without orderBy to avoid composite index requirement
    const q = query(collection(db, 'tools'), where('isPopular', '==', true), limit(maxTools * 2));
    const snapshot = await getDocs(q);
    const tools = snapshot.docs.map(convertFirestoreDoc);
    // Sort client-side by rating
    return tools.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, maxTools);
  } catch (error) {
    console.error('Error getting popular tools:', error);
    return [];
  }
};

export const getNewTools = async (maxTools: number = 4): Promise<Tool[]> => {
  try {
    // Use simple query without orderBy to avoid composite index requirement
    const q = query(collection(db, 'tools'), where('isNew', '==', true), limit(maxTools * 2));
    const snapshot = await getDocs(q);
    const tools = snapshot.docs.map(convertFirestoreDoc);
    // Sort client-side by submittedAt
    return tools.sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return dateB - dateA;
    }).slice(0, maxTools);
  } catch (error) {
    console.error('Error getting new tools:', error);
    return [];
  }
};

export const getToolById = async (id: string): Promise<Tool | null> => {
  try {
    const snapshot = await getDoc(doc(db, 'tools', id.toString().padStart(3, '0')));
    return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as Tool : null;
  } catch (error) {
    console.error('Error getting tool by ID:', error);
    return null;
  }
};

export const getUsersSavedTools = async (userIdInput: any): Promise<Tool[]> => {
  try {
    const userId = typeof userIdInput === 'object' ? userIdInput?.uid : userIdInput;
    if (!userId || typeof userId !== 'string') return [];
    const q = query(collection(db, 'tools'), where('savedBy', 'array-contains', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertFirestoreDoc);
  } catch (error) {
    console.error('Error fetching user saved tools:', error);
    return [];
  }
};

export const getUsersSubmittedTools = async (userIdInput: any): Promise<Tool[]> => {
  try {
    const userId = typeof userIdInput === 'object' ? userIdInput?.uid : userIdInput;
    if (!userId || typeof userId !== 'string') return [];
    const q = query(collection(db, 'tools'), where('submittedBy', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertFirestoreDoc);
  } catch (error) {
    console.error('Error fetching user submitted tools:', error);
    return [];
  }
};