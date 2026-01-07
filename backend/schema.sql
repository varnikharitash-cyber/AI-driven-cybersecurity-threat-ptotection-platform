-- CyberSpy Database Schema

-- 1. PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ANALYSIS RESULTS Table
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to User
    filename TEXT NOT NULL,       
    risk_score INTEGER,           
    summary TEXT,                 
    details JSONB,                
    source TEXT                   
);

-- MIGRATION: Ensure user_id exists if table already existed without it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analysis_results' AND column_name = 'user_id') THEN
        ALTER TABLE public.analysis_results ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Index for faster querying
CREATE INDEX IF NOT EXISTS idx_analysis_source ON analysis_results(source);
CREATE INDEX IF NOT EXISTS idx_analysis_risk ON analysis_results(risk_score);
CREATE INDEX IF NOT EXISTS idx_analysis_user ON analysis_results(user_id);

-- 3. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
-- Profiles: Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Analysis: Users can view their own analysis results
DROP POLICY IF EXISTS "Users can view own analysis" ON public.analysis_results;
CREATE POLICY "Users can view own analysis" 
ON public.analysis_results FOR SELECT 
USING (auth.uid() = user_id);

-- Analysis: Users can insert their own analysis results
DROP POLICY IF EXISTS "Users can insert own analysis" ON public.analysis_results;
CREATE POLICY "Users can insert own analysis" 
ON public.analysis_results FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. FUNCTION & TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
