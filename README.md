# DBYoung.it — Dimitri Boutourline

Sito + e-commerce dell'artista **DBYoung** (Next.js 15 + Convex + Stripe Payment Link + Resend + Calendly).

Brand: **Arancione Fuoco `#FF4D00`** · **Nero Ossidiana `#0A0A0B`** · **Bianco**.

## Pagine

| Route | Contenuto |
|---|---|
| `/` | Hero DBYoung (stile Prisma), stats, shop preview, eventi CTA, newsletter |
| `/artista` | Chi è Dimitri Boutourline (foto reali, gallery) |
| `/musica` | Spotify + social ufficiali + player integrato |
| `/opere` | Curriculum composizioni (classica/moderna/jazz/blues) — file in `/public/opere/` |
| `/shop` | Beat, Sample Pack, Offerte (filtri `?type=`) — checkout via Stripe Link |
| `/eventi` | Redirect permanente (308) → `https://events.dbyoung.it` (vedi `redirects()` in `next.config.mjs`) |
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
Domini: `dbyoung.it` (prod) + `events.dbyoung.it` (sito eventi separato; `/eventi` e `/eventi/*` redirigono lì in modo permanente).

## Audio, shop & licenze (file reali)

- Catalogo 100% reale in `lib/data.ts`: 2 beat, 4 sample pack, 3 colonne sonore (su licenza)
- Anteprime pubbliche in `public/audio/previews/` (mp3 30–45s, generate con ffmpeg)
- Originali in `private_audio/` (**mai** nel repo né deployati, mai esposti via URL)
- Download solo con licenza: `POST /api/download/[slug]?license=DBY-XXXX-XXXX`
  - verifica su Convex (`licenses`), throttle anti-abuso, ZIP al volo per i pack, header no-store
- Clienti: pagina `/libreria` (verifica codice → download) · Admin: tab Licenze (emetti/revoca)
- Prezzi di lancio da confermare: beat €39/€49 · pack €29–€39 · colonne sonore su misura
- Con Stripe: Payment Link per prodotto + webhook che emette licenze in automatico (stesso flusso, zero cambi UI)

## Convex — stato

- ✅ Frontend collegato a `https://festive-ptarmigan-321.convex.cloud` (`.env.local`, `lib/backend.ts`)
- ✅ Funzioni pronte in `convex/` (prodotti, stats, booking, messaggi, newsletter, chat, cron)
- ✅ Il sito scrive/legge in dual-write: subito in locale, nel cloud appena le funzioni sono deployate
- ⏳ **Unico passo manuale**: deploy funzioni (richiede login, una tantum):
  ```bash
  npx convex dev
  ```
  → login → seleziona il progetto `festive-ptarmigan-321` → lascia girare (sincronizza schema+funzioni).
  Su Vercel aggiungi la env `NEXT_PUBLIC_CONVEX_URL=https://festive-ptarmigan-321.convex.cloud`.

- ✅ Bilingue IT/EN con toggle · ✅ Foto reali · ✅ Logo + favicon · ✅ Artwork prodotti
- ✅ Cookie banner GDPR + blocco iframe terzi fino al consenso
- ✅ Form (newsletter/booking/contatti) via AJAX con conferme + copia in inbox admin
- ✅ Admin funzionante in local-first: statistiche visite/click reali, inbox messaggi, pubblicazione prodotti visibile subito nello shop
- ✅ Tracking visite/click privacy-friendly (solo conteggi, nessun cookie)

## Configurazione go-live (input richiesti)

1. ✅ Social ufficiali (Spotify + embed, Instagram, Facebook, YouTube, TikTok in `lib/utils.ts`)
2. ✅ Foto reali di Dimitri · ✅ Embed Spotify in `/musica` · ✅ Banner cookie consenso
3. **Calendly reale** (`NEXT_PUBLIC_CALENDLY_URL` / `lib/utils.ts`)
4. **Stripe Payment Link** per ogni prodotto (`lib/data.ts` → poi da `/admin`)
5. **Chiavi**: Convex URL, Resend API key + dominio verificato, email attive (info@, booking@, privacy@)
6. **Auth reale admin** (Convex Auth, insieme al backend)

Sito eventi: `events.dbyoung.it` è un progetto separato; il sito principale redirige `/eventi` → sottodominio e lo linka direttamente in nav, footer, hero e CTA.
