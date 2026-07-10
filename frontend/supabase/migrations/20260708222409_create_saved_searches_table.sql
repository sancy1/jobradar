/*
# Create saved_searches table for search profiles

1. New Tables
- `saved_searches`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users)
  - `name` (text, not null) - profile name
  - `description` (text, optional) - profile description
  - `keywords_must` (text[], default '{}') - must have keywords (AND)
  - `keywords_should` (text[], default '{}') - should have keywords (OR)
  - `keywords_not` (text[], default '{}') - must not have keywords (NOT)
  - `remote_types` (text[], default '{}') - worldwide, regional, hybrid, onsite
  - `countries` (text[], default '{}') - selected countries
  - `cities` (text[], default '{}') - selected cities
  - `timezones` (text[], default '{}') - selected timezones
  - `seniority` (text[], default '{}') - entry, mid, senior, lead
  - `years_min` (integer, default 0) - minimum years experience
  - `years_max` (integer, default 15) - maximum years experience
  - `companies` (text[], default '{}') - target companies
  - `exclude_companies` (text[], default '{}') - excluded companies
  - `industries` (text[], default '{}') - selected industries
  - `salary_min` (integer, default 0) - minimum salary
  - `salary_max` (integer, default 500000) - maximum salary
  - `salary_currency` (text, default 'USD') - currency
  - `skills_must` (text[], default '{}') - must have skills
  - `skills_should` (text[], default '{}') - should have skills
  - `skills_not` (text[], default '{}') - must not have skills
  - `last_run_at` (timestamptz, nullable) - when search was last executed
  - `run_count` (integer, default 0) - number of times search was run
  - `is_active` (boolean, default true) - whether profile is active
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `saved_searches`.
- Owner-scoped CRUD: each authenticated user can only access their own saved searches.
*/

CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  keywords_must text[] DEFAULT '{}',
  keywords_should text[] DEFAULT '{}',
  keywords_not text[] DEFAULT '{}',
  remote_types text[] DEFAULT '{}',
  countries text[] DEFAULT '{}',
  cities text[] DEFAULT '{}',
  timezones text[] DEFAULT '{}',
  seniority text[] DEFAULT '{}',
  years_min integer DEFAULT 0,
  years_max integer DEFAULT 15,
  companies text[] DEFAULT '{}',
  exclude_companies text[] DEFAULT '{}',
  industries text[] DEFAULT '{}',
  salary_min integer DEFAULT 0,
  salary_max integer DEFAULT 500000,
  salary_currency text DEFAULT 'USD',
  skills_must text[] DEFAULT '{}',
  skills_should text[] DEFAULT '{}',
  skills_not text[] DEFAULT '{}',
  last_run_at timestamptz,
  run_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saved_searches" ON saved_searches;
CREATE POLICY "select_own_saved_searches" ON saved_searches FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_saved_searches" ON saved_searches;
CREATE POLICY "insert_own_saved_searches" ON saved_searches FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_saved_searches" ON saved_searches;
CREATE POLICY "update_own_saved_searches" ON saved_searches FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_saved_searches" ON saved_searches;
CREATE POLICY "delete_own_saved_searches" ON saved_searches FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- Create index for user queries
CREATE INDEX IF NOT EXISTS saved_searches_user_id_idx ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS saved_searches_created_at_idx ON saved_searches(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON saved_searches;
CREATE TRIGGER update_saved_searches_updated_at
BEFORE UPDATE ON saved_searches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
