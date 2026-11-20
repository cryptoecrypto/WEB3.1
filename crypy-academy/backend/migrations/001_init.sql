CREATE TABLE IF NOT EXISTS academy_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_identities (
  provider TEXT NOT NULL CHECK (provider IN ('google','microsoft')),
  subject TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES academy_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(provider, subject)
);

CREATE TABLE IF NOT EXISTS academy_oauth_transactions (
  state TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('google','microsoft')),
  nonce TEXT NOT NULL,
  code_verifier TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS academy_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES academy_users(id) ON DELETE CASCADE,
  csrf_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS academy_sessions_user_idx ON academy_sessions(user_id);

CREATE TABLE IF NOT EXISTS academy_progress (
  user_id UUID NOT NULL REFERENCES academy_users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  level_id TEXT NOT NULL,
  lesson_index INTEGER NOT NULL CHECK (lesson_index >= 0),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(user_id, track_id, level_id, lesson_index)
);

CREATE TABLE IF NOT EXISTS academy_exam_questions (
  id TEXT PRIMARY KEY,
  track_id TEXT NOT NULL,
  level_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option TEXT NOT NULL,
  explanation TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS academy_exam_bank_idx
  ON academy_exam_questions(track_id, level_id) WHERE active = TRUE;

CREATE TABLE IF NOT EXISTS academy_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES academy_users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  level_id TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score NUMERIC(4,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS academy_exam_attempts_user_idx
  ON academy_exam_attempts(user_id, track_id, level_id, submitted_at DESC);

CREATE TABLE IF NOT EXISTS academy_diplomas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES academy_users(id) ON DELETE RESTRICT,
  track_id TEXT NOT NULL,
  level_id TEXT NOT NULL,
  score NUMERIC(4,2) NOT NULL CHECK (score = 10.00),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email_status TEXT NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending','sent','failed')),
  email_sent_at TIMESTAMPTZ,
  UNIQUE(user_id, track_id, level_id)
);

CREATE TABLE IF NOT EXISTS academy_hotmart_events (
  event_id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_entitlements (
  user_id UUID NOT NULL REFERENCES academy_users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','refunded','cancelled','chargeback')),
  source_event_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(user_id, product_id)
);
