import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabaseServer from '@/lib/supabaseServer';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionIdCookie = cookieStore.get('mockify_session');
    
    if (!sessionIdCookie || !sessionIdCookie.value) {
      return NextResponse.json({ ok: true, note: 'No active session found' });
    }
    
    const sessionId = sessionIdCookie.value;

    // 1. Fetch resumes associated with this session to find Cloudinary assets
    const { data: resumes } = await supabaseServer
      .from('resumes')
      .select('cloudinary_public_id')
      .eq('session_id', sessionId)
      .not('cloudinary_public_id', 'is', null);

    // 2. Destroy Cloudinary assets if any exist
    if (resumes && resumes.length > 0) {
      await Promise.all(
        resumes.map(async (resume) => {
          if (resume.cloudinary_public_id) {
            try {
              await cloudinary.uploader.destroy(resume.cloudinary_public_id);
            } catch (err) {
              console.warn(`[Cleanup] Failed to delete image ${resume.cloudinary_public_id} from Cloudinary:`, err);
            }
          }
        })
      );
    }

    // 3. Delete database rows
    // Because interview_answers & interview_questions cascade from interviews:
    // We only need to delete interviews, then resumes.
    await supabaseServer
      .from('interviews')
      .delete()
      .eq('session_id', sessionId);

    await supabaseServer
      .from('resumes')
      .delete()
      .eq('session_id', sessionId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[/api/session/end] Unexpected error:', error);
    // Best-effort endpoint, never fail hard
    return NextResponse.json({ ok: true, debug_error: error.message });
  }
}
