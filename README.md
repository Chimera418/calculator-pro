# Calculator Pro

> A fully functional calculator where **every operation is a paid
> microtransaction**. Addition and subtraction are free. Multiplication costs
> ₹49. The equals button costs ₹2,999. It is entirely serious about this.

A production-quality, satirical full-stack web app built with Next.js, React,
TypeScript, Tailwind CSS v4, Prisma/PostgreSQL, Auth.js, and Razorpay.

---

## 1. Overview

The premise: it's a real calculator with a real expression engine (tokenizer +
shunting-yard parser, no `eval`). But almost every button is gated behind a
one-time in-app purchase. The UI is deliberately polished and deadpan — the
absurdity lands on its own.

Free tier: **addition, subtraction, 3 calculations/day, and ads.** Everything
else — multiplication, division, parentheses, square root, scientific
functions, memory, history, themes, and even the `=` button — must be bought.

## 2. Demo flow

1. Open the calculator — addition/subtraction work; everything else is locked.
2. Click a locked button → a lock tooltip → a purchase modal.
3. Complete a Razorpay **test-mode** payment → confetti → the button unlocks.
4. Sign in with Google/GitHub so unlocks persist across sessions.

## 3. Tech stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js (App Router), React 19, TypeScript (strict)|
| Styling    | Tailwind CSS v4, CSS custom-property theming       |
| UI         | Radix primitives, Framer Motion, lucide-react      |
| Data       | PostgreSQL (Neon) via Prisma ORM                   |
| Auth       | Auth.js (NextAuth v5) — Google + GitHub            |
| Payments   | Razorpay (orders + signature verify + webhooks)    |
| Validation | Zod                                                |
| Testing    | Vitest + Testing Library                           |

## 4. Quick start

```bash
# 1. Install
npm install

# 2. Configure env (a .env with placeholders is already committed)
#    Fill in DATABASE_URL, OAuth creds, and Razorpay keys.
#    See docs/NEON_SETUP_GUIDE.md and docs/RAZORPAY_INTEGRATION_GUIDE.md

# 3. Set up the database
npx prisma migrate dev --name init   # or: npx prisma migrate deploy
npm run prisma:seed

# 4. Run
npm run dev        # http://localhost:3000
```

## 5. Environment variables

See [`.env`](.env) for the fully-commented reference. Summary:

| Variable                       | Purpose                                   |
| ------------------------------ | ----------------------------------------- |
| `DATABASE_URL`                 | Postgres connection string                |
| `AUTH_SECRET`                  | Auth.js session encryption secret         |
| `AUTH_GOOGLE_ID` / `_SECRET`   | Google OAuth app credentials              |
| `AUTH_GITHUB_ID` / `_SECRET`   | GitHub OAuth app credentials              |
| `RAZORPAY_KEY_ID` / `_SECRET`  | Razorpay API keys (server)                |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`  | Public Razorpay key for the checkout      |
| `RAZORPAY_WEBHOOK_SECRET`      | Verifies incoming webhook payloads        |

## 6. Database setup

Full walkthrough in **[docs/NEON_SETUP_GUIDE.md](docs/NEON_SETUP_GUIDE.md)**
(both local Postgres and Neon). Prisma commands:

```bash
npm run prisma:generate   # regenerate client
npm run prisma:migrate    # dev migration
npm run prisma:deploy     # apply migrations in prod
npm run prisma:seed       # seed features + demo data
npm run prisma:studio     # visual DB browser
```

## 7. Auth.js setup (Google + GitHub)

Create OAuth apps and add credentials to `.env`:

- **Google** — <https://console.cloud.google.com> → Credentials → OAuth client.
  Redirect URI: `http://localhost:3000/api/auth/callback/google`
- **GitHub** — <https://github.com/settings/developers> → New OAuth App.
  Callback URL: `http://localhost:3000/api/auth/callback/github`

Sessions are stored in the database via the Prisma adapter, so purchased
features persist per user.

## 8. Razorpay setup

Full walkthrough in
**[docs/RAZORPAY_INTEGRATION_GUIDE.md](docs/RAZORPAY_INTEGRATION_GUIDE.md)** —
covers test keys, test cards, webhooks via ngrok, and going live. Test card:
`4111 1111 1111 1111`.

## 9. Testing

```bash
npm test            # Vitest unit tests (engine, gating, easter eggs, webhook, CalcButton)
npm run type-check  # tsc --noEmit
npm run lint        # ESLint
npm run build       # Prisma generate + Next.js production build
```

## 10. Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Add all env vars (use a Neon `DATABASE_URL`).
3. Build command `npm run build` runs `prisma generate` automatically.
4. Run `prisma migrate deploy` against the production DB (once).
5. Point a Razorpay production webhook at
   `https://<your-domain>/api/webhooks/razorpay`.

## 11. Folder structure

```
app/                  # App Router: pages, API routes, server actions
  api/                #   auth, payment (create-order/verify), webhooks
  actions/            #   server actions (calculator, features, auth)
  login/ pricing/ profile/
components/
  calculator/         # Calculator, Display, ButtonGrid, CalcButton, History
  payment/            # PurchaseModal, RazorpayCheckout, SuccessAnimation
  pricing/ profile/ providers/ ui/
features/
  calculator/         # engine.ts (parser), gating.ts, easter-eggs.ts (pure)
  payment/            # razorpay.ts, webhook.ts (signature verification)
  auth/               # Auth.js config
hooks/                # useCalculator, useFeatureGate, usePurchaseModal, ...
lib/                  # prisma, constants (feature map), utils
prisma/               # schema.prisma, seed.ts
styles/               # themes.css (per-theme design tokens)
types/                # calculator, payment, features, next-auth
docs/                 # Razorpay + Neon integration guides
```

## 12. Architecture notes

- **Pure engine, gated at the edges.** `features/calculator/engine.ts` is a
  dependency-free tokenizer/parser/evaluator. It receives the set of unlocked
  features and throws `FeatureLockedError` the moment a locked operator is used.
- **Single source of truth.** `lib/constants.ts` defines every feature (slug,
  plan, price in paise). It drives the pricing page, the seed script, and the
  runtime gate.
- **Payments are verified server-side.** Signatures are checked with
  constant-time HMAC comparison; unlocks are written in a transaction; the
  webhook handler is idempotent.
- **Theming** is pure CSS custom properties (`styles/themes.css`) toggled via a
  `data-theme` attribute, with premium themes gated behind a purchase.

## 13. Future improvements

- Email magic-link auth, per-feature analytics, gift/redeem codes, a "regret"
  refund flow, and a leaderboard of the most money spent on arithmetic.

---

*This is a satire of predatory monetization. Payments run in Razorpay test mode
— no real money changes hands.*