export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getOrCreateSessionId, setSessionCookie } from '@/lib/session';
import supabaseServer from '@/lib/supabaseServer';
import { v2 as cloudinary } from 'cloudinary';
import { analyzeResumeWithGroq } from '@/lib/groqResumeAnalysis';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Step 1: PDF Text Extraction
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text = '';
    try {
      const mod = await import('pdf-parse/lib/pdf-parse.js');
      const pdfParse = mod.default ?? mod;
      const parsed = await pdfParse(buffer);
      text = parsed.text || "";
    } catch (e) {
      console.error('[/api/resumes/process] PDF parse error:', e);
      return NextResponse.json({ 
        ok: false, 
        reason: "PDF_PARSE_ERROR", 
        message: "We could not read this PDF. Please upload another resume PDF." 
      });
    }

    if (!text || text.length < 200) {
      return NextResponse.json({
        ok: false,
        reason: "NO_TEXT_EXTRACTED",
        message: "We could not read text from this PDF. Please upload a text-based resume (not a scanned image)."
      });
    }

    // Step 2: Validate & Extract Resume via Groq
    let ai;
    try {
      ai = await analyzeResumeWithGroq(text);
    } catch (err) {
      if (err.message === 'AI_OUTPUT_PARSE_FAILED') {
        return NextResponse.json({ 
          ok: false, 
          reason: "AI_OUTPUT_PARSE_FAILED",
          message: "Our AI systems failed to parse the structural meaning of this document. Please attempt uploading a cleaner format." 
        });
      }
      if (err.message === 'AI_API_DOWN') {
        return NextResponse.json({
          ok: false, 
          reason: "AI_API_DOWN",
          message: "Our verification AI API is momentarily unavailable or rejected this specific file's text structure. Please try again or use another format."
        });
      }
      throw err;
    }

    if (ai.isResume === false || ai.confidence < 60) {
      console.warn(`[/api/resumes/process] Invalid resume detected: Confidence ${ai.confidence}`);
      return NextResponse.json({ 
        ok: false, 
        reason: 'INVALID_RESUME', 
        ai: { isResume: ai.isResume, confidence: ai.confidence },
        message: "This document does not appear to be a valid professional resume." 
      });
    }

    // Step 4: Cloudinary Upload
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'mockify-ai/resumes', 
          resource_type: 'auto',  
          public_id: file.name.split('.')[0].substring(0, 100).trim() 
        },
        (error, result) => {
          if (error) {
            console.error('[/api/resumes/process] Cloudinary error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    // Step 5: Supabase Save
    const sessionId = await getOrCreateSessionId();
    const { data: dbData, error: dbError } = await supabaseServer
      .from('resumes')
      .insert({
        session_id: sessionId,
        file_url: uploadResult.secure_url,
        file_name: file.name,
        cloudinary_public_id: uploadResult.public_id
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('[/api/resumes/process] Supabase error:', dbError);
      return NextResponse.json({ ok: false, reason: "SERVER_ERROR", message: "Database integration encountered an unexpected connectivity issue." }, { status: 500 });
    }

    // Return success meta
    const response = NextResponse.json({
      ok: true,
      resumeId: dbData.id,
      fileUrl: uploadResult.secure_url,
      fileName: file.name,
      extracted: {
        name: ai.name || null,
        email: ai.email || null,
        phone: ai.phone || null,
        skills: ai.skills || [],
        suggestedRole: ai.suggestedRole || null,
        summary: ai.summary || null,
        confidence: ai.confidence
      }
    });

    setSessionCookie(response, sessionId);
    return response;

  } catch (error) {
    console.error('[/api/resumes/process] Unexpected error:', error);
    return NextResponse.json({ ok: false, reason: "SERVER_ERROR", message: "The server encountered a catastrophic internal error whilst verifying your upload." }, { status: 500 });
  }
}
