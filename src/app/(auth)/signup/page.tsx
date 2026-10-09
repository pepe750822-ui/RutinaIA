"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "student" | "instructor";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: crypto.randomUUID(), // magic-link only; password never used
      options: {
        data: { role },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[--background] px-4">
        <div className="w-full max-w-[420px] rounded-[12px] bg-[--surface] p-8 shadow-[0_1px_3px_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.06)]">
          <h1 className="text-[1.5rem] font-semibold leading-8 tracking-[-0.01em] text-[--fg] mb-2">
            Revisa tu email
          </h1>
          <p className="text-sm text-[--fg-muted]">
            Te enviamos un link de confirmación a{" "}
            <strong>{email}</strong>. Haz clic en él para activar tu cuenta.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[--background] px-4">
      <div className="w-full max-w-[420px] rounded-[12px] bg-[--surface] p-8 shadow-[0_1px_3px_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.06)]">
        <h1 className="text-[1.5rem] font-semibold leading-8 tracking-[-0.01em] text-[--fg] mb-1">
          Crear cuenta
        </h1>
        <p className="text-sm text-[--fg-muted] mb-6">
          Elige tu rol para comenzar.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-[--fg]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="rounded-[8px] border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--fg] placeholder:text-[--fg-muted] focus:outline-none focus:ring-2 focus:ring-[--primary]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[--fg]">Soy…</span>
            <div className="flex gap-3">
              {(["student", "instructor"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-[8px] border py-2 text-sm font-medium transition-colors duration-200 ${
                    role === r
                      ? "border-[--primary] bg-[--primary] text-[--primary-fg]"
                      : "border-[--border] bg-[--surface] text-[--fg]"
                  }`}
                >
                  {r === "student" ? "Alumno" : "Instructor"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-[--destructive]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-[8px] bg-[--primary] px-4 py-2 text-sm font-medium text-[--primary-fg] transition-opacity duration-200 disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[--fg-muted]">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-[--primary] underline">
            Ingresa
          </a>
        </p>
      </div>
    </main>
  );
}
