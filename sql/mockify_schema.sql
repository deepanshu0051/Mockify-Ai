-- ================================================================
-- Mockify-AI Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------
-- resumes
-- Stores uploaded resume metadata per anonymous session.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resumes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text        NOT NULL,
  file_url   text        NOT NULL,
  file_name  text,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------
-- interviews
-- One interview session per user attempt (role, difficulty, mode).
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  text        NOT NULL,
  resume_id   uuid        REFERENCES resumes(id),
  role        text,
  difficulty  text,
  mode        text,
  status      text        DEFAULT 'in_progress',
  final_score numeric,
  created_at  timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------
-- interview_questions
-- Each of the 10 questions assigned to an interview.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interview_questions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid        REFERENCES interviews(id) ON DELETE CASCADE,
  idx          int         NOT NULL,
  question_text text       NOT NULL,
  topic        text,
  difficulty   text,
  keywords     jsonb,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(interview_id, idx)
);

-- ----------------------------------------------------------------
-- interview_answers
-- The user's answer and computed score for each question.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interview_answers (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id     uuid        REFERENCES interviews(id) ON DELETE CASCADE,
  idx              int         NOT NULL,
  answer_text      text,
  matched_keywords jsonb,
  score            numeric,
  created_at       timestamptz DEFAULT now(),
  UNIQUE(interview_id, idx)
);

-- ----------------------------------------------------------------
-- Indexes for common query patterns
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_resumes_session_id
  ON resumes(session_id);

CREATE INDEX IF NOT EXISTS idx_interviews_session_id
  ON interviews(session_id);

CREATE INDEX IF NOT EXISTS idx_interview_questions_interview_id
  ON interview_questions(interview_id);

CREATE INDEX IF NOT EXISTS idx_interview_answers_interview_id
  ON interview_answers(interview_id);
