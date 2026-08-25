# SLABOK

Applicazione web per verificare se una carta collezionabile graduta (PSA, Beckett, CGC, TAG)
è stata segnalata come rubata, prima di acquistarla.

## Stack

- **Next.js 16** (App Router) + TypeScript + React 19
- **Prisma** + **Postgres** (pensato per un piano gratuito come [Neon](https://neon.tech))
- **NextAuth.js** (Credentials provider, sessioni JWT) per l'autenticazione delle vittime
- **Tailwind CSS** per un'interfaccia mobile-first minimale
- **Zod** per la validazione degli input
- Upload immagini su [Cloudinary](https://cloudinary.com) (piano gratuito)
- Rate limiting in-memory di base sugli endpoint sensibili

## Architettura

```
src/
  app/
    page.tsx                    Home: form di verifica pubblico
    login/page.tsx               Login
    register/page.tsx            Registrazione (con accettazione Termini di Servizio)
    termini/page.tsx              Termini di Servizio
    dashboard/page.tsx           Elenco segnalazioni dell'utente (protetto)
    dashboard/new/page.tsx       Form nuova segnalazione (protetto)
    api/
      auth/[...nextauth]/        NextAuth
      register/route.ts          Registrazione nuovo utente
      check/route.ts             Verifica pubblica (GET, no auth)
      cards/route.ts             Lista + creazione segnalazioni (protetto)
      cards/[id]/route.ts        Cancellazione segnalazione (protetto)
      upload/route.ts            Upload foto su Cloudinary (protetto)
  components/                    Navbar, Footer, SearchForm, CardList, AdSlot
  lib/                           prisma client, auth options, validazione, rate limit, uploads
prisma/
  schema.prisma                  Schema DB (User, StolenCard)
render.yaml                      Blueprint di deploy per Render
```

## Schema database

**User**
- `id`, `email` (univoco), `passwordHash`, `acceptedTosAt`, `createdAt`

**StolenCard**
- `id`, `gradingCompany` (PSA | BECKETT | CGC | TAG), `certNumber`, `cardName`, `grade`
  (Autentica oppure 1...10 con mezzi punti), `certUrl?` (link alla pagina di verifica sul sito
  della compagnia), `signed`, `signatureGrade?` (obbligatorio se `signed`), `description?`,
  `photoUrl` (obbligatoria, URL Cloudinary), `contactPhone?`, `status` (active | resolved),
  `createdAt`, `reporterIp?` (solo per audit interno, mai esposto pubblicamente), `userId`
- Vincolo univoco su `(gradingCompany, certNumber)` per evitare segnalazioni duplicate/spam.

> Nota: compagnia e voto sono stringhe validate a livello applicativo in
> `src/lib/validation.ts`, non enum nativi del database, per semplicità.

## Flussi utente

1. **Vittima di furto**: accetta i Termini di Servizio e si registra → accede alla dashboard →
   segnala una carta rubata (nome carta, compagnia, certificato, voto, foto obbligatoria,
   eventuale link di verifica, eventuale firma con relativo voto, descrizione e telefono
   opzionali) dichiarando sotto la propria responsabilità di esserne il legittimo proprietario
   → può vedere ed eliminare le proprie segnalazioni.
2. **Acquirente (senza account)**: dalla home inserisce compagnia + numero certificato →
   riceve subito un esito ✅/⚠️ con foto, voto, eventuale link di verifica e recapito (se
   condiviso dalla vittima) → se ritiene la segnalazione errata, può contestarla direttamente
   dal risultato.

## Sicurezza e anti-abuso

- Password hashate con bcrypt, mai salvate in chiaro.
- Validazione rigorosa di tutti gli input con Zod.
- Autocertificazione obbligatoria: chi segnala deve dichiarare esplicitamente di esserne il
  proprietario; l'IP della richiesta viene conservato (non esposto pubblicamente) a fini di
  audit in caso di contestazione o abuso.
- Numeri di certificato normalizzati (trim + maiuscolo) per evitare duplicati "quasi uguali".
- Vincolo di unicità DB su `(gradingCompany, certNumber)`.
- Rate limiting in-memory su `/api/check`, `/api/register`, `/api/upload` e creazione
  segnalazioni (adatto a un singolo processo/MVP: per il deploy multi-istanza sostituire con
  una soluzione condivisa come Upstash Redis).
- L'endpoint di verifica pubblico non espone mai email, id utente o IP della vittima.
- Upload immagini: solo JPG/PNG/WEBP, max 5 MB, caricate direttamente su Cloudinary (mai
  scritte sul filesystem del server).

## Termini di Servizio e contestazioni

`src/app/termini/page.tsx` contiene una bozza di Termini di Servizio (natura autocertificata
del servizio, responsabilità di chi segnala, procedura di contestazione). **È un testo di
partenza, non validato legalmente**: fallo rivedere da un professionista prima di pubblicare
l'app. Il canale di contestazione è attualmente un semplice mailto (`supporto@slabok.app`,
da sostituire con un indirizzo reale che monitori attivamente).

## Pubblicità

Il monetization model è basato solo su ads (nessun abbonamento/premium). Il componente
`src/components/AdSlot.tsx` è un placeholder non invasivo (banner in home, box in dashboard):
sostituiscine il contenuto con lo script/tag reale di Google AdSense (o altro network) usando
la variabile `NEXT_PUBLIC_ADSENSE_CLIENT_ID`. Prima di attivare qualsiasi network pubblicitario
serve un banner di consenso cookie conforme GDPR.

## Avvio in locale

1. Copia le variabili d'ambiente:

```bash
cp .env.example .env
```

Compila `.env` con:
- `NEXTAUTH_SECRET`: casuale, es. con `openssl rand -base64 32`.
- `DATABASE_URL`: stringa di connessione Postgres (vedi sezione Neon più sotto).
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`: dalla dashboard Cloudinary.

2. Installa le dipendenze:

```bash
npm install
```

3. Applica lo schema al database:

```bash
npm run db:push
```

4. Avvia il server di sviluppo:

```bash
npm run dev
```

5. Apri [http://localhost:3000](http://localhost:3000).

## Andare in produzione (gratis) su Render

Il piano gratuito di Render non ha disco persistente: database e foto devono vivere su servizi
esterni gratuiti. Passaggi:

1. **Neon** (database) — crea un account su [neon.tech](https://neon.tech), crea un progetto,
   copia la stringa di connessione (formato `postgresql://user:password@host/db?sslmode=require`).
2. **Cloudinary** (foto) — crea un account su [cloudinary.com](https://cloudinary.com), dalla
   dashboard copia *Cloud name*, *API Key* e *API Secret*.
3. **GitHub** — crea un repository e pusha il codice del progetto.
4. **Render** — dalla dashboard, "New" → "Blueprint", collega il repository: Render legge
   `render.yaml` e crea automaticamente il servizio. Quando richiesto, incolla i valori delle
   variabili d'ambiente (`DATABASE_URL`, `NEXTAUTH_SECRET`, `CLOUDINARY_*`); `NEXTAUTH_URL`
   va impostata con l'URL pubblico assegnato da Render (es. `https://slabok.onrender.com`),
   aggiornabile dopo il primo deploy.

Al primo deploy, il comando di build (`npm run db:push`) crea automaticamente le tabelle sul
database Neon. Il piano gratuito Render "addormenta" il servizio dopo 15 minuti di inattività:
la prima richiesta dopo una pausa impiega qualche decina di secondi in più a rispondere.

## Possibili estensioni future

- Verifica email in fase di registrazione.
- Stato "risolta" per le segnalazioni (oggi si può solo eliminare la segnalazione).
- Rate limiting distribuito per deploy multi-istanza.
- Canale di contestazione strutturato (form + storico) invece del semplice mailto.
