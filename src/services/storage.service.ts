export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    // التحقق من حجم الملف (الحد الأقصى 1MB)
    if (file.size > 1024 * 1024) {
      reject(new Error('حجم الصورة يجب أن يكون أقل من 1 ميجابايت'));
      return;
    }

    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('فشل تحويل الصورة'));
      }
    };
    reader.onerror = error => reject(error);
  });
};
