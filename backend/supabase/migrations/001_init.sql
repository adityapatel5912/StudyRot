-- StudyRot Initial Supabase Schema & Row-Level Security (RLS) Policies
-- Migration: 001_init.sql

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = user_id);

-- 2. Encrypted User API Keys
CREATE TABLE IF NOT EXISTS public.user_keys (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    encrypted_groq TEXT,
    encrypted_tavily TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own API keys"
    ON public.user_keys FOR ALL
    USING (auth.uid() = user_id);

-- 3. Saved Feeds
CREATE TABLE IF NOT EXISTS public.feeds (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title TEXT,
    subject TEXT NOT NULL,
    grade INTEGER NOT NULL,
    topic TEXT NOT NULL,
    vibe TEXT DEFAULT 'Instagram',
    posts JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own feeds"
    ON public.feeds FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own feeds"
    ON public.feeds FOR ALL
    USING (auth.uid() = user_id);

-- 4. Likes
CREATE TABLE IF NOT EXISTS public.likes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    post_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, post_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own likes"
    ON public.likes FOR ALL
    USING (auth.uid() = user_id);

-- 5. Comments
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own comments"
    ON public.comments FOR ALL
    USING (auth.uid() = user_id);

-- 6. Saves (Bookmarks)
CREATE TABLE IF NOT EXISTS public.saves (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    post_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, post_id)
);

ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved posts"
    ON public.saves FOR ALL
    USING (auth.uid() = user_id);
