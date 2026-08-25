"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-indigo-700">
          SLABOK
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {status === "authenticated" ? (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-slate-600 hover:text-red-600">
              Esci
            </button>
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

      {status === "authenticated" && (
        <div className="mx-auto flex max-w-lg gap-1 px-4 pb-2">
          <Link
            href="/"
            className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium ${
              pathname === "/"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Verifica carta rubata
          </Link>
          <Link
            href="/dashboard"
            className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium ${
              pathname?.startsWith("/dashboard")
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Le mie segnalazioni
          </Link>
        </div>
      )}
    </header>
  );
}
