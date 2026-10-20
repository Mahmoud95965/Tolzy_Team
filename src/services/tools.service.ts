import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, DocumentData, QueryDocumentSnapshot, startAfter, DocumentSnapshot, getCountFromServer } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { Tool } from '../types/index';
import { 
  getFallbackTools, 
  getFallbackToolById, 
  getFallbackFeaturedTools, 
  getFallbackPopularTools, 
  getFallbackNewTools, 
  getFallbackCategoryCount, 
  getFallbackTotalCount 
} from '../data/fallbackTools';

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

function getPaginatedFallback(pageSize: number, startAfterParam?: any, category?: string | null): PaginatedToolsResult {
  let all = getFallbackTools();
  if (category && category !== 'All') {
    all = all.filter(t => {
      const cats = Array.isArray(t.category) ? t.category : [t.category];
      return cats.some(c => String(c).toLowerCase() === category.toLowerCase());
    });
  }

  let startIndex = 0;
  if (startAfterParam) {
    const afterId = Array.isArray(startAfterParam) 
      ? startAfterParam[0] 
      : (typeof startAfterParam === 'object' ? startAfterParam.id : startAfterParam);
    const foundIdx = all.findIndex(t => t.id === afterId);
    if (foundIdx !== -1) {
      startIndex = foundIdx + 1;
    }
  }

  const paged = all.slice(startIndex, startIndex + pageSize);
  const lastTool = paged.length > 0 ? paged[paged.length - 1] : null;

  return {
    tools: paged,
    lastDoc: lastTool as any,
    hasMore: startIndex + pageSize < all.length
  };
}

export const getCategoryCount = async (categoryInput: any): Promise<number> => {
  const category = typeof categoryInput === 'object' ? categoryInput?.category : categoryInput;
  if (!category || typeof category !== 'string' || category === 'All') {
    return getFallbackTotalCount();
  }

  const cached = categoryCountCache.get(category);
  if (cached && Date.now() - cached.timestamp < CATEGORY_COUNT_TTL_MS) {
    return cached.value;
  }

  if (!isFirebaseConfigured) {
    const fallbackCount = getFallbackCategoryCount(category);
    categoryCountCache.set(category, { value: fallbackCount, timestamp: Date.now() });
    return fallbackCount;
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
      console.warn('⚠️ getCategoryCount Firestore error, using fallback count:', error);
      const fallbackCount = getFallbackCategoryCount(category);
      categoryCountCache.set(category, { value: fallbackCount, timestamp: Date.now() });
      return fallbackCount;
    } finally {
      categoryCountInFlight.delete(category);
    }
  })();

  categoryCountInFlight.set(category, promise);
  return promise;
};

let totalToolsCountCache: { value: number; timestamp: number } | null = null;
let totalToolsCountInFlight: Promise<number> | null = null;

export const getTotalToolsCount = async (): Promise<number> => {
  if (totalToolsCountCache && Date.now() - totalToolsCountCache.timestamp < CATEGORY_COUNT_TTL_MS) {
    return totalToolsCountCache.value;
  }

  if (!isFirebaseConfigured) {
    return getFallbackTotalCount();
  }

  if (totalToolsCountInFlight) {
    return totalToolsCountInFlight;
  }

  totalToolsCountInFlight = (async () => {
    try {
      const toolsRef = collection(db, 'tools');
      const snapshot = await getCountFromServer(toolsRef);
      const value = snapshot.data().count;
      totalToolsCountCache = { value: value || 1024, timestamp: Date.now() };
      return totalToolsCountCache.value;
    } catch (error) {
      console.warn('⚠️ getTotalToolsCount Firestore error, using fallback count:', error);
      return 1024;
    } finally {
      totalToolsCountInFlight = null;
    }
  })();

  return totalToolsCountInFlight;
};

export const getPaginatedTools = async (
  pageSize: number = 20,
  startAfterParam?: any,
  categoryFilterParam?: any
): Promise<PaginatedToolsResult> => {
  let category = null;

  if (categoryFilterParam && typeof categoryFilterParam === 'object') {
    category = categoryFilterParam.category;
  } else if (typeof categoryFilterParam === 'string') {
    category = categoryFilterParam;
  }

  if (startAfterParam && typeof startAfterParam === 'object' && !startAfterParam.data && !Array.isArray(startAfterParam)) {
    category = category || startAfterParam.category;
    startAfterParam = null;
  }

  if (typeof category !== 'string' || category === 'All') {
    category = null;
  }

  if (!isFirebaseConfigured) {
    return getPaginatedFallback(pageSize, startAfterParam, category);
  }

  try {
    const toolsRef = collection(db, 'tools');
    const baseConstraints: any[] = [];

    baseConstraints.push(orderBy('__name__'));
    baseConstraints.push(limit(pageSize));

    if (startAfterParam) {
      if (Array.isArray(startAfterParam)) {
        baseConstraints.push(startAfter(...startAfterParam));
      } else {
        baseConstraints.push(startAfter(startAfterParam));
      }
    }

    if (!category) {
      const snapshot = await getDocs(query(toolsRef, ...baseConstraints));
      if (snapshot.empty) {
        return getPaginatedFallback(pageSize, startAfterParam, category);
      }
      const tools = snapshot.docs.map(convertFirestoreDoc);
      return {
        tools,
        lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
        hasMore: snapshot.docs.length === pageSize
      };
    }

    const arrayConstraints = [where('category', 'array-contains', category), ...baseConstraints];
    const stringConstraints = [where('category', '==', category), ...baseConstraints];

    const [snapshotArray, snapshotString] = await Promise.all([
      getDocs(query(toolsRef, ...arrayConstraints)),
      getDocs(query(toolsRef, ...stringConstraints))
    ]);

    const mergedDocsMap = new Map<string, QueryDocumentSnapshot<DocumentData>>();
    snapshotArray.docs.forEach(d => mergedDocsMap.set(d.id, d));
    snapshotString.docs.forEach(d => mergedDocsMap.set(d.id, d));

    if (mergedDocsMap.size === 0) {
      return getPaginatedFallback(pageSize, startAfterParam, category);
    }

    const mergedDocs = Array.from(mergedDocsMap.values()).sort((a, b) => a.id.localeCompare(b.id));
    const pageDocs = mergedDocs.slice(0, pageSize);

    return {
      tools: pageDocs.map(convertFirestoreDoc),
      lastDoc: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null,
      hasMore: snapshotArray.docs.length === pageSize || snapshotString.docs.length === pageSize
    };
  } catch (error) {
    console.warn('⚠️ getPaginatedTools Firestore error, falling back to local tools dataset:', error);
    return getPaginatedFallback(pageSize, startAfterParam, category);
  }
};

export const getFeaturedTools = async (maxTools: number = 4): Promise<Tool[]> => {
  if (!isFirebaseConfigured) {
    return getFallbackFeaturedTools(maxTools);
  }

  try {
    const q = query(collection(db, 'tools'), where('isFeatured', '==', true), limit(maxTools * 2));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getFallbackFeaturedTools(maxTools);
    }
    const tools = snapshot.docs.map(convertFirestoreDoc);
    return tools.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, maxTools);
  } catch (error) {
    console.warn('⚠️ getFeaturedTools Firestore error, using fallback featured tools:', error);
    return getFallbackFeaturedTools(maxTools);
  }
};

export const getPopularTools = async (maxTools: number = 4): Promise<Tool[]> => {
  if (!isFirebaseConfigured) {
    return getFallbackPopularTools(maxTools);
  }

  try {
    const q = query(collection(db, 'tools'), where('isPopular', '==', true), limit(maxTools * 2));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getFallbackPopularTools(maxTools);
    }
    const tools = snapshot.docs.map(convertFirestoreDoc);
    return tools.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, maxTools);
  } catch (error) {
    console.warn('⚠️ getPopularTools Firestore error, using fallback popular tools:', error);
    return getFallbackPopularTools(maxTools);
  }
};

export const getNewTools = async (maxTools: number = 4): Promise<Tool[]> => {
  if (!isFirebaseConfigured) {
    return getFallbackNewTools(maxTools);
  }

  try {
    const q = query(collection(db, 'tools'), where('isNew', '==', true), limit(maxTools * 2));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getFallbackNewTools(maxTools);
    }
    const tools = snapshot.docs.map(convertFirestoreDoc);
    return tools.sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return dateB - dateA;
    }).slice(0, maxTools);
  } catch (error) {
    console.warn('⚠️ getNewTools Firestore error, using fallback new tools:', error);
    return getFallbackNewTools(maxTools);
  }
};

export const getToolById = async (id: string): Promise<Tool | null> => {
  if (!isFirebaseConfigured) {
    return getFallbackToolById(id);
  }

  try {
    const snapshot = await getDoc(doc(db, 'tools', id.toString().padStart(3, '0')));
    if (snapshot.exists()) {
      return { ...snapshot.data(), id: snapshot.id } as Tool;
    }
    return getFallbackToolById(id);
  } catch (error) {
    console.warn('⚠️ getToolById Firestore error, checking fallback tools:', error);
    return getFallbackToolById(id);
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