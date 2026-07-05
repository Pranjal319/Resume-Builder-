-- ==============================================================================
-- CareerAI Phase 7: Learning Roadmaps & Milestones Migration
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the Learning Roadmaps Table
CREATE TABLE IF NOT EXISTS public.learning_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_role TEXT NOT NULL DEFAULT 'Full Stack Developer',
    duration_days INTEGER NOT NULL DEFAULT 60 CHECK (duration_days IN (30, 60, 90)),
    current_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    learning_order JSONB NOT NULL DEFAULT '[]'::jsonb,
    milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_learning_roadmaps_user_id ON public.learning_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_roadmaps_active ON public.learning_roadmaps(user_id, is_active);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.learning_roadmaps ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing policies
DROP POLICY IF EXISTS "Users can manage own learning roadmaps" ON public.learning_roadmaps;

-- 5. Define RLS Policies
CREATE POLICY "Users can manage own learning roadmaps"
    ON public.learning_roadmaps
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
