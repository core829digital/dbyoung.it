# Task List — dbyoung.it (roadmap Stripe + lancio)

Legenda: `[ ]` da fare · `[~]` in corso · `[x]` fatto in codice.
Ultimo aggiornamento: 2026-10-20.

## Stato implementazione (2026-10-20)

Verificato con `vitest` (26 test verdi), `tsc --noEmit` pulito e `next build` verde.
**Stripe LIVE collegato:** account `acct_1UJXAwDPkknNT3wY` (CORE829 SRL, paese RO, charges/payouts attivi).
Catalogo creato con metadata `project=dbyoung.it` (non tocca i prodotti OneSpec/Immedial):
Give a Start 150 €, Sacred Voices 120 €, Velvet & Tape 25 €, Melancholic Piano 30 €,
Opera Cinematic 27 €, Velvet Nostalgia 35 €, Bundle completo 95 €, Produzione personalizzata (acconto) 350 €.
Webhook dedicato `we_1USbKBDPkknNT3wYEjuRRetk` → `https://www.dbyoung.it/api/stripe/webhook`.
Checkout live di prova creato e annullato: totale 245,00 € corretto (Give a Start + Bundle).
Resend verificato (domini `dbyoung.it`, `onespec.eu`, `core829.net` verificati; email di test inviata).
**Resta all'operatore (servizi live):**
`npx convex dev` (login browser) + env Convex (`ADMIN_ACTION_SECRET`, `TOTP_ENCRYPTION_KEY`, `ADMIN_EMAILS`);
env Vercel (`STRIPE_*`, `ADMIN_*`, `RESEND_*`, `TURNSTILE_*`, Convex) + redeploy;
chiavi Turnstile; creazione primo admin (email in `ADMIN_EMAILS`); dry-run staging completo.

## Stato attuale (verificato sul codice)

- Checkout Stripe **attivo**: prezzi solo server-side (Price ID in env), webhook firmato con idempotenza,
  ricevuta Stripe (`payment_intent_data.receipt_email`) e certificato di licenza PDF allegato via Resend.
- Auth admin e portale cliente reali (sessioni + 2FA TOTP); validazione Zod e sanitizzazione su tutte le API.
- Immagini WebP + `next/image`; 26 test (validazione, sanitizzazione, IP allowlist, TOTP RFC 6238, HMAC Node↔Convex, PDF).

---

## 1. Webhook Stripe con verifica di firma (event-driven) `[x]`

Principio: **mai fidarsi di callback client** (es. parametri in `success_url` che un hacker può forgiare).
Solo gli eventi firmati da Stripe conferiscono diritti (licenze/ordini).

- [ ] Installare SDK `stripe`, creare `app/api/stripe/webhook/route.ts`
- [ ] Leggere il **body raw** (`await req.text()`, mai `req.json()` prima della verifica) e validare l'header `stripe-signature` con `stripe.webhooks.constructEvent` + `STRIPE_WEBHOOK_SECRET`
- [ ] Gestire solo eventi verificati: `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`, `checkout.session.expired`
- [ ] Idempotenza: registrare `stripeEventId` (nuovo campo/indice su `orders`) e ignorare eventi già processati
- [ ] Fulfillment nel webhook: creare licenza `DBY-XXXX-XXXX` via `convex/licenses.ts` + email con codice e link `/libreria`
- [ ] Rispondere `200` in fretta; `400` su firma invalida; loggare ogni tentativo fallito
- [ ] Secret solo server-side (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` in env + Vercel, mai `NEXT_PUBLIC_*`)
- [ ] Registrare l'endpoint webhook nella dashboard Stripe (URL produzione) e testare con `stripe trigger`
- Criterio di accettazione: ordine conferito **solo** da evento firmato; replay/forgery test falliscono senza effetti

## 2. Allowlist IP da configurazione + azioni Convex firmate `[x]`

Principio: IP consentiti **solo in configurazione** (env, mai hardcoded); le azioni privilegiate Convex richiedono **sempre** autorizzazione firmata dal server.
Nota tecnica onesta: le function Convex **non vedono l'IP del client**, quindi l'allowlist va applicata nel layer Next.js (middleware/API) usando gli header del proxy fidato, e le mutation privilegiate devono esigere un token HMAC firmato dal server.

- [ ] Nuova `middleware.ts`: check allowlist su `/admin` e API sensibili (`ADMIN_IP_ALLOWLIST`, supportata sintassi CIDR). 403 + log su IP negato
- [ ] Helper `lib/ipAllowlist.ts`: parsing CIDR, gestione `x-forwarded-for` con proxy fidati documentati (limite noto: dietro CDN l'IP è falsificabile → è difesa-in-profondità, non unico controllo)
- [ ] `lib/adminSign.ts` (server): firma HMAC-SHA256 di `{action, params, exp}` con `ADMIN_ACTION_SECRET`
- [ ] Verifica firma + scadenza **dentro** ogni mutation privilegiata (`products.create/setActive/remove`, `licenses.create/revoke`, `*.list` admin) in `convex/`
- [ ] Secret `ADMIN_ACTION_SECRET` in env server + env Convex; rotazione documentata
- [ ] Test: mutation senza firma / firma scaduta / firma manomessa → sempre rifiutate
- Criterio di accettazione: chiamate Convex dirette (bypassando il sito) non possono eseguire azioni admin

## 3. Input validation su tutto il sito `[x]`

- [ ] Aggiungere `zod`; creare `lib/validation.ts` con schemi condivisi client+server (contact, booking, newsletter, license-verify, prodotto admin, carrello, checkout, auth)
- [ ] Applicare gli schemi in **tutte** le API route (oggi solo 3 route hanno controlli manuali) + form client (messaggi d'errore localizzati IT/EN)
- [ ] Validazione in Convex: lunghezze min/max, formato email, date (`YYYY-MM-DD` future per booking), range prezzi, charset consentiti per `filePath`/`stripeLink`
- [ ] Validare `stripeLink` (solo `https://buy.stripe.com/...` o `https://checkout.stripe.com/...`) prima del salvataggio
- [ ] Test Vitest per ogni schema (validi, limite, maligni)
- Criterio di accettazione: nessun input fuori schema raggiunge DB, email o Stripe

## 4. Input sanitization su tutto il sito `[x]`

- [ ] Creare `lib/sanitize.ts`: trim, normalizzazione Unicode (NFKC), rimozione null-byte e control-char, collasso whitespace, lowercase per email
- [ ] Applicare al confine API + Convex + form admin; mantenere `escapeHtml` nelle email (già in `lib/mail.ts`)
- [ ] Policy: solo testo semplice ovunque (niente HTML utente); se un giorno serve rich-text, introdurre DOMPurify lato server
- [ ] Sanitizzare ciò che finisce in inbox admin e nelle email (oggetti compresi)
- [ ] CSP già presente in `next.config.mjs`: rivederla quando si aggiungono Stripe.js e Turnstile (nonce/allowlist domini)
- Criterio di accettazione: payload `<script>`, `onerror`, unicode-trick e header-injection neutralizzati nei test

## 5. Tutte le immagini in WebP `[x]`

- [ ] Convertire tutti i PNG di `public/dimitri-potos/` (~13 MB) in WebP (qualità ~80, max-width 1920); rimuovere i 3 loghi duplicati (tenerne 1); rinominare file con slug senza spazi/virgole
- [ ] Aggiornare i percorsi in `lib/i18n.tsx` (`PHOTOS`), `lib/data.ts` (`ARTWORK_PACKS`), `app/layout.tsx` (icone + OG image)
- [ ] Migrare i 13 `<img>` a `next/image` con `sizes` (elenco: `app/admin`, `app/artista`, `app/eventi`(rimossa), `app/page`, `footer`, `app/opere`, `app/libreria`, `navbar`, `product-card`, `prisma-hero`)
- [ ] Aggiungere `sharp` per l'ottimizzazione in produzione; verificare pesi finali e CLS=0
- Criterio di accettazione: zero PNG/JPG locali, Lighthouse immagini verde, nessun layout shift

## 6. Portale cliente + Cloudflare Turnstile `[x]`

Autenticazione reale (prerequisito di 7 per gli acquisti loggati). Provider suggerito: Convex Auth.

- [ ] Account: register (email+password, verifica email via OTP con Resend), login, logout, reset password (token hash + scadenza singola-uso)
- [ ] 2FA TOTP: setup con QR, codici di recupero, enforcement opzionale/obbligatoria; sessioni con revoca
- [ ] Turnstile: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + verifica server `TURNSTILE_SECRET_KEY` su register, login, reset, checkout; widget `<TurnstileWidget>` con fallback d'errore
- [ ] Pagine: `/account` (login/register/reset), `/account/ordini`, `/account/licenze`, `/account/sicurezza` (2FA, cambio password, sessioni)
- [ ] Migrazione schema: `userId` su `licenses` e `orders`; collegare licenze esistenti via email al primo login
- [ ] Rate-limit + lockout su tentativi auth; hashing password delegato al provider (mai in chiaro, mai nei log)
- [ ] Aggiornare `privacy`/`termini`/`cookie` (account, 2FA, Turnstile, Stripe)
- Criterio di accettazione: registrazione→verifica→login→2FA→reset funzionano end-to-end; bot bloccati da Turnstile nei test

## 7. Carrello + checkout su Stripe `[x]` (eccetto Stripe Tax: si attiva in dashboard Stripe)

Dipende da: 1 (webhook), 3+4 (validazione/sanitizzazione), 6 (account per acquisti loggati; checkout ospite via email come fallback).

- [ ] Carrello: `lib/cart.ts` (stato + localStorage), drawer UI, quantità/tipi licenza (Base/Premium/Esclusiva da `app/termini`)
- [ ] Pagina `/checkout`: riepilogo, email (o account), accettazione termini, Turnstile
- [ ] `POST /api/checkout`: **prezzi solo server-side** (mappa slug → Stripe Price ID in config, mai fidarsi del totale inviato dal client) → crea Checkout Session → redirect a Stripe
- [ ] Pagine `/checkout/success` (riepilogo, mai diritti) e `/checkout/cancel`; diritti conferiti solo dal webhook (task 1)
- [ ] Estendere `/libreria`: se loggato mostra ordini + licenze + download; se ospite resta la verifica codice
- [ ] Stripe Tax per IVA beni digitali UE; flusso refund (`charge.refunded` → revoca licenza)
- [ ] Test: checkout completo in modalità test Stripe fino a licenza recapitata
- Criterio di accettazione: prezzo manipolato dal client impossibile; ogni pagamento test genera licenza via webhook e nient'altro

## 8. Cosa manca per il lancio (gap analysis) `[ ]`

Vedi risposta estesa in chat del 2026-10-14. In breve, oltre ai task 1–7:

- [x] Account Stripe live: chiavi live, webhook di produzione registrato, Price ID per prodotto (Stripe Tax da attivare in dashboard quando ci sono le registrazioni IVA)
- [ ] Vercel env di produzione complete (`RESEND_*`, `STRIPE_*`, `TURNSTILE_*`, `ADMIN_*`, Convex prod) + redeploy
- [ ] Allineare progetto Convex: deployare le funzioni e impostare le env (`ADMIN_ACTION_SECRET`, `TOTP_ENCRYPTION_KEY`, `ADMIN_EMAILS`) sul deployment attivo `accurate-walrus-397`
- [x] Auth admin reale (gate email client-side rimosso)
- [ ] DNS live: `events.dbyoung.it` + verifica redirect 308 da `/eventi`
- [x] Legali aggiornate (account, pagamenti, 2FA, Turnstile, Stripe, refund policy, termini licenze)
- [ ] Backup/restore `private_audio/` + procedura fulfillment manuale; test download ZIP in produzione
- [ ] Monitoraggio (Sentry), uptime, inbox operativa (info@), runbook + piano rollback
- [ ] Dry-run completo in staging: registrazione → 2FA → carrello → pagamento test → licenza → download → refund
