-- ============================================================
-- RutinaIA — Schema Inicial
-- Migration: 20261008000000_initial_schema.sql
-- ============================================================

-- Habilitar extensión uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         text        NOT NULL CHECK (role IN ('student', 'instructor')),
  display_name text,
  avatar_url   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: users see and edit their own"
  ON profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "profiles: instructor reads students"
  ON profiles FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_instructor si
      WHERE si.instructor_id = auth.uid()
        AND si.student_id = profiles.id
        AND si.status = 'active'
    )
  );

-- Trigger para crear profile al signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ------------------------------------------------------------
-- instructors
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS instructors (
  profile_id              uuid        PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id      text        UNIQUE,
  subscription_status     text        NOT NULL DEFAULT 'inactive'
                                      CHECK (subscription_status IN ('inactive','active','trialing','past_due','canceled')),
  subscription_period_end timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instructors: users see their own record"
  ON instructors FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "instructors: service role manages all"
  ON instructors FOR ALL USING (auth.role() = 'service_role');

-- ------------------------------------------------------------
-- students
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  profile_id uuid        PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students: users see their own record"
  ON students FOR SELECT USING (auth.uid() = profile_id);

-- ------------------------------------------------------------
-- student_instructor
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_instructor (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  instructor_id uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','inactive')),
  invited_at    timestamptz NOT NULL DEFAULT now(),
  accepted_at   timestamptz,
  UNIQUE (student_id, instructor_id)
);

ALTER TABLE student_instructor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student_instructor: instructor reads their own"
  ON student_instructor FOR SELECT USING (auth.uid() = instructor_id);
CREATE POLICY "student_instructor: student reads their own"
  ON student_instructor FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "student_instructor: service role manages all"
  ON student_instructor FOR ALL USING (auth.role() = 'service_role');

-- ------------------------------------------------------------
-- food_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_logs (
  id              uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url       text           NOT NULL,
  analysis_json   jsonb          NOT NULL,
  total_calories  integer        NOT NULL,
  total_protein_g numeric(5,1)   NOT NULL,
  total_carbs_g   numeric(5,1)   NOT NULL,
  total_fat_g     numeric(5,1)   NOT NULL,
  confirmed_at    timestamptz    NOT NULL DEFAULT now(),
  created_at      timestamptz    NOT NULL DEFAULT now()
);

CREATE INDEX idx_food_logs_student_date ON food_logs (student_id, created_at DESC);

ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "food_logs: student reads own"
  ON food_logs FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "food_logs: instructor reads students"
  ON food_logs FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_instructor si
      WHERE si.instructor_id = auth.uid()
        AND si.student_id = food_logs.student_id
        AND si.status = 'active'
    )
  );
CREATE POLICY "food_logs: service role manages all"
  ON food_logs FOR ALL USING (auth.role() = 'service_role');

-- ------------------------------------------------------------
-- water_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS water_logs (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_ml  integer     NOT NULL CHECK (amount_ml > 0 AND amount_ml <= 2000),
  logged_at  timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_water_logs_student_date ON water_logs (student_id, logged_at DESC);

ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "water_logs: student reads own"
  ON water_logs FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "water_logs: instructor reads students"
  ON water_logs FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_instructor si
      WHERE si.instructor_id = auth.uid()
        AND si.student_id = water_logs.student_id
        AND si.status = 'active'
    )
  );
CREATE POLICY "water_logs: service role manages all"
  ON water_logs FOR ALL USING (auth.role() = 'service_role');

-- ------------------------------------------------------------
-- calorie_goals
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS calorie_goals (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        uuid    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  daily_limit_kcal  integer NOT NULL CHECK (daily_limit_kcal >= 500 AND daily_limit_kcal <= 10000),
  effective_from    date    NOT NULL DEFAULT CURRENT_DATE,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, effective_from)
);

CREATE INDEX idx_calorie_goals_student ON calorie_goals (student_id, effective_from DESC);

ALTER TABLE calorie_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calorie_goals: student manages own"
  ON calorie_goals FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "calorie_goals: instructor reads students"
  ON calorie_goals FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_instructor si
      WHERE si.instructor_id = auth.uid()
        AND si.student_id = calorie_goals.student_id
        AND si.status = 'active'
    )
  );

-- ------------------------------------------------------------
-- credit_accounts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_accounts (
  student_id         uuid        PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance            integer     NOT NULL DEFAULT 5 CHECK (balance >= 0),
  expiring_resets_at timestamptz NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMPTZ,
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_accounts: student reads own"
  ON credit_accounts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "credit_accounts: service role manages all"
  ON credit_accounts FOR ALL USING (auth.role() = 'service_role');

-- ------------------------------------------------------------
-- credit_ledger
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_ledger (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount       integer     NOT NULL,
  reason       text        NOT NULL CHECK (reason IN ('daily_grant','photo_reserve','photo_refund','admin')),
  reference_id uuid,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_ledger_student ON credit_ledger (student_id, created_at DESC);

ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_ledger: student reads own"
  ON credit_ledger FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "credit_ledger: service role manages all"
  ON credit_ledger FOR ALL USING (auth.role() = 'service_role');

-- ------------------------------------------------------------
-- photo_jobs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS photo_jobs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_log_id   uuid        REFERENCES food_logs(id),
  credits_held  integer     NOT NULL DEFAULT 0 CHECK (credits_held >= 0),
  status        text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','settled','orphaned')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  settled_at    timestamptz
);

CREATE INDEX idx_photo_jobs_pending ON photo_jobs (student_id, status) WHERE status = 'pending';

ALTER TABLE photo_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photo_jobs: student reads own"
  ON photo_jobs FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "photo_jobs: service role manages all"
  ON photo_jobs FOR ALL USING (auth.role() = 'service_role');

-- ------------------------------------------------------------
-- subscriptions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id          uuid        NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text        NOT NULL UNIQUE,
  stripe_customer_id     text        NOT NULL,
  status                 text        NOT NULL CHECK (status IN ('active','canceled','past_due','trialing','unpaid')),
  current_period_start   timestamptz NOT NULL,
  current_period_end     timestamptz NOT NULL,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions: instructor reads own"
  ON subscriptions FOR SELECT USING (auth.uid() = instructor_id);
CREATE POLICY "subscriptions: service role manages all"
  ON subscriptions FOR ALL USING (auth.role() = 'service_role');

-- ------------------------------------------------------------
-- webhook_events
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  source       text        NOT NULL DEFAULT 'stripe',
  event_id     text        NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, event_id)
);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_events: service role manages all"
  ON webhook_events FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- PL/pgSQL Functions (SECURITY DEFINER — bypasan RLS)
-- ============================================================

-- reserve_photo_credit
-- Llamar ANTES de invocar Gemini Vision.
-- Devuelve el photo_job_id. Lanza 'P0001' si sin créditos.
CREATE OR REPLACE FUNCTION reserve_photo_credit(p_student_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_is_premium BOOLEAN;
  v_balance    INTEGER;
  v_job_id     UUID;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM student_instructor si
    JOIN instructors i ON i.profile_id = si.instructor_id
    WHERE si.student_id = p_student_id
      AND si.status = 'active'
      AND i.subscription_status = 'active'
  ) INTO v_is_premium;

  IF v_is_premium THEN
    INSERT INTO photo_jobs (student_id, credits_held, status)
    VALUES (p_student_id, 0, 'pending')
    RETURNING id INTO v_job_id;
    RETURN v_job_id;
  END IF;

  INSERT INTO credit_accounts (student_id, balance, expiring_resets_at)
  VALUES (p_student_id, 5, (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMPTZ)
  ON CONFLICT (student_id) DO NOTHING;

  UPDATE credit_accounts
  SET
    balance            = CASE WHEN expiring_resets_at <= NOW() THEN 5         ELSE balance            END,
    expiring_resets_at = CASE WHEN expiring_resets_at <= NOW() THEN (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMPTZ ELSE expiring_resets_at END,
    updated_at         = NOW()
  WHERE student_id = p_student_id;

  UPDATE credit_accounts
  SET balance = balance - 1, updated_at = NOW()
  WHERE student_id = p_student_id AND balance >= 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO credit_ledger (student_id, amount, reason)
  VALUES (p_student_id, -1, 'photo_reserve');

  INSERT INTO photo_jobs (student_id, credits_held, status)
  VALUES (p_student_id, 1, 'pending')
  RETURNING id INTO v_job_id;

  RETURN v_job_id;
END;
$$;

-- settle_photo_credit
-- Llamar DESPUÉS de que el alumno confirma el food_log.
-- Lanza 'P0002' si el job no está en estado pending.
CREATE OR REPLACE FUNCTION settle_photo_credit(p_job_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE photo_jobs
  SET status = 'settled', settled_at = NOW()
  WHERE id = p_job_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'job_not_found_or_not_pending' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

-- sweep_stale_jobs
-- Cron: marca como orphaned jobs pending >1h sin confirmar y devuelve créditos.
-- Devuelve el número de jobs sweepados.
CREATE OR REPLACE FUNCTION sweep_stale_jobs()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_job   RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_job IN
    UPDATE photo_jobs
    SET status = 'orphaned'
    WHERE status = 'pending' AND created_at < NOW() - INTERVAL '1 hour'
    RETURNING id, student_id, credits_held
  LOOP
    IF v_job.credits_held > 0 THEN
      UPDATE credit_accounts
      SET balance = balance + v_job.credits_held, updated_at = NOW()
      WHERE student_id = v_job.student_id;

      INSERT INTO credit_ledger (student_id, amount, reason, reference_id)
      VALUES (v_job.student_id, v_job.credits_held, 'photo_refund', v_job.id);
    END IF;
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;
