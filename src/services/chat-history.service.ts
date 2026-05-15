import { 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  query,
  orderBy,
  deleteDoc,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatHistoryMessage extends ChatMessage {
  id?: string;
}

class ChatHistoryService {
  /**
   * حفظ رسالة جديدة للمستخدم
   */
  async saveMessage(userId: string, message: ChatMessage): Promise<void> {
    if (!userId) {
      console.warn('⚠️ لا يمكن حفظ الرسالة: المستخدم غير مسجل الدخول');
      return;
    }

    try {
      const messagesRef = collection(db, 'users', userId, 'chatHistory');
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await setDoc(doc(messagesRef, messageId), {
        role: message.role,
        content: message.content,
        timestamp: Timestamp.fromDate(message.timestamp),
        createdAt: Timestamp.now()
      });

      console.log('💾 تم حفظ الرسالة في Firebase');
    } catch (error) {
      console.error('❌ خطأ في حفظ الرسالة:', error);
      throw error;
    }
  }

  /**
   * حفظ عدة رسائل دفعة واحدة
   */
  async saveMessages(userId: string, messages: ChatMessage[]): Promise<void> {
    if (!userId) {
      console.warn('⚠️ لا يمكن حفظ الرسائل: المستخدم غير مسجل الدخول');
      return;
    }

    try {
      const messagesRef = collection(db, 'users', userId, 'chatHistory');
      
      // حفظ كل رسالة
      const savePromises = messages.map((message, index) => {
        const messageId = `msg_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
        return setDoc(doc(messagesRef, messageId), {
          role: message.role,
          content: message.content,
          timestamp: Timestamp.fromDate(message.timestamp),
          createdAt: Timestamp.now()
        });
      });

      await Promise.all(savePromises);
      console.log(`💾 تم حفظ ${messages.length} رسالة في Firebase`);
    } catch (error) {
      console.error('❌ خطأ في حفظ الرسائل:', error);
      throw error;
    }
  }

  /**
   * استرجاع جميع رسائل المستخدم
   */
  async getMessages(userId: string): Promise<ChatMessage[]> {
    if (!userId) {
      console.warn('⚠️ لا يمكن استرجاع الرسائل: المستخدم غير مسجل الدخول');
      return [];
    }

    try {
      const messagesRef = collection(db, 'users', userId, 'chatHistory');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);

      const messages: ChatMessage[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          role: data.role,
          content: data.content,
          timestamp: data.timestamp.toDate()
        };
      });

      console.log(`✅ تم تحميل ${messages.length} رسالة من Firebase`);
      return messages;
    } catch (error) {
      console.error('❌ خطأ في تحميل الرسائل:', error);
      return [];
    }
  }

  /**
   * حذف جميع رسائل المستخدم
   */
  async clearMessages(userId: string): Promise<void> {
    if (!userId) {
      console.warn('⚠️ لا يمكن حذف الرسائل: المستخدم غير مسجل الدخول');
      return;
    }

    try {
      const messagesRef = collection(db, 'users', userId, 'chatHistory');
      const snapshot = await getDocs(messagesRef);

      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      console.log('🗑️ تم حذف جميع الرسائل من Firebase');
    } catch (error) {
      console.error('❌ خطأ في حذف الرسائل:', error);
      throw error;
    }
  }

  /**
   * الاستماع للتغييرات في الوقت الفعلي
   */
  subscribeToMessages(
    userId: string, 
    callback: (messages: ChatMessage[]) => void
  ): Unsubscribe | null {
    if (!userId) {
      console.warn('⚠️ لا يمكن الاشتراك في الرسائل: المستخدم غير مسجل الدخول');
      return null;
    }

    try {
      const messagesRef = collection(db, 'users', userId, 'chatHistory');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: ChatMessage[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            role: data.role,
            content: data.content,
            timestamp: data.timestamp.toDate()
          };
        });

        callback(messages);
      }, (error) => {
        console.error('❌ خطأ في الاستماع للرسائل:', error);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ خطأ في إنشاء الاشتراك:', error);
      return null;
    }
  }

  /**
   * التحقق من وجود محادثات سابقة
   */
  async hasMessages(userId: string): Promise<boolean> {
    if (!userId) return false;

    try {
      const messagesRef = collection(db, 'users', userId, 'chatHistory');
      const snapshot = await getDocs(messagesRef);
      return !snapshot.empty;
    } catch (error) {
      console.error('❌ خطأ في التحقق من الرسائل:', error);
      return false;
    }
  }

  /**
   * الحصول على عدد الرسائل
   */
  async getMessageCount(userId: string): Promise<number> {
    if (!userId) return 0;

    try {
      const messagesRef = collection(db, 'users', userId, 'chatHistory');
      const snapshot = await getDocs(messagesRef);
      return snapshot.size;
    } catch (error) {
      console.error('❌ خطأ في حساب الرسائل:', error);
      return 0;
    }
  }
}

// تصدير instance واحد فقط (Singleton)
export const chatHistoryService = new ChatHistoryService();
