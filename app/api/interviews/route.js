/**
 * POST /api/interviews
 *
 * Creates a new interview record in Supabase.
 *
 * Body (JSON):
 *   { resumeId?: string, role?: string, difficulty?: string, mode?: string }
 *
 * Returns:
 *   { interviewId: "uuid..." }
 *
 * Test:
 *   POST http://localhost:3000/api/interviews
 *   Content-Type: application/json
 *   Body: { "role": "Frontend Developer", "difficulty": "easy", "mode": "text" }
 *   → { interviewId: "uuid..." }
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOrCreateSessionId, setSessionCookie } from '@/lib/session';
import supabaseServer from '@/lib/supabaseServer';

const COOKIE_NAME = 'mockify_session';

export async function POST(request) {
  try {
    // ── Parse request body ──────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return Response.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { resumeId, role, difficulty, mode } = body;

    // ── Session ─────────────────────────────────────────
    const cookieStore = await cookies();
    const existingCookie = cookieStore.get(COOKIE_NAME);
    const sessionId = await getOrCreateSessionId();

    // ── Insert into Supabase ────────────────────────────
    const { data, error: dbError } = await supabaseServer
      .from('interviews')
      .insert({
        session_id: sessionId,
        resume_id: resumeId || null,
        role: role || null,
        difficulty: difficulty || null,
        mode: mode || null,
        status: 'in_progress',
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('[/api/interviews] Supabase error:', dbError);
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // ── Build response ──────────────────────────────────
    const payload = { interviewId: data.id };

    // If this was a new session, set the cookie
    if (!existingCookie?.value) {
      const response = NextResponse.json(payload, { status: 201 });
      setSessionCookie(response, sessionId);
      return response;
    }

    return Response.json(payload, { status: 201 });
  } catch (error) {
    console.error('[/api/interviews] Unexpected error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
