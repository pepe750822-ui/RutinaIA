-- Sesiones: each completed workout session
CREATE TABLE sesiones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rutina_id UUID REFERENCES rutinas(id) ON DELETE SET NULL,
  nombre TEXT DEFAULT 'Entrenamiento',
  inicio TIMESTAMPTZ DEFAULT NOW(),
  fin TIMESTAMPTZ,
  duracion_min INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sesiones"
  ON sesiones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sesiones"
  ON sesiones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sesiones"
  ON sesiones FOR UPDATE
  USING (auth.uid() = user_id);

-- Sets completados: each set logged during a session
CREATE TABLE sets_completados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  sesion_id UUID REFERENCES sesiones(id) ON DELETE CASCADE NOT NULL,
  rutina_id UUID REFERENCES rutinas(id) ON DELETE SET NULL,
  ejercicio_nombre TEXT NOT NULL,
  exercise JSONB,
  peso_kg DECIMAL(5,1) DEFAULT 0,
  reps INTEGER DEFAULT 0,
  rpe DECIMAL(2,1),
  numero_set INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sets_completados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sets"
  ON sets_completados FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sets"
  ON sets_completados FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sets"
  ON sets_completados FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast dashboard queries
CREATE INDEX idx_sets_completados_user_fecha
  ON sets_completados(user_id, created_at DESC);

CREATE INDEX idx_sesiones_user_fecha
  ON sesiones(user_id, created_at DESC);
