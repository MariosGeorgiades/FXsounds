-- Run this SQL in your Supabase SQL Editor to create the necessary tables for FX Sound Productions.

-- 1. Create the News Events table
CREATE TABLE news_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  month text NOT NULL,
  day text NOT NULL,
  year text NOT NULL,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create the Gallery Albums table
-- We use a JSONB column 'photos' to easily push/delete photo objects (matching the frontend logic exactly).
CREATE TABLE gallery_albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  album_date text NOT NULL,
  photos jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. (Optional) Set up Row Level Security (RLS)
-- If you want anyone to read the data (public website), but restrict INSERTS/DELETES to authenticated users,
-- you can configure RLS. For now, we will just allow anonymous read/write to quickly get it working, 
-- but we strongly recommend turning this on and using Supabase Auth later.

-- ENABLE RLS (Warning: This will block all access until policies are created)
-- ALTER TABLE news_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
