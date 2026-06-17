/**
 * Anonymous session utilities for Mockify-AI.
 * Uses Next.js 16 async cookies() API from 'next/headers'.
 *
 * getOrCreateSessionId() — read-only, usable in Server Components and Route Handlers.
 * setSessionCookie()     — write operation, must only be called from Route Handlers or Server Functions.
 */
import { cookies } from 'next/headers';

const COOKIE_NAME = 'mockify_session';

/**
 * Returns the existing session ID from the cookie, or generates and returns a new UUID.
 * NOTE: This function only READS. Writing happens in setSessionCookie().
 *
 * @returns {Promise<string>} The session ID.
 */
export async function getOrCreateSessionId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME);
  if (existing?.value) {
    return existing.value;
  }
  // Generate a new UUID for anonymous sessions
  return crypto.randomUUID();
}

/**
 * Writes the session cookie onto a NextResponse object.
 * Call this from a Route Handler after generating a new sessionId.
 *
 * @param {import('next/server').NextResponse} response - The response to attach the cookie to.
 * @param {string} sessionId - The session UUID to store.
 * @returns {import('next/server').NextResponse} The same response with the cookie header set.
 */
export function setSessionCookie(response, sessionId) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    // 30 day session
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
