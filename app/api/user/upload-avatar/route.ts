/**
 * POST /api/user/upload-avatar
 *
 * Secure server-side endpoint for uploading profile pictures / cover images.
 * ⛔ Enforces: the caller can ONLY write to their own UID folder in Supabase Storage.
 *
 * Request body (multipart/form-data):
 *   - file   : the image file
 *   - type   : "avatar" | "cover"
 *
 * Authorization header: Bearer <Firebase ID Token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/config/firebase-admin';
import { createClient } from '@supabase/supabase-js';

// Use the service-role key so we bypass anon RLS — but we enforce ownership ourselves
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = 'profile-images';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    // ── 1. Authenticate ──────────────────────────────────────────────────────
    const authHeader = req.headers.get('authorization') ?? '';
    const idToken = authHeader.replace('Bearer ', '').trim();

    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized — missing token' }, { status: 401 });
    }

    let decodedToken: { uid: string };
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: 'Unauthorized — invalid token' }, { status: 401 });
    }

    const ownerUid = decodedToken.uid;

    // ── 2. Parse form data ───────────────────────────────────────────────────
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) ?? 'avatar'; // "avatar" | "cover"

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // ── 3. Build a safe file path scoped to the owner's UID ─────────────────
    // Path: <ownerUid>/profile_<uid>_<ts>.webp  OR  <ownerUid>/cover_<uid>_<ts>.webp
    const prefix = type === 'cover' ? 'cover' : 'profile';
    const timestamp = Date.now();
    const fileName = `${prefix}_${ownerUid}_${timestamp}.webp`;
    const filePath = `${ownerUid}/${fileName}`; // ← always under owner's own folder

    // ── 4. Upload to Supabase Storage ────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return NextResponse.json({ publicUrl, filePath }, { status: 200 });

  } catch (err: any) {
    console.error('upload-avatar route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
