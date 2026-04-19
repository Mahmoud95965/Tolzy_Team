import { addAdmin } from '../utils/adminUtils';

// استبدل هذا المعرف بمعرف المستخدم الذي تريد جعله مسؤولاً
const ADMIN_USER_ID = 'YOUR_USER_ID_HERE';

(async () => {
  try {
    await addAdmin(ADMIN_USER_ID);
    console.log('تم إضافة المسؤول بنجاح!');
  } catch (error) {
    console.error('حدث خطأ:', error);
  }
})();
