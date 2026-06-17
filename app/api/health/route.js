/**
 * GET /api/health
 *
 * Simple health-check endpoint. No DB call, no session.
 *
 * Test:
 *   GET http://localhost:3000/api/health → { ok: true }
 */
export async function GET() {
  return Response.json({ ok: true });
}
