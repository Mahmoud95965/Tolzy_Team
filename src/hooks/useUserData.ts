import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { UserData, cachedUserData, activeUserDataPromises } from '../utils/userCache';

export const useUserData = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (forceRefresh = false) => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    const uid = user.uid;

    // 1. If we have cached data and are not forcing a refresh, use it immediately (Zero Firestore reads!)
    if (!forceRefresh && cachedUserData[uid]) {
      setUserData(cachedUserData[uid]);
      setLoading(false);
      return;
    }

    // 2. If there's an active fetch already running for this user, wait for it (Shared single read!)
    if (!forceRefresh && activeUserDataPromises[uid] !== undefined) {
      try {
        const data = await activeUserDataPromises[uid];
        if (data) {
          setUserData(data);
        }
      } catch (err) {
        console.error('Error waiting for active user data fetch:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 3. Otherwise, initiate a new fetch and store its promise
    const fetchPromise = (async () => {
      try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          cachedUserData[uid] = data;
          console.log(`[useUserData] Fetched data from Firestore for ${uid}:`, data);
          return data;
        } else {
          const defaultData: UserData = {
            email: user.email || '',
            firstName: '',
            lastName: '',
            displayName: user.displayName || user.email?.split('@')[0] || 'المستخدم',
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
            role: 'user',
            plan: 'free',
            copilotRequestCount: 0
          };
          cachedUserData[uid] = defaultData;
          return defaultData;
        }
      } catch (error) {
        console.error('Error fetching user data from Firestore:', error);
        // Fallback default data (return but do not cache to allow retry)
        const fallbackData: UserData = {
          email: user.email || '',
          firstName: '',
          lastName: '',
          displayName: user.displayName || user.email?.split('@')[0] || 'المستخدم',
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          role: 'user',
          plan: 'free',
          copilotRequestCount: 0
        };
        return fallbackData;
      } finally {
        // Clean up the active promise once it is settled
        delete activeUserDataPromises[uid];
      }
    })();

    activeUserDataPromises[uid] = fetchPromise;

    try {
      const data = await fetchPromise;
      if (data) {
        setUserData(data);
      }
    } catch (error) {
      // already logged inside fetchPromise
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  // Support force refresh to bypass cache explicitly when needed
  const forceRefreshData = () => fetchUserData(true);

  return { userData, loading, refreshUserData: forceRefreshData };
};
export type { UserData };
