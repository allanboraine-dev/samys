import { createClient } from '@supabase/supabase-js';

/*
  ==============================================================
  SAMY'S WHOLESALERS SUPABASE SCHEMA DEFINITIONS (SQL REFERENCE)
  ==============================================================

  -- 1. Products Table
  CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    badge TEXT,
    is_month_end_special BOOLEAN DEFAULT FALSE,
    in_stock BOOLEAN DEFAULT TRUE,
    retail_unit TEXT NOT NULL,
    retail_price NUMERIC(10, 2) NOT NULL,
    retail_old_price NUMERIC(10, 2),
    case_unit TEXT NOT NULL,
    case_units_count INTEGER NOT NULL DEFAULT 1,
    trader_case_price NUMERIC(10, 2) NOT NULL,
    trader_old_case_price NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  -- 2. Orders Table
  CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'retail_click_collect' | 'trader_bulk'
    status TEXT NOT NULL DEFAULT 'New', -- 'New' | 'Picking' | 'Ready for Collection' | 'Collected'
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    vat_amount NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    estimated_savings NUMERIC(10, 2) DEFAULT 0,
    retail_details JSONB,
    trader_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  -- 3. Profiles / Traders Table
  CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT,
    contact_person TEXT,
    whatsapp_number TEXT NOT NULL,
    area TEXT,
    role TEXT DEFAULT 'trader',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );
*/

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-sammys-wholesalers.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key-sammys-cash-carry-kimberley';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo-sammys')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
