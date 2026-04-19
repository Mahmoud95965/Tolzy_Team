# 🎯 نظام العداد الديناميكي - عرض محدود ب 10 مشتركين Pro

## 📊 الميزة الجديدة

تم إضافة عداد ديناميكي يتتبع عدد المشتركين في باقة **Pro** باستخدام كود الخصم **MOFathy**.

### كيف يعمل؟

1. **تتبع العداد**: كل مشترك جديد في باقة Pro يزيد العداد بمقدار 1
2. **حد أقصى**: عندما يصل العداد إلى 10 مشتركين
3. **إلغاء العرض**: 
   - ❌ البرومو كود لا يعود يعمل
   - ❌ زر الشراء يصبح معطّل (disabled)
   - ⏹️ رسالة "انتهت جميع المقاعد" تظهر

---

## 🎨 التغييرات المرئية

### ✅ حالة النشاط (عدد المقاعد متاح)
```
🔥 عرض محدود: استخدم كود MOFathy بـ 219 ج.م
متبقي 7 مقاعد من 10 ⏳
```

### ❌ حالة الانتهاء (انتهت جميع المقاعد)
```
⏹️ تم بيع جميع المقاعد - العرض الخاص انتهى نهائياً! شكراً لك 🙏
```

---

## 🔧 الآلية التقنية

### API Endpoint
```
GET /api/promo/status
```

**الاستجابة**:
```json
{
  "mofathy_promo_count": 5,
  "is_available": true,
  "remaining_seats": 5,
  "promo_code": "MOFathy",
  "original_price": 299,
  "promo_price": 219,
  "discount_percentage": 26
}
```

### جدول Supabase
**اسم الجدول**: `promotions`

**الأعمدة**:
- `id` (int, primary key)
- `mofathy_promo_count` (int) - عدد المشتركين الحالي
- `is_available` (boolean) - حالة العرض

---

## 📝 خطوات الإعداد

### 1️⃣ إنشاء جدول في Supabase

افتح **Supabase SQL Editor** وشغّل:

```sql
-- إنشاء جدول promotions إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS promotions (
  id BIGINT PRIMARY KEY DEFAULT 1,
  mofathy_promo_count INT DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- أدخل صف واحد للبيانات
INSERT INTO promotions (id, mofathy_promo_count, is_available) 
VALUES (1, 0, TRUE)
ON CONFLICT (id) DO NOTHING;
```

### 2️⃣ التحقق من البيانات

شغّل في SQL Editor:

```sql
SELECT * FROM promotions WHERE id = 1;
```

يجب أن ترى:
```
id | mofathy_promo_count | is_available
1  | 0                   | true
```

---

## 🧪 الاختبار

### ✅ عندما تكون المقاعد متاحة

1. افتح `/pricing`
2. الباannر يظهر: "متبقي 10 مقاعد من 10"
3. البرومو كود MOFathy يعمل ✅
4. زر "انضم للمحترفين" مفعّل ✅

### ❌ عندما تنتهي المقاعد

1. عدّل جدول Supabase:
```sql
UPDATE promotions SET mofathy_promo_count = 10 WHERE id = 1;
```

2. أعد تحميل الصفحة `/pricing`
3. الباннر يظهر: "⏹️ تم بيع جميع المقاعد"
4. البرومو كود لا يعمل ❌
5. زر "🔴 انتهت المقاعد" معطّل ❌

---

## 🔄 تدفق الشراء

```
المستخدم يدخل MOFathy
        ↓
✓ يتحقق API من remaining_seats
        ↓
✓ إذا > 0، يسمح بالشراء
        ↓
✓ عند فتح واتساب، يزيد العداد +1
        ↓
✓ API تعيد remaining_seats الجديد
        ↓
✓ إذا remaining_seats = 0، يُلغي الكود
```

---

## 💾 إعادة تعيين العداد

إذا أردت إعادة تعيين العداد من جديد:

```sql
UPDATE promotions SET mofathy_promo_count = 0, is_available = TRUE WHERE id = 1;
```

---

## 📋 متغيرات مهمة

| المتغير | القيمة | الوصف |
|--------|--------|-------|
| الحد الأقصى | 10 | عدد المقاعد المتاحة |
| كود الخصم | MOFathy | الكود الصحيح |
| السعر الأصلي | 299 ج.م | بدون خصم |
| السعر المخفف | 219 ج.م | مع كود MOFathy |
| نسبة الخصم | 26% | توفير 80 ج.م |

---

## 🔔 ملاحظات مهمة

⚠️ **يجب أن يكون**:
- جدول `promotions` موجود في Supabase
- API endpoint `/api/promo/status` يعمل بدون أخطاء
- RLS disabled على bucket `payments` (إذا كنت تستخدم هذا الحل)

💡 **الميزات**:
- ✅ العداد يتحدّث في الوقت الفعلي
- ✅ API تحسب `remaining_seats` تلقائياً
- ✅ لا حاجة لتحديث يدوي للواجهة
- ✅ آمن ويعمل مع Supabase

---

## 📞 استكشاف الأخطاء

### المشكلة: العداد لا يتحدّث

**الحل**:
1. تحقق من جدول `promotions` في Supabase
2. تأكد من أن `remaining_seats` يُحسب بشكل صحيح
3. افتح console (F12) وابحث عن `✅ Promo counter updated`

### المشكلة: البرومو كود يعمل مع 0 مقاعد

**الحل**:
1. افتح console (F12)
2. اختبر API: `fetch('/api/promo/status').then(r => r.json()).then(console.log)`
3. تأكد من أن `is_available` يعيد `false`

### المشكلة: الواجهة لا تتحدّث تلقائياً

**الحل**:
1. اضغط F5 لإعادة تحميل الصفحة
2. API تعيد البيانات الجديدة
3. الواجهة تتحدّث تلقائياً

---

## 🚀 النسخة المستقبلية

يمكن تحسين النظام بـ:
- [ ] إضافة عداد لرموز خصم أخرى
- [ ] إشعارات بريدية عند اقتراب الانتهاء
- [ ] لوحة تحكم لإدارة العروض
- [ ] تقارير عن الاشتراكات

---

**تم الإعداد بنجاح! ✅**
