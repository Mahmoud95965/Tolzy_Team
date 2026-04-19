# 🔧 حل مشكلة Bucket Not Found وRLS في Supabase

## المشاكل الشائعة

1. **Bucket not found** - الـ bucket غير موجود
2. **row-level security policy** - إعدادات الأمان خاطئة
3. **unauthorized/forbidden** - لا توجد صلاحية

---

## ✅ الحل الكامل

### الخطوة 1️⃣: إنشاء Bucket في Supabase

1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر مشروعك (tolzy)
3. انقر على **Storage** من القائمة الجانبية
4. انقر على زر **Create a new bucket**
5. ملئ البيانات كما يلي:
   - **Bucket name**: `payments`
   - **Public bucket**: ✅ أختر "No" ثم سنضيف RLS policies
6. انقر **Create bucket**

### الخطوة 2️⃣: إعدادات الأمان (RLS) - الطريقة الصحيحة

#### ⚠️ تعطيل RLS (للتطوير السريع - غير آمن للإنتاج)

1. افتح الـ bucket `payments`
2. انقر على **Policies** 
3. اختر **Disable RLS** (سيسمح بالرفع من أي مكان)
4. **تحذير**: هذا غير آمن! استخدمه فقط للتطوير

#### ✅ الطريقة الآمنة - RLS Policies الصحيحة

**❌ المشكلة**: استخدام `auth.uid() = owner` يسبب خطأ لأن حقل `owner` ليس متاح بهذا الشكل في جدول التخزين.

**✅ الحل الصحيح**: استخدم السياسات البسيطة والفعالة التالية:

1. افتح الـ bucket `payments`
2. انقر على **Policies** tab
3. اضغط **New Policy** واختر **For full customization**

**السياسة #1: الرفع (INSERT)**
- **Policy name**: `Allow authenticated upload`
- **Allowed operations**: اختر ✅ INSERT فقط
- **Target role**: اختر `authenticated`
- **Using expression**: اترك فارغ أو اكتب `true`
- **With check expression**: انسخ ودصق:
```sql
bucket_id = 'payments' AND auth.role() = 'authenticated'
```
- اضغط **Review** ثم **Save**

**السياسة #2: القراءة (SELECT)**
- **Policy name**: `Allow read payments`
- **Allowed operations**: اختر ✅ SELECT فقط  
- **Target role**: اختر `anon` (للقراءة)
- **With check expression**: انسخ:
```sql
bucket_id = 'payments'
```
- اضغط **Review** ثم **Save**

✅ **في النهاية يجب تكون عندك سياستين بالظبط** وليس أكثر!

---

## ⚠️ و إذا حصل الخطأ: "new row violates row-level security policy"

**السبب**: السياسات غير صحيحة أو استخدمت شروط معقدة مثل `auth.uid() = owner`.

**الحل**:
1. اذهب إلى Storage → `payments` bucket  
2. اضغط **Policies**
3. **احذف كل السياسات الموجودة** (Delete كل واحدة)
4. أضف السياستين الصحيحتين من الأعلى بالضبط:
   - `Allow authenticated upload` (INSERT)
   - `Allow read payments` (SELECT)

---

## 🎯 الحل السريع (للتطوير)

إذا أردت حلاً سريعاً للتطوير، استخدم Supabase UI مباشرة:

1. اذهب إلى Storage → `payments` bucket
2. انقر على **Policies** tab
3. انقر **Edit RLS** أو **Disable RLS** إذا كانت الخيار موجود
4. أعد تحميل الصفحة

**ملاحظة**: لا تحتاج SQL - استخدم الواجهة الرسومية فقط ✅

إذا رأيت خطأ `ERROR: 42501`, هذا يعني:
- ❌ أنت لا تملك صلاحية تنفيذ SQL على جدول storage.objects
- ✅ الحل: استخدم Supabase UI بدلاً من SQL

---

## 🚀 الخطوة 3️⃣: اختبار الحل

```bash
npm run build
npm run dev
```

ثم اذهب إلى `http://localhost:3000/pricing` وحاول:
1. إدخال كود MOFathy
2. الضغط على "اشترك الآن"
3. ملء البيانات
4. اختيار صورة إيصال
5. الضغط على "إرسال عبر واتساب"

✅ يجب أن يعمل بدون أخطاء

---

## 🛡️ رسائل الخطأ الجديدة

| الرسالة | السبب | الحل |
|--------|------|------|
| "خادم التخزين غير متوفر" | Bucket غير موجود | أنشئ bucket |
| "مشكلة في إعدادات الأمان" | RLS غير معدّ | فعّل RLS policies |
| "لا توجد صلاحية" | Wrong RLS config | استخدم SQL أعلاه |
| "الملف كبير جداً" | >5MB | اختر صورة أصغر |

---

## 📋 Checklist الإصلاح

- [ ] تم إنشاء bucket `payments`
- [ ] تم تعطيل RLS أو إضافة policies صحيحة
- [ ] تم اختبار الرفع
- [ ] رسالة WhatsApp تظهر بنجاح
- [ ] البيانات تُسجل بشكل صحيح

---

## 💡 نصائح مهمة

1. **للتطوير**: عطّل RLS للسرعة
2. **للإنتاج**: استخدم RLS policies أمنة
3. **للتصحيح**: افتح DevTools Console لرؤية الأخطاء الدقيقة
4. **للنسخ الاحتياطي**: احفظ الإيصالات في Supabase والبيانات في Firestore

---

## 🔗 الملفات المرتبطة

- `app/pricing/page.tsx` - صفحة التسعير (تم تحديثها)
- `.env.local` - متغيرات البيئة

---

**تم حل المشكلة! ✨**
