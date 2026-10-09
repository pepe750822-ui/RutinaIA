/**
 * Seed script — crea usuarios demo con email confirmado (sin magic link).
 * Requiere: SUPABASE_SERVICE_ROLE_KEY y NEXT_PUBLIC_SUPABASE_URL en el entorno.
 *
 * Local:  DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
 * Uso:    npx tsx supabase/seed.ts
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SERVICE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createUser(email: string, role: "student" | "instructor") {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { role },
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  console.log(`✓ user: ${email} (${role}) → ${data.user.id}`);
  return data.user;
}

async function main() {
  console.log("🌱 Seeding demo users...\n");

  const instructor = await createUser("instructor@rutinaia.test", "instructor");
  const free       = await createUser("alumno.free@rutinaia.test", "student");
  const premium    = await createUser("alumno.premium@rutinaia.test", "student");

  // Esperar a que el trigger handle_new_user cree los profiles
  await new Promise(r => setTimeout(r, 500));

  // Crear registros en instructor / students (el trigger ya creó profiles)
  const { error: e1 } = await supabase
    .from("instructors")
    .upsert({ profile_id: instructor.id, subscription_status: "inactive" });
  if (e1) throw new Error(`instructors: ${e1.message}`);

  const { error: e2 } = await supabase.from("students").upsert([
    { profile_id: free.id },
    { profile_id: premium.id },
  ]);
  if (e2) throw new Error(`students: ${e2.message}`);

  // Relaciones instructor ↔ alumnos (activas)
  const { error: e3 } = await supabase.from("student_instructor").upsert([
    {
      student_id: free.id,
      instructor_id: instructor.id,
      status: "active",
      accepted_at: new Date().toISOString(),
    },
    {
      student_id: premium.id,
      instructor_id: instructor.id,
      status: "active",
      accepted_at: new Date().toISOString(),
    },
  ]);
  if (e3) throw new Error(`student_instructor: ${e3.message}`);
  console.log("✓ student_instructor (2 active)");

  // 3 food_logs del día actual para alumno free
  const today = new Date().toISOString();
  const { error: e4 } = await supabase.from("food_logs").insert([
    {
      student_id: free.id,
      photo_url: "https://placehold.co/400x300.jpg?text=Desayuno",
      analysis_json: { items: [{ name: "Avena con leche", calories: 320 }] },
      total_calories: 320,
      total_protein_g: 12.0,
      total_carbs_g: 55.0,
      total_fat_g: 6.0,
      confirmed_at: today,
    },
    {
      student_id: free.id,
      photo_url: "https://placehold.co/400x300.jpg?text=Almuerzo",
      analysis_json: { items: [{ name: "Arroz con pollo", calories: 540 }] },
      total_calories: 540,
      total_protein_g: 38.0,
      total_carbs_g: 62.0,
      total_fat_g: 10.0,
      confirmed_at: today,
    },
    {
      student_id: free.id,
      photo_url: "https://placehold.co/400x300.jpg?text=Cena",
      analysis_json: { items: [{ name: "Ensalada de atún", calories: 280 }] },
      total_calories: 280,
      total_protein_g: 28.0,
      total_carbs_g: 10.0,
      total_fat_g: 12.0,
      confirmed_at: today,
    },
  ]);
  if (e4) throw new Error(`food_logs: ${e4.message}`);
  console.log("✓ food_logs (3)");

  // 2 water_logs del día actual
  const { error: e5 } = await supabase.from("water_logs").insert([
    { student_id: free.id, amount_ml: 500, logged_at: today },
    { student_id: free.id, amount_ml: 350, logged_at: today },
  ]);
  if (e5) throw new Error(`water_logs: ${e5.message}`);
  console.log("✓ water_logs (2)");

  console.log("\n✅ Seed complete.");
}

main().catch(err => {
  console.error("❌", err.message);
  process.exit(1);
});
