-- ==============================================================================
-- CareerAI Phase 3: Resumes Table & Policies Migration
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the Resumes Table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Resume',
    template_id TEXT NOT NULL DEFAULT 'ats-friendly',
    content JSONB NOT NULL DEFAULT '{
        "personal_info": {
            "full_name": "",
            "email": "",
            "phone": "",
            "location": "",
            "headline": "",
            "website": ""
        },
        "summary": "",
        "education": [],
        "skills": [],
        "projects": [],
        "experience": [],
        "certifications": [],
        "achievements": [],
        "social_links": []
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_updated_at ON public.resumes(updated_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing policies
DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can create own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;

-- 5. Define Row Level Security Policies
-- Allow users to view only their own resumes
CREATE POLICY "Users can view own resumes"
    ON public.resumes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own resumes
CREATE POLICY "Users can create own resumes"
    ON public.resumes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own resumes
CREATE POLICY "Users can update own resumes"
    ON public.resumes
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to delete only their own resumes
CREATE POLICY "Users can delete own resumes"
    ON public.resumes
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Attach auto-update trigger for updated_at
DROP TRIGGER IF EXISTS tr_resumes_updated_at ON public.resumes;
CREATE TRIGGER tr_resumes_updated_at
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
