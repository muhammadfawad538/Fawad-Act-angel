# ACT Angel AI – Website

Marketing and lead-capture website for **ACT Angel AI**, including the **Hope Angel**
persona for nonprofits. Built with Next.js (App Router), React 19, TypeScript and Tailwind CSS 4.

## What it does

- **Hire-an-Angel pages** (`/hire-an-angel/*`): landing pages for each Angel persona
  (Sales, Service, Recruitment, Executive Assistant, Hope). Copy and demo content live in
  `lib/personas.ts`; the phone demo is scripted, not live AI.
- **Get Started** (`/get-started?source=<tag>`): visitors pick Call, WhatsApp or Email,
  verify their phone and email with one-time codes (Twilio Verify), and are handed off to the
  Angel.
- **Share Your Mission** (`/share-your-mission`): nonprofits submit an intake form that is
  forwarded to the ACT Angel AI backend for human review.
- Light, dark and purple themes, cookie consent, PostHog and Clarity analytics.

## Hope Angel flow

1. `/hire-an-angel/hope-angel` shows the Hope Angel demo; its button links to
   `/get-started?source=hope-angel`.
2. The form calls `POST /api/otp/send`, which validates the number against an allowed-country
   list and sends an SMS code and an email code via Twilio Verify (rate limited).
3. The form calls `POST /api/otp/verify`, which checks both codes and then:
   - **Call / WhatsApp**: posts the lead to the n8n intake webhook (stores the lead, picks the
     outbound number, triggers the Retell call).
   - **Email**: posts to the backend's `/api/email-enquiry` and also stores the lead via n8n.
4. Nonprofits using `/share-your-mission` post to `POST /api/hope-angel/intake`, which forwards
   to the backend's `/api/registration-requests` with `formType: "hope_angel_mission"`.

## Project structure

| Path | Purpose |
| --- | --- |
| `app/` | Pages and API routes (`app/api/otp/*`, `app/api/hope-angel/intake`) |
| `components/` | UI components, forms, phone demo, `components/ui/` primitives |
| `lib/` | Persona config, phone/URL/text validation helpers (with tests) |
| `proxy.ts` | Next.js proxy (middleware) |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

Static pages render without any configuration. The OTP and form submissions need the
environment variables below.

## Environment variables

Create `.env.local` (it is gitignored). Do not commit real values.

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_PARTNER_API_KEY` | Light filter on the API routes (visible in the browser, not a secret) |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` | SMS and email verification codes |
| `N8N_INTAKE_WEBHOOK_URL`, `N8N_INTAKE_WEBHOOK_API_KEY` | Lead intake and call dispatch |
| `ACTANGEL_WEB_API_URL` | ACT Angel AI backend (email enquiry, registration requests) |
| `ACTANGEL_EMAIL_ASSISTANT_ID` | Email assistant that owns Email-channel conversations |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | PostHog analytics |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Microsoft Clarity analytics |
| `NEXT_PUBLIC_NPO_APPROVAL_FLOW`, `APP_ENV` | Feature flag and environment name |

`npo-staging-env-vars.example.txt` lists the staging variables for the nonprofit flow.

## Scripts

- `npm run dev`: development server
- `npm run build`: production build
- `npm start`: serve the production build
- `npm run lint`: lint
