# 🔧 حل مشكلة: Table not found in schema cache

## المشكلة:
```
Table not found. Please run Supabase migration: 
Could not find the table 'public.user_limits' in the schema cache
```

**لماذا يحدث؟**
- الجدول يوجد في Supabase لكن الـ cache لم يتحدّث
- Supabase أحياناً تخزّن معلومات الجداول في الذاكرة المؤقتة

---

## ✅ الحل: خطوة بخطوة

### الخطوة 1️⃣: اذهب إلى Supabase

1. افتح [Supabase](https://supabase.com/dashboard)
2. اختر مشروع Tolzy
3. انقر على **SQL Editor** في اليسار
4. ستشوف زر **New Query**

### الخطوة 2️⃣: شغّل سكريبت الفحص

انسخ الكود أسفل وشغّله في SQL Editor:

```sql
-- 1. تحقق من وجود الجدول
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_limits'
) AS table_exists;
```

**النتيجة المتوقعة:** `table_exists = true`

✅ إذا ظهرت `true` → الجدول موجود، تابع للخطوة 3

❌ إذا ظهرت `false` → الجدول غير موجود، انتقل للخطوة 5

---

### الخطوة 3️⃣: إذا كان الجدول موجود - أعد بناء الـ Cache

شغّل هذا السكريبت:

```sql
-- إعادة بناء الـ index لتحديث الـ cache
REINDEX TABLE public.user_limits;

-- تحقق من أن البيانات موجودة
SELECT COUNT(*) as total_records FROM public.user_limits;
```

بعدها انتظر 30 ثانية واختبر الـ API مرة أخرى.

---

### الخطوة 4️⃣: إذا استمرت المشكلة - استخدم Workaround

إذا كان الـ cache قديم جداً، جرّب:

```sql
-- أضف صف جديد لتحديث الـ cache
INSERT INTO public.user_limits (user_id, plan) 
VALUES ('cache-update-' || NOW()::text, 'free')
ON CONFLICT (user_id) DO NOTHING;

-- تحقق من النتيجة
SELECT * FROM public.user_limits ORDER BY created_at DESC LIMIT 5;
```

---

### الخطوة 5️⃣: إذا كان الجدول غير موجود

شغّل السكريبت الكامل من [supabase_fix_cache.sql](../supabase_fix_cache.sql) 

أو انسخ هذا مباشرة:

```sql
DROP TABLE IF EXISTS public.user_limits CASCADE;

CREATE TABLE public.user_limits (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'free' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.user_limits IS 'Stores user subscription plan information';
COMMENT ON COLUMN public.user_limits.user_id IS 'Firebase user UID';
COMMENT ON COLUMN public.user_limits.plan IS 'Subscription plan tier';
COMMENT ON COLUMN public.user_limits.created_at IS 'Timestamp when subscription was created';
COMMENT ON COLUMN public.user_limits.updated_at IS 'Timestamp when subscription was last updated';

ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous and service role to read user_limits"
ON public.user_limits FOR SELECT USING (true);

CREATE POLICY "Allow service role to manage user_limits"
ON public.user_limits USING (auth.role() = 'service_role');

CREATE INDEX idx_user_limits_user_id ON public.user_limits(user_id);

ALTER TABLE public.user_limits GRANT SELECT ON public.user_limits TO authenticated;
```

---

## 🧪 التحقق من النجاح

بعد تشغيل السكريبت:

1. افتح `/admin/users` في التطبيق
2. يجب أن ترى قائمة المستخدمين بدون خطأ
3. جرّب تحديث خطة مستخدم

**النتيجة المتوقعة:** ✅ تحديث ناجح

---

## 🆘 إذا استمرت المشكلة

1. **تحقق من متغيرات البيئة على Vercel:**
   - `NEXT_PUBLIC_BILLING_SUPABASE_URL` موجود؟
   - `BILLING_SUPABASE_SERVICE_ROLE_KEY` موجود؟

2. **أعد تشغيل التطبيق:**
   ```bash
   npm run build
   npm run dev
   ```

3. **اختبر الاتصال محليًا:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/admin/users
   ```

4. **شيء أخطاء Vercel:**
   - اذهب إلى Vercel Dashboard
   - Deployments → آخر deployment
   - انقر Logs → Function Logs
   - ابحث عن أي رسائل خطأ

---

## 📝 ملاحظات مهمة

✅ **بعد تصحيح الـ Cache:**
- قد يستغرق 1-2 دقيقة حتى تصبح التغييرات نشطة
- قد تحتاج إلى Ctrl+Shift+R لتحديث المتصفح
- قد تحتاج إلى redeploy على Vercel

❌ **مشاكل شائعة:**
- Service Role Key غير صحيح
- متغيرات البيئة ناقصة على Vercel
- Supabase Project معلق أو غير منشط
- RLS policies تحظر الوصول

---

## 🎯 الملخص

| الحالة | الحل |
|-------|------|
| الجدول موجود، لكن خطأ cache | `REINDEX TABLE` |
| الجدول غير موجود | شغّل السكريبت الكامل |
| محليًا يعمل، Vercel لا | تحقق من متغيرات البيئة |
| الخطأ يستمر | اتصل بـ Supabase support |

---

## 💡 نصيحة نهائية

إذا أردت التأكد من أن كل شيء يعمل:

```sql
-- اختبر سريع شامل
WITH check_table AS (
  SELECT EXISTS(
    SELECT FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='user_limits'
  ) AS exists
),
check_columns AS (
  SELECT COUNT(*) as col_count FROM information_schema.columns 
  WHERE table_name='user_limits'
),
check_data AS (
  SELECT COUNT(*) as record_count FROM public.user_limits
)
SELECT 
  (SELECT exists FROM check_table) as table_exists,
  (SELECT col_count FROM check_columns) as column_count,
  (SELECT record_count FROM check_data) as record_count;
```

يجب أن ترى: `table_exists=true, column_count=5, record_count≥0`
