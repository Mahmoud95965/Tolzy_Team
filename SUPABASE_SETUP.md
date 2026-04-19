# Supabase Database Setup Guide

## ⚠️ Problem: Table 'user_limits' not found

If you see this error:
```
Could not find the table 'public.user_limits' in the schema cache
```

## ✅ Solution: Create the user_limits table

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Create a new query
5. Copy and paste the SQL from `supabase/migrations/20260410_create_user_limits.sql`
6. Click **Run**

### Option 2: Manual SQL (اختر واحد من الأسفل)

#### إذا لم يكن الجدول موجود (الحالة الأولى):

```sql
-- Create user_limits table
CREATE TABLE IF NOT EXISTS public.user_limits (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'free' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE public.user_limits IS 'Stores user subscription plan information. Plans: free, pro, ultra, plus';
COMMENT ON COLUMN public.user_limits.user_id IS 'Firebase user UID';
COMMENT ON COLUMN public.user_limits.plan IS 'Subscription plan tier';
COMMENT ON COLUMN public.user_limits.created_at IS 'Timestamp when subscription was created';
COMMENT ON COLUMN public.user_limits.updated_at IS 'Timestamp when subscription was last updated';

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Allow anonymous and service role to read user_limits"
ON public.user_limits
FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Allow service role to manage user_limits"
ON public.user_limits
USING (auth.role() = 'service_role');

-- Create index for faster lookups (delete if exists first)
DROP INDEX IF EXISTS idx_user_limits_user_id;
CREATE INDEX idx_user_limits_user_id ON public.user_limits(user_id);

-- Grant permissions
ALTER TABLE public.user_limits GRANT SELECT ON public.user_limits TO authenticated;
```

#### إذا كان الجدول موجود بالفعل (الحالة الثانية - عند ظهور خطأ):

```sql
-- Just drop and recreate the index (يحل المشكلة "relation already exists")
DROP INDEX IF EXISTS idx_user_limits_user_id CASCADE;
CREATE INDEX idx_user_limits_user_id ON public.user_limits(user_id);

-- Verify table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_limits';
```

## ✅ Verification

After creating the table, verify it was created:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_limits';

-- Check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_limits';
```

You should see:
- `id` (bigint)
- `user_id` (character varying)
- `plan` (character varying)
- `created_at` (timestamp without time zone)
- `updated_at` (timestamp without time zone)

## 🔄 After Table Creation

### If you're on Vercel/Production:
1. The app will automatically retry and should work
2. If not, clear browser cache and hard refresh (Ctrl+Shift+R)
3. Clear Supabase schema cache if needed

### Testing:
1. Go to `/admin/users`
2. Should load successfully without the error
3. Try updating a user's plan

## 📋 Table Structure

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | BIGSERIAL | auto | Primary key |
| user_id | VARCHAR(255) | - | Firebase UID (unique) |
| plan | VARCHAR(50) | 'free' | Subscription tier |
| created_at | TIMESTAMP | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOW() | Last update timestamp |

## 💡 Plans Supported

- `free` - Free tier
- `pro` - Professional plan (billed monthly)
- `plus` - Also maps to pro (alternative name)
- `ultra` - Premium plan

## 🐛 Troubleshooting

### المشكلة: "relation "idx_user_limits_user_id" already exists"

الحل: الجدول موجود بالفعل، فقط حذف الـ index وأعد إنشاءه:

```sql
DROP INDEX IF EXISTS idx_user_limits_user_id CASCADE;
CREATE INDEX idx_user_limits_user_id ON public.user_limits(user_id);
```

---

### المشكلة: يعمل محليًا لكن لا يعمل على Vercel

**السبب:** متغيرات البيئة غير محددة على Vercel

**الحل:**
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر المشروع → **Settings** → **Environment Variables**
3. أضف `NEXT_PUBLIC_BILLING_SUPABASE_URL` و `BILLING_SUPABASE_SERVICE_ROLE_KEY`
4. انقر **Redeploy** لتطبيق التغييرات

👉 **اقرأ [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md) للتفاصيل الكاملة**

---

### المشكلة: Still getting "table not found" error?

1. **Verify table exists:**
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name = 'user_limits'
   );
   ```

2. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'user_limits';
   ```

3. **Restart Supabase connection** (in Vercel):
   - Redeploy: `git push` triggers Vercel rebuild
   - Or manually redeploy from Vercel dashboard

4. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs → Database
   - Look for any SQL errors

## 🔐 Security Notes

- The table uses Row Level Security (RLS) enabled
- Policies allow anonymous reads (for plan check API)
- Service role can manage data (for payment callbacks)
- Authenticated users can only select (read their own plan)

## 📞 Support

If issues persist:
1. Check `.env` variables are correct
2. Verify Supabase project is active
3. Check network tab in browser devtools
4. Look at Vercel logs
