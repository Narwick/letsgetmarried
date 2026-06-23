"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/painel";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    // Prefere a URL pública canônica; cai pro origin do navegador em dev.
    const configured = process.env.NEXT_PUBLIC_SITE_URL;
    const base = configured ? configured.replace(/\/+$/, "") : window.location.origin;
    const emailRedirectTo = `${base}/auth/callback?redirect=${encodeURIComponent(
      redirect,
    )}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-2 font-serif text-3xl text-foreground">Entrar</h1>
      <p className="mb-6 text-sm text-muted">
        Enviaremos um link mágico para o seu e-mail. Sem senha.
      </p>

      {sent ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Link enviado! Confira sua caixa de entrada em <strong>{email}</strong>.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-border px-4 py-2.5 outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar link de acesso"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
