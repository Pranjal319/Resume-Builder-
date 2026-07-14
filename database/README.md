# CareerAI — Database Architecture & Migrations

This directory contains the database migration scripts and schema definitions for Supabase PostgreSQL.

## How to Set Up in Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Navigate to **SQL Editor** (left navigation bar) -> **New Query**.
4. Run the desired phase migration script:
   - For Authentication & Profiles: `database/phase2_auth_profiles.sql`
   - For Resumes & Templates: `database/phase3_resumes.sql`
   - For AI Resume Analyses: `database/phase5_resume_analyses.sql`
   - For AI Job Matcher: `database/phase6_job_matcher.sql`
   - For Skill Gap & Roadmaps: `database/phase7_roadmaps.sql`
5. Click **Run** (or `Ctrl + Enter`).

---

## Phase 7: Learning Roadmaps Table & Policies

The `database/phase7_roadmaps.sql` script creates:
1. `public.learning_roadmaps`:
   - `id`: UUID Primary Key
   - `user_id`: UUID References `public.profiles(id)`
   - `target_role`: Desired target position (e.g. "Full Stack Developer")
   - `duration_days`: 30, 60, or 90 days
   - `current_skills`: JSONB array of candidate's verified skills
   - `required_skills`: JSONB array of target industry requirements
   - `missing_skills`: JSONB array of prioritized gaps
   - `learning_order`: JSONB array of dependency-ordered sequence
   - `milestones`: JSONB array of checkable week/phase modules with project deliverables
   - `progress_percentage`: Integer 0–100 tracking completion
   - `is_active`: Boolean indicating candidate's primary learning roadmap
2. **Row Level Security (RLS)**:
   - Full read/write/delete isolation enforced for `auth.uid() = user_id`.
