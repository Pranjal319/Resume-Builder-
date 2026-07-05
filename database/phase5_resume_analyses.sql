-- ==============================================================================
-- CareerAI Phase 5: Resume Analyses Table & Policies Migration
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the Resume Analyses Table
CREATE TABLE IF NOT EXISTS public.resume_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL DEFAULT 'Uploaded Resume',
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    section_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    ats_issues JSONB NOT NULL DEFAULT '[]'::jsonb,
    improvement_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_changes JSONB NOT NULL DEFAULT '[]'::jsonb,
    extracted_text TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user query lookups
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON public.resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_created_at ON public.resume_analyses(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing policies
DROP POLICY IF EXISTS "Users can view own resume analyses" ON public.resume_analyses;
DROP POLICY IF EXISTS "Users can insert own resume analyses" ON public.resume_analyses;
DROP POLICY IF EXISTS "Users can delete own resume analyses" ON public.resume_analyses;

-- 5. Define Row Level Security Policies
-- Allow users to view only their own analysis reports
CREATE POLICY "Users can view own resume analyses"
    ON public.resume_analyses
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own analysis reports
CREATE POLICY "Users can insert own resume analyses"
    ON public.resume_analyses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own analysis reports
CREATE POLICY "Users can delete own resume analyses"
    ON public.resume_analyses
    FOR DELETE
    USING (auth.uid() = user_id);
