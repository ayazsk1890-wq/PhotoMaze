-- Supabase PostgreSQL Schema for AI Passport Photo Maker
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  credits_balance INTEGER DEFAULT 5 NOT NULL CHECK (credits_balance >= 0),
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'payg', 'pro', 'business')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Photo Projects
CREATE TABLE IF NOT EXISTS public.photo_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest sessions
  title TEXT DEFAULT 'Untitled Passport Photo' NOT NULL,
  original_image_url TEXT NOT NULL,
  processed_image_url TEXT,
  transparent_cutout_url TEXT,
  country_code TEXT DEFAULT 'US' NOT NULL,
  document_type TEXT DEFAULT 'Passport' NOT NULL,
  width_mm NUMERIC(5,2) NOT NULL,
  height_mm NUMERIC(5,2) NOT NULL,
  target_dpi INTEGER DEFAULT 300 NOT NULL,
  background_color TEXT DEFAULT '#FFFFFF',
  outfit_applied TEXT,
  enhancement_applied BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Print Sheets
CREATE TABLE IF NOT EXISTS public.print_sheets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.photo_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  paper_size_id TEXT NOT NULL,
  paper_width_mm NUMERIC(6,2) NOT NULL,
  paper_height_mm NUMERIC(6,2) NOT NULL,
  copies_count INTEGER NOT NULL CHECK (copies_count > 0),
  rows_count INTEGER NOT NULL,
  cols_count INTEGER NOT NULL,
  spacing_mm NUMERIC(4,2) DEFAULT 3.0 NOT NULL,
  margin_mm NUMERIC(4,2) DEFAULT 5.0 NOT NULL,
  show_cut_guides BOOLEAN DEFAULT TRUE,
  rendered_sheet_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Credit Transactions Ledger
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- positive for credit, negative for debit
  transaction_type TEXT NOT NULL CHECK (
    transaction_type IN ('signup_bonus', 'razorpay_purchase', 'stripe_purchase', 'admin_adjustment', 'bg_removal', 'outfit_swap', 'print_sheet', 'enhancement')
  ),
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_id TEXT, -- e.g. order_id or project_id
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Orders & Payments
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe')),
  provider_order_id TEXT UNIQUE NOT NULL,
  provider_payment_id TEXT,
  package_id TEXT NOT NULL,
  credits_granted INTEGER NOT NULL,
  amount_in_cents_or_paise BIGINT NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects Policies
CREATE POLICY "Users can manage own projects" ON public.photo_projects
  FOR ALL USING (auth.uid() = user_id);

-- Print Sheets Policies
CREATE POLICY "Users can manage own print sheets" ON public.print_sheets
  FOR ALL USING (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

