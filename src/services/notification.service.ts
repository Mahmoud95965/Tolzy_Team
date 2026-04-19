import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Notification {
  id?: string;
  userId: string;
  type: 'tool_approved' | 'tool_rejected';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  toolName?: string;
  toolId?: string;
}

export const sendNotification = async (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      ...notification,
      read: false,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId: string) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};