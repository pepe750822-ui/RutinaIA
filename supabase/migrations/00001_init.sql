-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  nombre TEXT,
  plan TEXT DEFAULT 'gratis' CHECK (plan IN ('gratis', 'premium')),
  rutinas_semana INTEGER DEFAULT 0,
  ultimo_reset_semana DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, nombre)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Rutinas
CREATE TABLE rutinas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  nombre TEXT NOT NULL,
  objetivo TEXT,
  nivel TEXT,
  ejercicios JSONB NOT NULL,
  duracion_minutos INTEGER,
  completada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rutinas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routines"
  ON rutinas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines"
  ON rutinas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
  ON rutinas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines"
  ON rutinas FOR DELETE
  USING (auth.uid() = user_id);

-- Ejercicios completados
CREATE TABLE ejercicios_completados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rutina_id UUID REFERENCES rutinas(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  duracion_min INTEGER
);

ALTER TABLE ejercicios_completados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions"
  ON ejercicios_completados FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON ejercicios_completados FOR INSERT
  WITH CHECK (auth.uid() = user_id);
