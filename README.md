# Portfolio

My personal site, live at **[hungnguyen.dev](https://hungnguyen.dev)**. It's built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, and **Framer Motion**, and has a working contact form that sends email through Resend.

![hungnguyen.dev](docs/screenshot.png)
<!-- TODO: add a full-page screenshot of hungnguyen.dev -->

Site content (experience, projects, expertise) lives in typed modules under [`src/content/`](src/content/), so updating the site doesn't require touching components.

## Tech Stack

* **Framework:** Next.js 15 (App Router with Turbopack)
* **Styling:** Tailwind CSS + custom glassmorphism
* **Motion & Physics:** Framer Motion (layoutId spring pills, stagger reveals) + Lenis (inertia smooth scrolling)
* **Email Service:** [Resend](https://resend.com)
* **Hosting:** Firebase Hosting

---

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Fill in the required keys:
   * `RESEND_API_KEY`: API key from your [Resend Dashboard](https://resend.com/api-keys)
   * `CONTACT_RECEIVER_EMAIL`: Where you want to receive contact form messages (e.g. `your-email@gmail.com`)
   * `CONTACT_SENDER_EMAIL`: Verified sender in Resend (default for testing: `Portfolio Contact <onboarding@resend.dev>`)

3. **Run the local development server:**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the site.

---

## Deployment with Firebase Hosting

1. Ensure `.npmrc` contains:
   ```bash
   legacy-peer-deps=true
   ```

2. Create `.env.<firebase_project_id>` with production environment variables (see `.env.example`).

3. Deploy:
   ```bash
   firebase deploy --only hosting
   # or
   pnpm deploy
   ```
   *The `firebase.json` configuration includes an automated `predeploy` hook that builds the Next.js production bundle (`npm run build`) before assets are uploaded.*
