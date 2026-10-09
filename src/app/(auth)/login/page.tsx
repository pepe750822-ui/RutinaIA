"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
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
            Te enviamos un link a <strong>{email}</strong>. Haz clic en él para
            ingresar.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[--background] px-4">
      <div className="w-full max-w-[420px] rounded-[12px] bg-[--surface] p-8 shadow-[0_1px_3px_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.06)]">
        <h1 className="text-[1.5rem] font-semibold leading-8 tracking-[-0.01em] text-[--fg] mb-1">
          Ingresar
        </h1>
        <p className="text-sm text-[--fg-muted] mb-6">
          Te enviaremos un link de acceso a tu email.
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

          {error && (
            <p className="text-sm text-[--destructive]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-[8px] bg-[--primary] px-4 py-2 text-sm font-medium text-[--primary-fg] transition-opacity duration-200 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar link de acceso"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[--fg-muted]">
          ¿No tienes cuenta?{" "}
          <a href="/signup" className="text-[--primary] underline">
            Regístrate
          </a>
        </p>
      </div>
    </main>
  );
}
