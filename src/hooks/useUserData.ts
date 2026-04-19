import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  role: string;
  copilotRequestCount?: number;
  lastCopilotRequestDate?: any;
}

export const useUserData = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        console.log(`[useUserData] Fetched data for ${user.uid}:`, data);
        setUserData(data);
      } else {
        setUserData({
          email: user.email || '',
          firstName: '',
          lastName: '',
          displayName: user.displayName || user.email?.split('@')[0] || 'المستخدم',
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          role: 'user',
          copilotRequestCount: 0
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData({
        email: user.email || '',
        firstName: '',
        lastName: '',
        displayName: user.displayName || user.email?.split('@')[0] || 'المستخدم',
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        role: 'user',
        copilotRequestCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  return { userData, loading, refreshUserData: fetchUserData };
};
