import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SearchForm } from "@/components/SearchForm";
import { AdSlot } from "@/components/AdSlot";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6 pt-2">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Verifica se una carta è rubata</h1>
        <p className="mt-1 text-sm text-slate-500">
          Inserisci compagnia di grading e numero di certificato prima di acquistare.
        </p>
      </div>

      <SearchForm />

      <AdSlot variant="banner" />

      {!session?.user && (
        <p className="text-center text-xs text-slate-400">
          Hai subito un furto?{" "}
          <a href="/register" className="text-indigo-600 hover:underline">
            Registrati
          </a>{" "}
          per segnalare le tue carte.
        </p>
      )}
    </div>
  );
}
