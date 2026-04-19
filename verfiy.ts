import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sha256, timingSafeEqualHex } from '@/lib/security';
import { checkRateLimit, secureJson } from '@/lib/http-security';

/**
 * POST /api/integrate/verify
 * Body: { projectId: string, apiKey: string }
 *
 * Verifies a project's identity using their projectId + raw apiKey.
 * Returns the project name and allowed_origin on success (no secrets exposed).
 */
export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    const rl = checkRateLimit(`integrate-verify:${clientIp}`, 10, 60_000);
    if (!rl.ok) {
      return secureJson(
        { error: 'Too many requests. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const projectId = String(body?.projectId || '').trim();
    const apiKey = String(body?.apiKey || '').trim();

    if (!projectId || !apiKey) {
      return secureJson(
        { error: 'projectId and apiKey are required.' },
        { status: 400 }
      );
    }

    // Look up the project
    const { data: project, error: dbErr } = await supabaseAdmin
      .from('integration_projects')
      .select('project_id, project_name, api_key_hash, status, allowed_origin')
      .eq('project_id', projectId)
      .maybeSingle();

    if (dbErr) {
      console.error('DB error:', dbErr);
      return secureJson({ error: 'Database error.' }, { status: 500 });
    }

    if (!project || project.status !== 'active') {
      // Timing-safe: always hash before returning
      sha256(apiKey);
      return secureJson({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Verify the raw API key against the stored hash
    const apiKeyHash = sha256(apiKey);
    const isValid = timingSafeEqualHex(apiKeyHash, project.api_key_hash);

    if (!isValid) {
      return secureJson({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Success — return safe project info (no secret, no hash)
    return secureJson({
      ok: true,
      projectId: project.project_id,
      projectName: project.project_name,
      allowedOrigin: project.allowed_origin || null,
    });
  } catch (err: any) {
    console.error('Verify error:', err);
    return secureJson({ error: 'Unexpected error.' }, { status: 500 });
  }
}
