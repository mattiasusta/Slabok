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
    register/page.tsx            Registrazione (con conferma password e Termini di Servizio)
    verifica-email/page.tsx      Inserimento codice di verifica email
    termini/page.tsx              Termini di Servizio
    dashboard/page.tsx           Elenco segnalazioni dell'utente (protetto)
    dashboard/new/page.tsx       Form nuova segnalazione (protetto)
    api/
      auth/[...nextauth]/        NextAuth
      register/route.ts          Registrazione (crea utente non verificato, invia codice)
      verify-email/route.ts      Conferma codice di verifica
      resend-verification/route.ts  Reinvio codice
      check/route.ts             Verifica pubblica (GET, no auth)
      cards/route.ts             Lista + creazione segnalazioni (protetto)
      cards/[id]/route.ts        Cancellazione segnalazione (protetto)
      upload/route.ts            Upload foto su Cloudinary (protetto)
  components/                    Navbar, Footer, SearchForm, CardList, AdSlot,
                                  CookieConsent, PasswordInput
  lib/                           prisma client, auth options, validazione, rate limit,
                                  uploads, email (invio codici verifica)
prisma/
  schema.prisma                  Schema DB (User, StolenCard)
render.yaml                      Blueprint di deploy per Render
```

## Schema database

**User**
- `id`, `email` (univoco), `passwordHash`, `isAdmin`, `emailVerifiedAt?` (null finché non
  conferma il codice via email — il login è bloccato finché resta null),
  `emailVerificationCodeHash?`, `emailVerificationCodeExpiresAt?`, `acceptedTosAt`, `createdAt`

**StolenCard**
- `id`, `gradingCompany` (PSA | BECKETT | CGC | TAG), `certNumber`, `cardName`, `grade`
  (Autentica oppure 1...10 con mezzi punti), `certUrl?` (link alla pagina di verifica sul sito
  della compagnia), `signed`, `signatureGrade?` (obbligatorio se `signed`), `description?`,
  `photoUrl?` (facoltativa, URL Cloudinary), `contactPhone?`, `status` (active | resolved),
  `createdAt`, `reporterIp?` (solo per audit interno, mai esposto pubblicamente), `userId`
- Vincolo univoco su `(gradingCompany, certNumber)` per evitare segnalazioni duplicate/spam.

> Nota: compagnia e voto sono stringhe validate a livello applicativo in
> `src/lib/validation.ts`, non enum nativi del database, per semplicità.

## Flussi utente

1. **Vittima di furto**: accetta i Termini di Servizio e si registra (con conferma password) →
   inserisce il codice a 6 cifre ricevuto via email → accede alla dashboard → segnala una carta
   rubata (nome carta, compagnia, certificato, voto, foto/link di verifica/firma opzionali,
   descrizione e telefono opzionali) dichiarando sotto la propria responsabilità di esserne il
   legittimo proprietario → può vedere ed eliminare le proprie segnalazioni.
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
- Verifica email obbligatoria: il login è bloccato finché l'utente non conferma il codice a
  6 cifre ricevuto via email (scade dopo 15 minuti, confrontato tramite hash SHA-256, mai
  salvato in chiaro); endpoint di verifica e reinvio protetti da rate limiting.

## Termini di Servizio e contestazioni

`src/app/termini/page.tsx` contiene una bozza di Termini di Servizio (natura autocertificata
del servizio, responsabilità di chi segnala, procedura di contestazione). **È un testo di
partenza, non validato legalmente**: fallo rivedere da un professionista prima di pubblicare
l'app. Il canale di contestazione è attualmente un semplice mailto
(`slabok.cstservice@gmail.com`).

## Pubblicità

Il monetization model è basato solo su ads (nessun abbonamento/premium). Integrazione AdSense
già pronta e disattivata di default:

- `src/components/CookieConsent.tsx` mostra un banner di consenso cookie (richiesto dal GDPR)
  al primo utilizzo; lo script AdSense si carica solo dopo che l'utente ha cliccato "Accetta".
- `src/components/AdSlot.tsx` mostra un placeholder ("Spazio pubblicitario") finché non sono
  configurate le variabili `NEXT_PUBLIC_ADSENSE_CLIENT_ID`, `NEXT_PUBLIC_ADSENSE_SLOT_BANNER` e
  `NEXT_PUBLIC_ADSENSE_SLOT_BOX` — una volta impostate (dopo l'approvazione di un account
  AdSense e la creazione di due unità annuncio, una per il banner in home e una per il box in
  dashboard), mostra automaticamente gli annunci reali, senza altre modifiche al codice.

## Avvio in locale

1. Copia le variabili d'ambiente:

```bash
cp .env.example .env
```

Compila `.env` con:
- `NEXTAUTH_SECRET`: casuale, es. con `openssl rand -base64 32`.
- `DATABASE_URL`: stringa di connessione Postgres (vedi sezione Neon più sotto).
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`: dalla dashboard Cloudinary.
- `GMAIL_USER` / `GMAIL_APP_PASSWORD`: account Gmail usato per inviare i codici di verifica
  (la App Password si genera su myaccount.google.com/apppasswords, richiede la verifica in
  due passaggi attiva).

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

- Pannello di amministrazione (il campo `isAdmin` esiste già sullo schema e in sessione, ma
  non c'è ancora un'interfaccia per moderare tutte le segnalazioni).
- Stato "risolta" per le segnalazioni (oggi si può solo eliminare la segnalazione).
- Rate limiting distribuito per deploy multi-istanza.
- Canale di contestazione strutturato (form + storico) invece del semplice mailto.
