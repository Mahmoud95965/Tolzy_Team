import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const addAdmin = async (userId: string): Promise<void> => {
  try {
    const adminDocRef = doc(db, 'admins', userId);
    await setDoc(adminDocRef, {
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    console.log('تم إضافة المستخدم كمسؤول بنجاح');
  } catch (error) {
    console.error('خطأ في إضافة المسؤول:', error);
    throw error;
  }
};