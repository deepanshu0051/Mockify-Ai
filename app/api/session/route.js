/**
 * GET /api/session
 *
 * Returns the current anonymous session ID.
 * If no session cookie exists, generates a new UUID and sets it.
 *
 * Test:
 *   GET http://localhost:3000/api/session → { sessionId: "uuid..." }
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOrCreateSessionId, setSessionCookie } from '@/lib/session';

const COOKIE_NAME = 'mockify_session';

export async function GET() {
  try {
    // Check if cookie already exists
    const cookieStore = await cookies();
    const existing = cookieStore.get(COOKIE_NAME);

    const sessionId = await getOrCreateSessionId();

    // If the cookie was already present, return a plain response
    if (existing?.value) {
      return Response.json({ sessionId });
    }

    // New session — attach the cookie to the response
    const response = NextResponse.json({ sessionId });
    setSessionCookie(response, sessionId);
    return response;
  } catch (error) {
    console.error('[/api/session] Error:', error);
    return Response.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
