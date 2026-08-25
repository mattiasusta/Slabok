export const metadata = {
  title: "Termini di Servizio — SLABOK",
};

export default function TerminiPage() {
  return (
    <div className="space-y-4 pt-4 text-sm leading-relaxed text-slate-700">
      <h1 className="text-xl font-bold text-slate-900">Termini di Servizio</h1>
      <p className="text-xs text-slate-400">
        Ultimo aggiornamento: da definire. Questo testo è una bozza di partenza: fallo rivedere
        da un professionista legale prima di pubblicare l&apos;app.
      </p>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">1. Cos&apos;è SLABOK</h2>
        <p>
          SLABOK è un registro di autosegnalazioni: chiunque può dichiarare che una carta
          collezionabile graduta (identificata da compagnia di grading e numero di certificato)
          gli è stata rubata. SLABOK non verifica in modo indipendente la veridicità delle
          segnalazioni e non effettua alcun accertamento legale, giudiziario o di polizia. Il
          risultato di una ricerca non costituisce prova legale di furto né di proprietà.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">2. Responsabilità di chi segnala</h2>
        <p>
          Chi crea una segnalazione dichiara, sotto la propria responsabilità, di essere il
          legittimo proprietario della carta e che quanto dichiarato corrisponde al vero.
          Segnalazioni false, effettuate in mala fede o al solo scopo di danneggiare terzi
          (ad esempio un venditore legittimo), possono comportare conseguenze legali a carico di
          chi le ha effettuate e la rimozione immediata della segnalazione da parte nostra.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">3. Come contestare una segnalazione</h2>
        <p>
          Se ritieni che una carta sia stata segnalata come rubata ingiustamente (ad esempio è
          stata ritrovata, la segnalazione è errata o in mala fede), puoi contestarla usando il
          link &quot;Contesta questa segnalazione&quot; mostrato accanto al risultato, oppure
          scrivendo direttamente a{" "}
          <a href="mailto:supporto@slabok.app" className="text-indigo-600 hover:underline">
            supporto@slabok.app
          </a>
          , indicando compagnia di grading e numero di certificato. Valuteremo la richiesta e, se
          fondata, rimuoveremo la segnalazione.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">4. Nessuna garanzia</h2>
        <p>
          Il servizio è fornito &quot;così com&apos;è&quot;, senza garanzie di accuratezza,
          completezza o disponibilità continua. Prima di acquistare una carta, l&apos;assenza di
          segnalazioni su SLABOK non garantisce che la carta non sia rubata: è solo un&apos;
          indicazione basata sulle segnalazioni ricevute fino a quel momento.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">5. Pubblicità e dati</h2>
        <p>
          Il servizio è gratuito e finanziato tramite spazi pubblicitari forniti da network di
          terze parti, che possono utilizzare cookie secondo le proprie policy. I dati di contatto
          (es. numero di telefono) inseriti in una segnalazione vengono mostrati pubblicamente solo
          se l&apos;utente sceglie volontariamente di condividerli.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">6. Modifiche</h2>
        <p>
          Questi termini possono essere aggiornati nel tempo. L&apos;uso continuato del servizio
          dopo una modifica implica l&apos;accettazione dei nuovi termini.
        </p>
      </section>
    </div>
  );
}
