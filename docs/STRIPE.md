# Stripe — configurazione DBYoung

Ultimo aggiornamento: 2026-10-20.

## Account

- Account live: `acct_1UJXAwDPkknNT3wY` — **CORE829 SRL** (paese RO), charges/payouts attivi.
- L'account contiene anche prodotti di altri progetti (OneSpec, Immedial): **non vanno modificati**.
- Tutti i prodotti DBYoung sono marcati `metadata.project=dbyoung.it` e `metadata.slug=<slug catalogo>`.

## Catalogo live

| Slug catalogo | Prodotto Stripe | Prezzo | Price ID |
|---|---|---|---|
| `give-a-start` | DBYoung — Give a Start (Beat) | 150,00 € | `price_1USbK6DPkknNT3wYVKjiW6tf` |
| `sacred-voices` | DBYoung — Sacred Voices (Beat) | 120,00 € | `price_1USbK6DPkknNT3wYbt0YXP10` |
| `velvet-tape-neo-soul-chillhop` | DBYoung — Velvet & Tape (Sample Pack) | 25,00 € | `price_1USbK7DPkknNT3wY1Aqrij20` |
| `melancholic-neo-soul-piano` | DBYoung — Melancholic Neo-Soul Piano | 30,00 € | `price_1USbK8DPkknNT3wYoGWAS7lD` |
| `opera-cinematic-orchestral-trap` | DBYoung — Opera Cinematic | 27,00 € | `price_1USbK9DPkknNT3wYt5riXax9` |
| `velvet-nostalgia-cinematic` | DBYoung — Velvet Nostalgia | 35,00 € | `price_1USbK9DPkknNT3wYAFFR9YTG` |
| `bundle-completo` | DBYoung — Bundle completo Sample Packs | 95,00 € | `price_1USbKADPkknNT3wYpXCfoHeC` |
| `produzione-personalizzata` | DBYoung — Produzione personalizzata (acconto) | 350,00 € | `price_1USbKBDPkknNT3wYJicKPIQz` |

`produzione-personalizzata` è `licenseOnly` nel catalogo: il sito mostra “da 350 €” e porta al form contatti.
L'acconto Stripe esiste per fatture manuali dalla dashboard.

Rigenerare/verificare il catalogo:

```powershell
$env:STRIPE_SECRET_KEY = "rk_live_..."   # mai committare
node scripts/stripe-setup.mjs             # idempotente (lookup_key + metadata)
node scripts/stripe-inspect.mjs           # sola lettura
```

## Webhook

- Endpoint: `we_1USbKBDPkknNT3wYEjuRRetk` → `https://www.dbyoung.it/api/stripe/webhook`
- Eventi: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
  `checkout.session.expired`, `payment_intent.succeeded`, `charge.refunded`
- **Dominio:** usare sempre `www.dbyoung.it`. L'apex `dbyoung.it` risponde `308` verso `www` e
  Stripe **non segue i redirect**: un webhook su apex fallirebbe silenziosamente.
- Firma verificata su body raw con `STRIPE_WEBHOOK_SECRET`; senza firma valida → `400`.
- Idempotenza: `stripeEvents.claim(event.id)` + codici licenza deterministici
  `sha256(sessionId:slug)` → retry sicuri, zero doppioni.
- Refund (`charge.refunded`) → `licenses.revokeBySession` (licenze disattivate).

## Checkout

- `POST /api/checkout` riceve solo `{ slug, tier }`: **il prezzo è risolto server-side** dal Price ID.
- `receipt_email` impostato sul PaymentIntent → ricevuta Stripe al cliente.
- `billing_address_collection: required`, `locale: it`.
- I diritti sono conferiti **solo** dal webhook firmato; `/checkout/success` non concede nulla.
- Email post-acquisto: codici licenza + **certificato PDF** con diritto d'autore
  (“Dimitri Bouturline (D.B Young)”) generato da `lib/licensePdf.ts`.

## Variabili d'ambiente

Server-only (mai `NEXT_PUBLIC_*`):

```
STRIPE_SECRET_KEY=rk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_GIVE_A_START=price_...
STRIPE_PRICE_SACRED_VOICES=price_...
STRIPE_PRICE_VELVET_TAPE_NEO_SOUL_CHILLHOP=price_...
STRIPE_PRICE_MELANCHOLIC_NEO_SOUL_PIANO=price_...
STRIPE_PRICE_OPERA_CINEMATIC_ORCHESTRAL_TRAP=price_...
STRIPE_PRICE_VELVET_NOSTALGIA_CINEMATIC=price_...
STRIPE_PRICE_BUNDLE_COMPLETO=price_...
STRIPE_PRICE_PRODUZIONE_PERSONALIZZATA_ACCONTO=price_...
```

Su Vercel vanno aggiunte a **Production** (e Preview se si testa lì) e poi serve redeploy.
La chiave `rk_live_...` è una restricted key: conservarla solo nelle env, mai nel repo.

## Test end-to-end senza incassare

1. Creare in dashboard un coupon **100% off** valido per tutti i prodotti DBYoung.
2. Aprire `/checkout`, aggiungere un prodotto, applicare il coupon nella pagina Stripe.
3. Completare: il webhook deve creare ordine + licenza + email con PDF.
4. Verificare `/libreria` con il codice, poi annullare/rimborsare l'ordine e cancellare i dati di test.

Non usare carte reali per i test. La modalità test (`sk_test_...`) va usata su un account di test separato.

## IVA / ricevute

- Le ricevute Stripe sono abilitate via `receipt_email`; per fatture fiscali complete serve
  configurare **Stripe Tax** e le registrazioni IVA (RO/OSS) nella dashboard.
- Finché Stripe Tax non è attivo, il prezzo è da intendersi IVA inclusa e la ricevuta è
  una conferma di pagamento, non una fattura elettronica.
