# Deploy / go-live DBYoung

Ultimo aggiornamento: 2026-10-20.

## 1. Convex (backend)

**Produzione:** `festive-ptarmigan-321` (dev: `accurate-walrus-397`).

```powershell
npx convex login          # una volta, browser
$env:CONVEX_DEPLOYMENT='prod:festive-ptarmigan-321'
npx convex deploy         # deploy funzioni + schema in produzione
```

Per il solo sviluppo: `npx convex dev --once` (usa `dev:accurate-walrus-397` da `.env.local`).

Impostare le env **sul deployment Convex** (stessi valori del server Next):

```powershell
$env:CONVEX_DEPLOYMENT='prod:festive-ptarmigan-321'
powershell -ExecutionPolicy Bypass -File scripts/set-convex-env.ps1
```

Lo script legge i valori da `.env.local` e non li stampa. In alternativa:

```powershell
npx convex env set ADMIN_ACTION_SECRET "<64 hex>"
npx convex env set TOTP_ENCRYPTION_KEY "<base64 32 byte>"
npx convex env set ADMIN_EMAILS "contact.core829@gmail.com"
```

`ADMIN_ACTION_SECRET` deve essere **identico** a quello di Vercel/`.env.local`, altrimenti
le mutation firmate (ordini, licenze, admin) vengono rifiutate.

Verifica:

```powershell
npx convex env list
npx convex dev --once
```

## 1b. Storage audio (Vercel Blob)

I file audio (≈1 GB) **non** sono nel repo e non vengono deployati su Vercel. Servono da Vercel Blob:

1. Vercel → **Storage → Blob → Create** (store `dbyoung-audio`).
2. Copiare `BLOB_READ_WRITE_TOKEN` nella dashboard e in `.env.local`.
3. Caricare i file (crea ZIP dei pack, salta il bundle):

```powershell
npx --yes tsx scripts/upload-blob.ts
```

Lo script stampa le env `BLOB_URL_*` e le salva in `.env.blob.local` (gitignored).
Aggiungerle a `.env.local`, `.env.vercel.local` e alle env **Production** di Vercel.
Senza `BLOB_URL_*` il download usa `private_audio/` in locale e in produzione risponde `410`.

Il bundle (`bundle-completo`) non ha un file unico: il webhook emette **4 licenze separate**,
una per ciascun sample pack. Così lo storage resta sotto 1 GB e i download sono più veloci.

## 2. Vercel (frontend + API)

Aggiungere in **Production** (e Preview se serve):

```
NEXT_PUBLIC_SITE_URL=https://www.dbyoung.it
NEXT_PUBLIC_CONVEX_URL=https://festive-ptarmigan-321.convex.cloud
CONVEX_HTTP_URL=https://festive-ptarmigan-321.convex.site
NEXT_PUBLIC_CONVEX_SITE_URL=https://festive-ptarmigan-321.convex.site
CONVEX_DEPLOYMENT=prod:festive-ptarmigan-321

RESEND_API_KEY=...
RESEND_FROM=DBYoung <noreply@dbyoung.it>

STRIPE_SECRET_KEY=rk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_GIVE_A_START=...
STRIPE_PRICE_SACRED_VOICES=...
STRIPE_PRICE_VELVET_TAPE_NEO_SOUL_CHILLHOP=...
STRIPE_PRICE_MELANCHOLIC_NEO_SOUL_PIANO=...
STRIPE_PRICE_OPERA_CINEMATIC_ORCHESTRAL_TRAP=...
STRIPE_PRICE_VELVET_NOSTALGIA_CINEMATIC=...
STRIPE_PRICE_BUNDLE_COMPLETO=...
STRIPE_PRICE_PRODUZIONE_PERSONALIZZATA_ACCONTO=...

ADMIN_ACTION_SECRET=...
TOTP_ENCRYPTION_KEY=...
ADMIN_EMAILS=contact.core829@gmail.com
ADMIN_IP_ALLOWLIST=            # vuoto = nessun filtro; inserire IP/CIDR quando noti

NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...

BLOB_READ_WRITE_TOKEN=...
BLOB_URL_GIVE_A_START=...
BLOB_URL_SACRED_VOICES=...
BLOB_URL_VELVET_TAPE_NEO_SOUL_CHILLHOP=...
BLOB_URL_MELANCHOLIC_NEO_SOUL_PIANO=...
BLOB_URL_OPERA_CINEMATIC_ORCHESTRAL_TRAP=...
BLOB_URL_VELVET_NOSTALGIA_CINEMATIC=...
```

Dopo l'aggiunta: **Redeploy** (le env non si applicano ai deploy già esistenti).

Scorciatoia: il file locale **gitignored** `.env.vercel.local` contiene già tutte le variabili
(Stripe, Convex prod, Resend, admin) pronte per la produzione. Due modi:

- **Dashboard (manuale):** Project → Settings → Environment Variables → *Import .env* (o incolla
  il contenuto di `.env.vercel.local`) → ambiente **Production** → Save.
- **CLI:** dopo `npx vercel login`:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/push-vercel-env.ps1 -Project dbyoung.it
  npx vercel --prod --project dbyoung.it
  ```

Le chiavi Turnstile e le `BLOB_*` vanno aggiunte prima del redeploy.

## 3. Turnstile

Senza `TURNSTILE_SECRET_KEY` in produzione i form pubblici, login e checkout vengono rifiutati
(bypass solo in sviluppo). Creare un widget Cloudflare Turnstile per `www.dbyoung.it` e copiare
site key + secret.

## 4. Primo admin

1. Registrarsi su `/account` con un'email presente in `ADMIN_EMAILS`.
2. Verificare l'email, attivare la 2FA.
3. Accedere a `/admin` (soggetto a `ADMIN_IP_ALLOWLIST`).

## 5. Test end-to-end (senza incassare)

Vedi `docs/STRIPE.md` → coupon 100% e verifica di ordine, licenza, email + PDF, download, refund.

Checklist minima:

- [ ] `POST /api/stripe/webhook` con firma invalida → `400`
- [ ] Coupon 100% → webhook `200`, ordine + licenza creati, email con PDF ricevuta
- [ ] `/libreria` con codice → download ZIP/beat
- [ ] Refund dalla dashboard Stripe → licenza disattivata (`active=false`)
- [ ] `/admin` bloccato fuori allowlist e senza 2FA
- [ ] `/eventi` → `308` verso `https://events.dbyoung.it`
- [ ] Pagine legali aggiornate e link presenti nel footer

## 6. Dominio

`https://dbyoung.it` risponde `308` → `https://www.dbyoung.it`: usare sempre **www** per
webhook, success/cancel URL, email e canonical. `events.dbyoung.it` risponde direttamente.
