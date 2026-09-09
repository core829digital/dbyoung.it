# DBYoung.it — Dimitri Bouturline

Sito + e-commerce dell'artista **DBYoung** (Next.js 15 + Convex + Stripe Payment Link + Resend + Calendly).

Brand: **Arancione Fuoco `#FF4D00`** · **Nero Ossidiana `#0A0A0B`** · **Bianco**.

## Pagine

| Route | Contenuto |
|---|---|
| `/` | Hero DBYoung (stile Prisma), stats, shop preview, eventi CTA, newsletter |
| `/artista` | Chi è Dimitri Bouturline |
| `/musica` | Spotify + social (link placeholder in `lib/utils.ts` → `SOCIALS`) |
| `/shop` | Beat, Sample Pack, Offerte (filtri `?type=`) — checkout via Stripe Link |
| `/eventi` | Booking: iframe Calendly + form preventivo |
| `/contatti` | Form contatti |
| `/admin` | Dashboard superadmin (`contact.core829@gmail.com`): stats, prodotti, messaggi |
| `/privacy` `/termini` `/cookie` `/gdpr` | Pagine legali e-commerce |

## Avvio locale

Requisito: **Node.js 20+** (scarica da https://nodejs.org — in questo PC non era installato).

```bash
npm install
cp .env.example .env.local   # compila le chiavi
npm run dev                  # http://localhost:3000
npx convex dev               # backend + database (primo avvio: crea account/progetto)
```

## Deploy (GitHub → Vercel, automatico)

```bash
git init
git add -A
git commit -m "feat: lancio dbyoung.it — hero, shop, booking, admin, legali"
git branch -M main
git remote add origin https://github.com/core829digital/dbyoung.it.git
git push -u origin main
```

Poi su **Vercel**: New Project → Import `core829digital/dbyoung.it` → aggiungi le env
(`NEXT_PUBLIC_CONVEX_URL`, `RESEND_API_KEY`, `ADMIN_EMAIL`) → Deploy.
Domini: `dbyoung.it` (prod) + in futuro `shop.dbyoung.it`, `events.dbyoung.it` (redirect/rewrite alle route `/shop`, `/eventi`).

## TODO prima del go-live (richiedimi questi materiali)

1. ~~Link social~~ ✅ fatto (Spotify + embed, Instagram, Facebook, YouTube, TikTok in `lib/utils.ts`)
2. **Foto/video reali** di Dimitri (hero, pagina artista) — ora Unsplash placeholder
3. **Calendly reale** (`NEXT_PUBLIC_CALENDLY_URL` / `lib/utils.ts`)
4. **Stripe Payment Link** per ogni prodotto (`lib/data.ts` → poi da `/admin`)
5. **Chiavi**: Convex URL, Resend API key + dominio verificato, email attive (info@, booking@, privacy@)
6. **Auth reale admin** (Convex Auth) + banner cookie consenso
7. **Embed Spotify** in `/musica`

Struttura multi-sito futura: `events.dbyoung.it` vivrà in cartella separata e punterà a `/eventi` o a rewrite Vercel.
