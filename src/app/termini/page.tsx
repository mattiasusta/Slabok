export const metadata = {
  title: "Termini di Servizio — SLABOK",
};

export default function TerminiPage() {
  return (
    <div className="space-y-4 pt-4 text-sm leading-relaxed text-slate-700">
      <h1 className="text-xl font-bold text-slate-900">Termini di Servizio</h1>
      <p className="text-xs text-slate-400">
        Ultimo aggiornamento: 25 agosto 2026. Testo redatto per l&apos;avvio del servizio; non
        sostituisce una consulenza legale personalizzata — se il servizio crescerà in modo
        significativo, ha senso farlo rivedere da un professionista.
      </p>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">1. Cos&apos;è SLABOK</h2>
        <p>
          SLABOK (&quot;il Servizio&quot;) è un registro di autosegnalazioni gestito da Mattia
          Susta (&quot;il Gestore&quot;): chiunque può dichiarare che una carta collezionabile
          graduta (identificata da compagnia di grading e numero di certificato) gli è stata
          rubata, e chiunque può verificare se una carta risulta segnalata prima di acquistarla.
          Il Servizio non verifica in modo indipendente la veridicità delle segnalazioni e non
          effettua alcun accertamento legale, giudiziario o di polizia. Il risultato di una
          ricerca non costituisce prova legale di furto né di proprietà, ed è solo
          un&apos;indicazione basata sulle segnalazioni ricevute fino a quel momento.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">2. Chi può usare il Servizio</h2>
        <p>
          La ricerca è aperta a chiunque, senza registrazione. La creazione di un account e
          l&apos;invio di segnalazioni sono riservati a chi ha almeno 18 anni e capacità legale di
          accettare questi termini. Sei responsabile della riservatezza delle tue credenziali di
          accesso e di tutte le attività svolte tramite il tuo account.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">3. Responsabilità di chi segnala</h2>
        <p>
          Chi crea una segnalazione dichiara, sotto la propria responsabilità e ai sensi
          dell&apos;art. 76 del D.P.R. 445/2000 sulle dichiarazioni mendaci, di essere il
          legittimo proprietario della carta e che quanto dichiarato corrisponde al vero.
          Segnalazioni false, effettuate in mala fede o al solo scopo di danneggiare terzi (ad
          esempio un venditore legittimo), possono integrare reati quali la diffamazione o la
          calunnia, comportare responsabilità civile per i danni causati, e la rimozione
          immediata della segnalazione e/o la sospensione dell&apos;account da parte nostra.
        </p>
        <p>
          Conserviamo l&apos;indirizzo IP di chi invia una segnalazione (mai mostrato
          pubblicamente) a fini di audit interno, in caso di contestazioni, abusi o richieste
          legittime da parte dell&apos;autorità giudiziaria.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">4. Usi vietati</h2>
        <p>È vietato usare il Servizio per:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>inviare segnalazioni false o riguardanti carte non di tua proprietà;</li>
          <li>
            raccogliere sistematicamente (scraping) i dati del Servizio, aggirare i limiti di
            frequenza delle richieste, o interferire con il suo normale funzionamento;
          </li>
          <li>
            caricare foto o testi che violino diritti di terzi, contengano contenuti illeciti, o
            non siano pertinenti alla segnalazione di una carta rubata;
          </li>
          <li>usare l&apos;account di un&apos;altra persona senza autorizzazione.</li>
        </ul>
        <p>
          Ci riserviamo il diritto di rimuovere contenuti e sospendere o eliminare account che
          violano questi termini, senza preavviso in caso di abuso grave.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">5. Come contestare una segnalazione</h2>
        <p>
          Se ritieni che una carta sia stata segnalata come rubata ingiustamente (ad esempio è
          stata ritrovata, la segnalazione è errata o in mala fede), puoi contestarla usando il
          link &quot;Contesta questa segnalazione&quot; mostrato accanto al risultato, oppure
          scrivendo direttamente a{" "}
          <a href="mailto:slabok.cstservice@gmail.com" className="text-indigo-600 hover:underline">
            slabok.cstservice@gmail.com
          </a>
          , indicando compagnia di grading e numero di certificato. Valuteremo la richiesta e, se
          fondata, rimuoveremo la segnalazione. Lo stesso indirizzo va usato per qualsiasi altra
          richiesta relativa al Servizio, incluse le richieste sui tuoi dati personali (vedi
          sezione 7).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">6. Nessuna garanzia e limitazione di responsabilità</h2>
        <p>
          Il Servizio è fornito &quot;così com&apos;è&quot;, senza garanzie di accuratezza,
          completezza o disponibilità continua. Nei limiti consentiti dalla legge, il Gestore non
          è responsabile per danni diretti o indiretti derivanti dall&apos;uso o dall&apos;
          impossibilità di uso del Servizio, inclusi — a titolo esemplificativo — l&apos;acquisto
          di una carta rubata non ancora segnalata, o conseguenze derivanti da una segnalazione
          successivamente rivelatasi errata o in mala fede. Il Servizio non fornisce consulenza
          legale, di investimento o di autenticazione di carte.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">7. Dati personali</h2>
        <p>
          Trattiamo i seguenti dati: email e password (account), indirizzo IP e data di invio
          delle segnalazioni (audit interno, mai pubblici), ed eventuali dati che scegli di
          inserire in una segnalazione (foto, telefono, descrizione) — questi ultimi sono
          visibili pubblicamente a chi effettua una ricerca, solo se li aggiungi volontariamente.
          Le foto vengono ospitate da Cloudinary; i dati dell&apos;account e delle segnalazioni da
          Neon (database); le email di verifica sono inviate tramite Brevo. Puoi richiedere in
          qualsiasi momento l&apos;accesso, la correzione o la cancellazione dei tuoi dati
          scrivendo a{" "}
          <a href="mailto:slabok.cstservice@gmail.com" className="text-indigo-600 hover:underline">
            slabok.cstservice@gmail.com
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">8. Pubblicità e cookie</h2>
        <p>
          Il Servizio è gratuito e finanziato tramite spazi pubblicitari forniti da network di
          terze parti (Google AdSense), che possono utilizzare cookie secondo le proprie policy.
          Questi cookie vengono caricati solo dopo il tuo consenso esplicito, richiesto al primo
          accesso.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">9. Legge applicabile</h2>
        <p>
          Questi termini sono regolati dalla legge italiana. Per qualsiasi controversia è
          competente il foro del luogo di residenza del Gestore, salvo quanto diversamente
          previsto da norme inderogabili a tutela del consumatore.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900">10. Modifiche</h2>
        <p>
          Questi termini possono essere aggiornati nel tempo; la data in cima alla pagina indica
          l&apos;ultimo aggiornamento. L&apos;uso continuato del Servizio dopo una modifica
          implica l&apos;accettazione dei nuovi termini.
        </p>
      </section>
    </div>
  );
}
