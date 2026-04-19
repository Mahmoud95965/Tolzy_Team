# نظام الخصم MOFathy - دليل الاختبار والإعدادات

## 📋 ملخص النظام

نظام خصم ديناميكي يعطي خصم 30% (السعر ينزل من 299 إلى 209 ج.م) عند إدخال كود `MOFATHY10`

---

## 🧪 اختبار المحلي (Local Testing)

### الخطوات:

1. **شغّل المشروع محلياً:**
   ```bash
   npm run dev
   ```

2. **اذهب إلى صفحة الأسعار:**
   ```
   http://localhost:3000/pricing
   ```

3. **اختبر الحالات:**

   **حالة 1: بدون كود خصم**
   - السعر يظهر: 299 ج.م
   - لا يوجد تأثير بصري خاص

   **حالة 2: إدخال كود خاطئ (مثلاً: "test")**
   - السعر يظهر: 299 ج.م
   - بدون تأثير

   **حالة 3: إدخال الكود الصحيح "MOFATHY10"**
   - السعر يتغير فوراً إلى: **209 ج.م** ✨
   - ظهور تاج "خصم 30%"
   - ظهور السعر الأصلي مع خط عبره
   - رسالة "وفّر 90 ج.م"
   - شريط FOMO: "متبقي من المقاعد..."

4. **اختبر عند الضغط على "اشترك في Pro":**
   - السعر في Modal يتحدث ديناميكياً
   - رسالة الواتس تحتوي على السعر الصحيح (209 أو 299)

---

## 🗄️ إعداد قاعدة البيانات (Supabase)

### 1. إنشاء جدول `promotions`:

```sql
CREATE TABLE IF NOT EXISTS promotions (
  id INT PRIMARY KEY DEFAULT 1,
  mofathy_promo_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- أدخل row واحد بقيمة ابتدائية:
INSERT INTO promotions (id, mofathy_promo_count) 
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;
```

### 2. RLS Policy (اختياري - للأمان):
إذا كانت RLS مفعلة، اسمح بالقراءة العامة:

```sql
CREATE POLICY "Allow public read" ON promotions
  FOR SELECT USING (true);
```

---

## 🔄 تحديث العداد (mofathy_promo_count)

### متى يتم التحديث؟
- **عند تفعيل باقة Pro للعميل** في لوحة التحكم (Admin)
- يتم إضافة +1 إلى `mofathy_promo_count`

### الكود SQL للتحديث اليدوي:
```sql
UPDATE promotions SET mofathy_promo_count = mofathy_promo_count + 1 WHERE id = 1;
```

### للتحقق من القيمة الحالية:
```sql
SELECT mofathy_promo_count FROM promotions WHERE id = 1;
```

---

## 🎨 المظهر البصري

### Banner FOMO (يظهر عند < 10):
```
🔥 عرض حصري محدود!
السعر 219 ج.م فقط بدلاً من 299!

متبقي: [رقم المقاعد]
```

### عرض السعر المخصص:
- لون أخضر جاذب للسعر الجديد
- السعر الأصلي مع خط عبره
- شارة "خصم 26%"

---

## ⚙️ API Endpoint

### `/api/promo/status`

**Response:**
```json
{
  "mofathy_promo_count": 3,
  "is_available": true,
  "remaining_seats": 7,
  "promo_code": "MOFATHY10",
  "original_price": 299,
  "promo_price": 209,
  "discount_percentage": 30
}
```

- `is_available`: true إذا كان < 10
- `remaining_seats`: عدد المقاعد المتبقية (10 - count)

---

## ✅ قائمة تحقق

- [ ] جدول `promotions` مُنشأ في Supabase
- [ ] Row واحد مع `id=1` و `mofathy_promo_count=0`
- [ ] API يجلب البيانات بدون أخطاء
- [ ] السعر 209 يظهر عند إدخال "MOFATHY10"
- [ ] FOMO banner يظهر عند < 10
- [ ] الخصم مطبق في رسالة الواتس
- [ ] لا توجد أخطاء في Console

---

## 🚀 الخطوات التالية (بعد الموافقة)

1. إنشاء Admin UI لزيادة العداد (+1) عند تفعيل Pro
2. رفع الـ Commit إلى GitHub
3. Deploy إلى Production

---

## 📝 ملاحظات

- الكود **غير حساس لحالة الأحرف**: `MOFATHY10` يعمل بأي شكل (كابيتال أو سمول)
- العداد ينخفض من 10 → 1 (عند الوصول 10، ينتهي العرض)
- كل مستخدم يرى المعلومات نفسها (العد المشترك)
