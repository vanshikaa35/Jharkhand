# Sajha Samadhan — Frontend (SIH26043)

A React + Vite + Tailwind frontend for the Jharkhand societal-challenge
crowdsourcing portal. Pastel base palette with a marigold "pop" accent used
only for actions, AI moments, and status.

## 1. Run it locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

## 2. Folder structure

```
src/
  components/     Navbar, Footer, Button, Tag — reused across all pages
  pages/          One file per screen (see below)
  data/           Mock college dataset + category list — replace with real data later
  services/       aiRouter.js — the ONE file to swap for a real backend call
  index.css       Fonts, base styles — color tokens live in tailwind.config.js
tailwind.config.js  Color palette, fonts, border-radius tokens — change the
                    look of the whole app from this one file
```

## 3. Pages built (4 screens = your 1–2 day frontend scope)

| Route | File | What it does |
|---|---|---|
| `/` | `pages/Landing.jsx` | Hero + "how it works" module cards + CTA |
| `/submit` | `pages/Submit.jsx` | Citizen submission form (text, location, photo) |
| `/routing-result` | `pages/RoutingResult.jsx` | **The demo centerpiece.** Shows AI category, confidence, duplicate detection, and which college it routed to |
| `/dashboard` | `pages/Dashboard.jsx` | Stat cards + district bar chart (mock data) |

The submission flow is already wired end to end:
`Submit.jsx` → calls `categorizeComplaint()` in `services/aiRouter.js` →
navigates to `/routing-result` with the AI output.

## 4. How the "AI" works right now (and how to make it real)

`src/services/aiRouter.js` currently uses simple keyword matching so the
whole flow works standalone with zero backend. **This is the only file your
ML/backend person needs to touch.** Keep the function name and return
shape the same:

```js
categorizeComplaint(text) => {
  category: string,
  confidence: number,      // 0–1
  matches: College[],      // top 3 matching colleges
  duplicates: Complaint[], // similar existing reports
  needsReview: boolean,    // true if confidence < 0.6
}
```

Swap the inside of that function for a `fetch()` call to your Node/Express
backend (which itself calls the Claude/OpenAI API with a categorization +
routing prompt). Nothing in the UI needs to change.

## 5. What's mock data right now

- `src/data/colleges.js` — fake Jharkhand HEI expertise dataset (whoever's
  less technical on the team can flesh this out with real departments)
- `RoutingResult.jsx`'s `duplicates` — simulated "recent complaints" list
  inside `aiRouter.js`, replace with a real DB query later
- `Dashboard.jsx` — hardcoded stats, replace with real API data once the
  backend has aggregation endpoints

## 6. Two-day build plan for your team

**Day 1 (today):**
1. `npm install && npm run dev` — get everyone running it locally
2. Split by file, not by "frontend vs backend" — one person owns
   `Submit.jsx` + form validation, one owns `RoutingResult.jsx` styling
   polish, one starts on the backend that will replace `aiRouter.js`
3. Fill in real Jharkhand college data in `data/colleges.js`

**Day 2:**
1. Wire `aiRouter.js` to the real backend once it exists
2. Add a loading/empty state on `/dashboard` if real data isn't ready in
   time — mock data is fine to demo with, just say so honestly if asked
3. Deploy: `npm run build`, push to GitHub, connect the repo on Vercel
   (auto-detects Vite) — takes about 2 minutes

## 7. Design tokens (change the whole look from here)

All colors, fonts, and the "blob" border-radius live in `tailwind.config.js`.
Current palette:

- `sage` (#EAF3EA) — page background
- `cream` (#FBF8F2) — card background
- `ink` (#1E3A32) — text
- `marigold` (#F2994A) — the ONE pop color, used only for primary buttons,
  the AI sparkle icon, and highlighted states — keep it rare so it stays
  effective
- `sky` (#D7E6ED) / `blush` (#F4DCE4) — secondary tag colors for
  categories/locations

Fonts: Fraunces (headlines, `font-display`) + Manrope (body, `font-body`),
loaded via Google Fonts in `index.css`.
