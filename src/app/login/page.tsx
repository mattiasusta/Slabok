"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justVerified = searchParams.get("verified") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(email);
        return;
      }
      if (res?.error) {
        setError("Email o password non corretti.");
        return;
      }
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 pt-4">
      <h1 className="text-xl font-bold">Accedi</h1>
      {justVerified && (
        <p className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          Email verificata! Ora puoi accedere.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {unverifiedEmail && (
          <p className="text-sm text-amber-700">
            Devi prima verificare la tua email.{" "}
            <a
              href={`/verifica-email?email=${encodeURIComponent(unverifiedEmail)}`}
              className="underline"
            >
              Vai alla verifica
            </a>
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Attendere..." : "Accedi"}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500">
        Non hai un account?{" "}
        <a href="/register" className="text-indigo-600 hover:underline">
          Registrati
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
