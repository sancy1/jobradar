/*
# Create crawl sessions and URL processing tables

1. New Tables
- `crawl_sessions`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users)
  - `status` (text, not null) - idle, running, completed, aborted
  - `mode` (text, not null) - limited, unlimited
  - `max_urls` (integer, nullable) - max URLs for limited mode
  - `sources` (text[], default '{}') - corporate, job_boards, ats, all
  - `urls_discovered` (integer, default 0)
  - `urls_processed` (integer, default 0)
  - `jobs_passed` (integer, default 0)
  - `jobs_dropped` (integer, default 0)
  - `started_at` (timestamptz, nullable)
  - `completed_at` (timestamptz, nullable)
  - `duration_seconds` (integer, default 0)
  - `config` (jsonb, default '{}') - search configuration
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

- `crawl_activity_logs`
  - `id` (uuid, primary key)
  - `session_id` (uuid, not null, references crawl_sessions)
  - `type` (text, not null) - info, success, warning, error
  - `message` (text, not null)
  - `metadata` (jsonb, default '{}')
  - `created_at` (timestamptz, default now())

- `url_batches`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users)
  - `status` (text, not null) - pending, processing, completed, failed
  - `urls` (jsonb, not null) - array of URL objects
  - `total_urls` (integer, default 0)
  - `successful` (integer, default 0)
  - `failed` (integer, default 0)
  - `config` (jsonb, default '{}') - filter configuration
  - `results` (jsonb, default '[]') - processing results
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on all tables.
- Owner-scoped CRUD policies for authenticated users.
*/

CREATE TABLE IF NOT EXISTS crawl_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'completed', 'aborted')),
  mode text NOT NULL DEFAULT 'limited' CHECK (mode IN ('limited', 'unlimited')),
  max_urls integer,
  sources text[] DEFAULT '{}',
  urls_discovered integer DEFAULT 0,
  urls_processed integer DEFAULT 0,
  jobs_passed integer DEFAULT 0,
  jobs_dropped integer DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer DEFAULT 0,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crawl_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES crawl_sessions(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS url_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  urls jsonb NOT NULL DEFAULT '[]',
  total_urls integer DEFAULT 0,
  successful integer DEFAULT 0,
  failed integer DEFAULT 0,
  config jsonb DEFAULT '{}',
  results jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE crawl_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_batches ENABLE ROW LEVEL SECURITY;

-- crawl_sessions policies
DROP POLICY IF EXISTS "select_own_crawl_sessions" ON crawl_sessions;
CREATE POLICY "select_own_crawl_sessions" ON crawl_sessions FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_crawl_sessions" ON crawl_sessions;
CREATE POLICY "insert_own_crawl_sessions" ON crawl_sessions FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_crawl_sessions" ON crawl_sessions;
CREATE POLICY "update_own_crawl_sessions" ON crawl_sessions FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_crawl_sessions" ON crawl_sessions;
CREATE POLICY "delete_own_crawl_sessions" ON crawl_sessions FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- crawl_activity_logs policies
DROP POLICY IF EXISTS "select_own_activity_logs" ON crawl_activity_logs;
CREATE POLICY "select_own_activity_logs" ON crawl_activity_logs FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM crawl_sessions WHERE crawl_sessions.id = crawl_activity_logs.session_id AND crawl_sessions.user_id = auth.uid())
);

DROP POLICY IF EXISTS "insert_own_activity_logs" ON crawl_activity_logs;
CREATE POLICY "insert_own_activity_logs" ON crawl_activity_logs FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM crawl_sessions WHERE crawl_sessions.id = crawl_activity_logs.session_id AND crawl_sessions.user_id = auth.uid())
);

-- url_batches policies
DROP POLICY IF EXISTS "select_own_url_batches" ON url_batches;
CREATE POLICY "select_own_url_batches" ON url_batches FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_url_batches" ON url_batches;
CREATE POLICY "insert_own_url_batches" ON url_batches FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_url_batches" ON url_batches;
CREATE POLICY "update_own_url_batches" ON url_batches FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_url_batches" ON url_batches;
CREATE POLICY "delete_own_url_batches" ON url_batches FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS crawl_sessions_user_id_idx ON crawl_sessions(user_id);
CREATE INDEX IF NOT EXISTS crawl_sessions_status_idx ON crawl_sessions(status);
CREATE INDEX IF NOT EXISTS crawl_sessions_created_at_idx ON crawl_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS crawl_activity_logs_session_id_idx ON crawl_activity_logs(session_id);
CREATE INDEX IF NOT EXISTS crawl_activity_logs_created_at_idx ON crawl_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS url_batches_user_id_idx ON url_batches(user_id);
CREATE INDEX IF NOT EXISTS url_batches_created_at_idx ON url_batches(created_at DESC);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_crawl_sessions_updated_at ON crawl_sessions;
CREATE TRIGGER update_crawl_sessions_updated_at
BEFORE UPDATE ON crawl_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_url_batches_updated_at ON url_batches;
CREATE TRIGGER update_url_batches_updated_at
BEFORE UPDATE ON url_batches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
