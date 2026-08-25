"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-indigo-700">
          SLABOK
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {status === "authenticated" ? (
            <>
              <Link href="/dashboard" className="text-slate-600 hover:text-indigo-700">
                Le mie segnalazioni
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-slate-600 hover:text-red-600"
              >
                Esci
              </button>
            </>
          ) : status === "loading" ? null : (
            <>
              <Link href="/login" className="text-slate-600 hover:text-indigo-700">
                Accedi
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
              >
                Registrati
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
