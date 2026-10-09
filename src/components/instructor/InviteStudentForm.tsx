"use client";

import { useState } from "react";

export default function InviteStudentForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSent(false);

    try {
      const res = await fetch("/api/instructor/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json?.error?.message ?? "Error al enviar la invitación.");
        return;
      }

      setSent(true);
      setEmail("");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm">
      <label htmlFor="invite-email" className="text-sm font-medium">
        Invitar alumno por correo
      </label>

      {sent && (
        <p className="text-emerald-600 text-sm">
          Invitación enviada. El alumno recibirá un enlace para unirse.
        </p>
      )}

      {error && (
        <p role="alert" className="text-red-500 text-sm">
          {error}
        </p>
      )}

      <input
        id="invite-email"
        type="email"
        required
        value={email}
        onChange={(e) => { setEmail(e.target.value); setSent(false); }}
        placeholder="alumno@email.com"
        className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm bg-transparent"
      />

      <button
        type="submit"
        disabled={loading || !email}
        className="py-3 rounded-xl bg-[--accent] text-white font-semibold disabled:opacity-50 active:scale-95 transition-transform"
      >
        {loading ? "Enviando…" : "Invitar alumno"}
      </button>
    </form>
  );
}
