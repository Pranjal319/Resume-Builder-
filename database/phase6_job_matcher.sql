-- ==============================================================================
-- CareerAI Phase 6: Job Descriptions & Job Matches Migration
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the Job Descriptions Table
CREATE TABLE IF NOT EXISTS public.job_descriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL DEFAULT 'Untitled Role',
    company_name TEXT DEFAULT 'Target Company',
    description TEXT NOT NULL,
    extracted_skills JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user job lookups
CREATE INDEX IF NOT EXISTS idx_job_descriptions_user_id ON public.job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_job_descriptions_created_at ON public.job_descriptions(created_at DESC);

-- 3. Create the Job Matches Table
CREATE TABLE IF NOT EXISTS public.job_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    job_title TEXT NOT NULL DEFAULT 'Target Role',
    company_name TEXT DEFAULT 'Target Company',
    resume_title TEXT DEFAULT 'My Resume',
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
    matching_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    preferred_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    dimension_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    suitability TEXT NOT NULL DEFAULT 'Competitive',
    explanation TEXT NOT NULL DEFAULT '',
    recommended_changes JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for match history lookups
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON public.job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_created_at ON public.job_matches(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Policies for Job Descriptions
DROP POLICY IF EXISTS "Users can manage own job descriptions" ON public.job_descriptions;
CREATE POLICY "Users can manage own job descriptions"
    ON public.job_descriptions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. Define RLS Policies for Job Matches
DROP POLICY IF EXISTS "Users can manage own job matches" ON public.job_matches;
CREATE POLICY "Users can manage own job matches"
    ON public.job_matches
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
