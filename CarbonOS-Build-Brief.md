# CarbonOS — Claude Code Build Brief

**Deliverable:** A high-fidelity, front-end-only mockup of CarbonOS — a marketing **Homepage** plus a logged-in **Developer Console (Dashboard)**. No backend. All data is mocked. The goal is a visually convincing, interactive prototype that communicates the "Bloomberg Terminal for carbon" positioning.

**Stack:** React 18 + Vite + TypeScript + Tailwind CSS. Three.js for the hero globe. Recharts (or lightweight inline SVG) for charts. Framer Motion for transitions. No state library needed — local React state only.

**Aesthetic in one line:** Black glass + emerald. Obsidian background, frosted translucent surfaces, cyber-emerald accents, institutional-fintech density. Think Carta × Bloomberg × Procore, dark mode.

---

## 0. How to use this brief

Build in this order. Each phase should be runnable before moving on.

1. Scaffold Vite + React + TS + Tailwind, wire the design tokens (Section 2).
2. Build the shared UI primitives (Section 3) — `GlassPanel`, `StatTile`, `Pill`, `SectionHeader`, `Sparkline`.
3. Build the **Homepage** route (Section 4).
4. Build the **Dashboard** route and its 5 widgets + Copilot (Section 5).
5. Add the mock data layer (Section 6) and the simple router/auth toggle (Section 7).
6. Polish pass: animations, ticker, responsive, accessibility (Section 8).

A simple top-right toggle ("Sign In" / "View as Developer") switches between Homepage and Dashboard. No real auth.

---

## 1. Project structure

```
carbonos/
├─ index.html
├─ package.json
├─ tailwind.config.ts
├─ vite.config.ts
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx                 # router: '/' homepage, '/app' dashboard
│  ├─ index.css               # tailwind + base layer + tokens
│  ├─ data/
│  │  └─ mock.ts              # all mock data (Section 6)
│  ├─ lib/
│  │  └─ format.ts            # number/currency/tCO2e formatters
│  ├─ components/
│  │  ├─ ui/                  # primitives (Section 3)
│  │  │  ├─ GlassPanel.tsx
│  │  │  ├─ StatTile.tsx
│  │  │  ├─ Pill.tsx
│  │  │  ├─ SectionHeader.tsx
│  │  │  ├─ Sparkline.tsx
│  │  │  └─ ProgressBar.tsx
│  │  ├─ Globe.tsx            # Three.js hero earth
│  │  ├─ Ticker.tsx
│  │  └─ TopNav.tsx
│  ├─ homepage/
│  │  ├─ Homepage.tsx
│  │  ├─ Hero.tsx
│  │  ├─ NetworkHealth.tsx
│  │  ├─ PipelineStrip.tsx
│  │  └─ Footer.tsx
│  └─ dashboard/
│     ├─ Dashboard.tsx
│     ├─ DashNav.tsx
│     ├─ LifecyclePipeline.tsx      # Widget 1
│     ├─ IntakeDossier.tsx          # Widget 2
│     ├─ CarbonArchitect.tsx        # Widget 3
│     ├─ LiveTelemetry.tsx          # Widget 4
│     ├─ CarbonExchange.tsx         # Widget 5
│     └─ Copilot.tsx                # Copilot terminal
```

---

## 2. Design system (tokens)

Put these in `tailwind.config.ts` `theme.extend` and as CSS variables in `index.css`.

**Colors**
- `obsidian` background base: `#0B0C10`
- `obsidian-2` (raised): `#101319`
- `glass` surface: `rgba(20, 22, 26, 0.75)` with `backdrop-filter: blur(20px)`
- `glass-border`: `rgba(0, 230, 118, 0.18)` (1px emerald hairline)
- `emerald` primary accent: `#00E676`
- `mint` secondary accent: `#69F0AE`
- `emerald-dim`: `#0E2A1E` (subtle fills, chart areas)
- text primary: `#E8EDEC`, text secondary: `#8A958F`, text muted: `#5A635E`
- semantic: positive `#00E676`, warning `#FFC857`, negative `#FF5C77`

**Background treatment:** body is `obsidian` with a subtle radial gradient top-center: `radial-gradient(1200px 600px at 50% -10%, rgba(0,230,118,0.08), transparent)`. Add a faint 1px grid or noise texture at ~3% opacity for depth.

**Typography**
- UI / body: Inter (or system stack). Headlines: Inter tight, weight 600–700, negative letter-spacing.
- Numeric / terminal / data: a monospace (JetBrains Mono or `ui-monospace`) for all metrics, tickers, and the Copilot.
- Hero headline: clamp(40px, 6vw, 84px), tight tracking, white with a faint emerald text-shadow glow.

**Surface recipe (the "black glass" card):**
```
bg-[rgba(20,22,26,0.75)] backdrop-blur-xl
border border-[rgba(0,230,118,0.18)]
rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_20px_60px_-20px_rgba(0,0,0,0.8)]
```
On hover for interactive cards: brighten border to `rgba(0,230,118,0.4)` and add a soft emerald outer glow.

**Accents & detail:** emerald is used sparingly — for primary CTAs, active states, positive deltas, pulsing nodes, and 1px dividers. Most of the screen is black/grey; emerald is the highlight that draws the eye. Avoid large emerald fills.

**Motion:** 150–250ms ease-out for hovers; pulsing glow (2s loop) on live/active indicators; number count-up on mount for headline stats; globe rotates continuously.

---

## 3. Shared UI primitives

- **`GlassPanel`** — the surface recipe above. Props: `glow?: boolean`, `padded?: boolean`, `as`. Used for every card.
- **`StatTile`** — large mono number + label + optional delta pill (▲/▼ colored). Count-up on mount.
- **`Pill`** — small rounded label. Variants: `emerald` (filled), `outline`, `warning`, `danger`, `muted`. Used for statuses like `EXCELLENT`, `ACTION REQUIRED`, `LIVE`.
- **`SectionHeader`** — eyebrow (mono, emerald, uppercase, tracked) + H2 + optional sub.
- **`Sparkline`** — tiny inline SVG line/area, emerald stroke, faint emerald-dim fill. Accepts `number[]`.
- **`ProgressBar`** — thin track + emerald fill, optional gradient to mint, label and % on the right. Used for scores and readiness.

Build these first so every widget reuses them.

---

## 4. Homepage (`/`)

Single scrolling page, dark, generous vertical rhythm. Sections top to bottom:

### 4.1 TopNav (`TopNav.tsx`)
Sticky, transparent over hero, frosts on scroll. Left: `CarbonOS` wordmark (emerald dot or globe glyph + text). Center: `Platform · Solutions · Intelligence · Marketplace`. Right: `Sign In` (ghost) + `Get Started` (emerald). On smaller screens collapse to a menu.

### 4.2 Hero (`Hero.tsx`)
Full-viewport. Layout: headline block centered upper area, **interactive 3D globe** as the dominant visual behind/below it.

- Eyebrow: `THE OPERATING SYSTEM FOR`
- Headline: **GLOBAL CARBON MARKETS**
- Subhead (mono, spaced): `Build.  Finance.  Verify.  Monetize.` then a lighter line `Everything in one platform.`
- CTAs: `[ Submit Project ]` (emerald, glowing) and `[ Explore Credits ]` (glass outline).
- Globe: see `Globe.tsx` spec below.

**`Globe.tsx` (Three.js):**
- Dark sphere (subtle wireframe or dotted-landmass texture; if no texture, use a low-poly icosphere with emerald wireframe at low opacity).
- 30–50 glowing emerald **nodes** placed at lat/long coords from mock projects; each pulses (scale + opacity loop) on its own phase.
- Faint **arc lines** between a few nodes (great-circle curves) representing capital/credit flows, with a traveling dot along the arc.
- Slow auto-rotation; gentle mouse-parallax (no full orbit controls needed, but optional drag-to-rotate is a nice touch).
- Keep it performant: single `requestAnimationFrame`, instanced points if possible, devicePixelRatio capped at 2. Provide a static fallback (CSS radial + dots) if WebGL is unavailable.

### 4.3 Live Ticker (`Ticker.tsx`)
A thin bar pinned at the bottom of the hero. Horizontally auto-scrolling (marquee) credit instruments with prices and deltas, mono font, colored ▲/▼:
`VERRA VCU v4.2  +2.4%  ·  GOLD STANDARD GS1922  −0.8%  ·  ACR FORESTRY  +4.1%  ·  CAR CRT  +1.2%  ·  J-CREDIT  +0.6%` … loop seamlessly.

### 4.4 Network Health ribbon (`NetworkHealth.tsx`)
Directly below the fold — a high-density 4-tile data ribbon in a single glass panel (or 4 adjacent tiles). Each tile = StatTile with a sub-line:
- **Global Managed Pipelines** — `147` Active Projects · sub `▲ 12 new this week`
- **Projected Credits** — `18.4M` tCO₂e · sub `7.2M forward locked`
- **Transacted Ecosystem Value** — `$287M` USD · sub `Avg yield 11.4%`
- **Active Sovereignties** — `42` Jurisdictions · sub `Compliance & Voluntary`

### 4.5 Pipeline strip (`PipelineStrip.tsx`)
A horizontal **issuance pipeline** visualized like a deal pipeline (this is the IPOReady-style centerpiece). Seven stages, left → right, connected by an emerald gradient flow line with a subtle animated pulse traveling along it:
`Concept → Design → Validation → Verification → Registry → Issued → Sold`
Each stage is a small glass node showing a count and est. value (use the Lifecycle data from Section 6 so it matches the dashboard). Section header eyebrow: `THE PIPELINE`. Headline: "From project concept to issued credits."

### 4.6 Feature trio (optional but recommended)
Three glass cards highlighting the AI differentiators: **Carbon Copilot**, **Registry Readiness AI**, **Buyer Match Engine** — each with a one-line value prop and a tiny illustrative mini-widget (a sparkline, a % gauge, a match bar). Keeps the page from being all stats.

### 4.7 Footer (`Footer.tsx`)
Minimal. Wordmark, columns (Platform / Intelligence / Marketplace / Company), small print, emerald hairline top border.

---

## 5. Dashboard — Developer Console (`/app`)

Layout: left or top **DashNav** with workspace tabs, main column with the widgets stacked, and the **Copilot** docked (right rail on wide screens, collapsible drawer otherwise).

### 5.1 DashNav (`DashNav.tsx`)
Top bar: `CarbonOS` mark · global search input (`Search projects, methodologies, buyers…`) · `Copilot Active` pill (pulsing emerald dot) · user avatar.
Second row tabs: `Project Pipeline · Carbon Architect · Registry Navigator · Carbon Exchange`. Active tab = emerald underline. (Tabs can scroll the page to the matching widget, or filter — simplest: anchor-scroll.)

### 5.2 Widget 1 — Lifecycle Pipeline (`LifecyclePipeline.tsx`)
Full-width glass panel. Horizontal progression of 6 phases as connected columns. Each column: phase name, **project count** (large mono), and **est. value**. A cumulative flow line connects them. Hovering a phase reveals a tooltip with the projects in that phase.
Data:
`Concept 24 / $34M · Design 18 / $41M · Validation 42 / $92M · Verification 31 / $68M · Registry 22 / $44M · Issued/Sold 10 / $8.2M realized`

### 5.3 Widget 2 — Intake Dossier (`IntakeDossier.tsx`)
The opportunity-analytics card for a single project. Two-column glass panel.
- Header: `PROJECT INTAKE DOSSIER · #CA-7702` — Boreal Afforestation, Alberta, Canada. Sub-fields: Jurisdiction (Canada Federal OBPS + Alberta TIER), Methodology (Verra VM0047 / VM0012 adj.), Land size (42,500 ha).
- **Opportunity Score: 92 / 100** with an `EXCELLENT` emerald pill and a `ProgressBar` at 92%.
- **Criteria breakdown** rows with status dots: 🟩 Carbon Additionality — High · 🟩 Permanence Risk — Low (Class A buffer) · 🟨 Registry Velocity — 14.2 months (Alberta backlog flag).
- **Projected metrics** grid: Expected Gross Credits `250,000 tCO₂e/yr` · Success Probability `87.4%` · Projected Floor Value `$3.7M/yr` · AI Yield Optimization `+12.5%`.

### 5.4 Widget 3 — Carbon Architect / Registry Navigator (`CarbonArchitect.tsx`)
Glass panel titled `ARCHITECT MODE · REGISTRY NAVIGATOR & COMPLIANCE ENGINE`.
- Top row: `Selected Framework: Verra VM0047` (dropdown, static) · `Validation Readiness: 94%` (ProgressBar).
- **Documentation Requirements Matrix** — checklist rows with check/warning glyphs:
  - ✓ Boundary GeoJSON Shp Files — Mapped & Validated
  - ✓ Baseline Leakage Calculation — Complete (AI Estimated)
  - ! Additionality Proof (Financial) — **ACTION REQUIRED** (danger pill)
  - ✓ Local Stakeholder Consultation — Signed via CarbonOS Sign
- Footer buttons: `[ Run AI Pre-Validation Simulation ]` (emerald) · `[ Generate Digital Twin PDD ]` (outline). Buttons can show a fake 2s "processing" state then a toast.

### 5.5 Widget 4 — Live Carbon Dashboard / Telemetry (`LiveTelemetry.tsx`)
The Bloomberg-style monitoring card. Header `ASSET TELEMETRY · REAL-TIME MONITORING & VERIFICATION` with three live pills: `SAT-FEED: ACTIVE` · `SENSOR STREAM: LIVE` · `ANOMALY ALERTS: 0` (pulsing).
Three charts side by side (Recharts area/line, emerald):
- **Biomass Density (NDVI)** — trend Nominal
- **Soil Moisture Telemetry** — Irrigation Stable
- **Inferred Carbon (t)** — `+2,100t Net M/M`
X-axis months M A M J J A. Add a subtle "live" jitter: append a new point every few seconds so it feels real.

### 5.6 Widget 5 — Carbon Exchange / Match Engine (`CarbonExchange.tsx`)
Glass panel `CARBONOS EXCHANGE · OFF-TAKER MATCHING ENGINE`. Top: `PROJECT #CA-7702 (250k VCU Forward) ⇄ MATCH PROFILE: 98% MATCH`.
List of **Top Buyers (AI Match Engine)** — each a row/card with match %, mandate, demand, target price, and an action button:
1. **Global Aviation Group** — Canadian offsets preferred · 100,000 tCO₂e/yr · $16.50 · `[ Issue Term Sheet ]`
2. **Euro-Energy Corp** — Nature-based forestry only · 500,000 tCO₂e/yr · $18.00 · `[ Open Data Room ]`
3. **Sovereign Wealth Fund** — Long-term forward 2026–2036 · 1.5M tCO₂e total · Index · `[ Initiate Chat ]`
Each row shows a small match-strength bar.

### 5.7 Copilot terminal (`Copilot.tsx`)
Docked panel, terminal aesthetic (mono, near-black inner surface, emerald prompt caret). Header `🤖 CARBON COPILOT` with active dot.
- Pre-seed it with the example exchange from the brief (the Alberta methodology / verification-risk Q&A) so it looks alive on load.
- Input box at the bottom; on submit, echo the user line, show a typing indicator, then stream a **canned** response selected from a small map of keyword→answer in `mock.ts` (e.g., matches on "alberta", "methodology", "japan", "issuance probability"). Default fallback answer for anything else.
- Answer rendering supports simple numbered points and bold. Below the answer show contextual action chips like `[ Apply TIER Financial Model ]` `[ Generate Risk Mitigation Document ]`.
- This is **mock intelligence** — no API calls. Make that easy to swap later by isolating the "respond()" function.

---

## 6. Mock data (`src/data/mock.ts`)

Centralize everything so the homepage and dashboard stay consistent. Export typed objects:

```ts
export const networkHealth = {
  pipelines: 147, pipelinesNew: 12,
  projectedCredits: 18.4e6, forwardLocked: 7.2e6,
  ecosystemValue: 287e6, avgYield: 0.114,
  sovereignties: 42,
};

export const lifecycle = [
  { phase: 'Concept',      count: 24, value: 34e6, realized: false },
  { phase: 'Design',       count: 18, value: 41e6, realized: false },
  { phase: 'Validation',   count: 42, value: 92e6, realized: false },
  { phase: 'Verification', count: 31, value: 68e6, realized: false },
  { phase: 'Registry',     count: 22, value: 44e6, realized: false },
  { phase: 'Issued/Sold',  count: 10, value: 8.2e6, realized: true },
];

export const ticker = [
  { sym: 'VERRA VCU v4.2', chg: +2.4 },
  { sym: 'GOLD STANDARD GS1922', chg: -0.8 },
  { sym: 'ACR FORESTRY', chg: +4.1 },
  { sym: 'CAR CRT', chg: +1.2 },
  { sym: 'J-CREDIT', chg: +0.6 },
];

export const dossier = { /* #CA-7702 fields from 5.3 */ };
export const docMatrix = [ /* 4 rows from 5.4 */ ];
export const buyers = [ /* 3 buyers from 5.6 */ ];

// Globe nodes: ~40 projects with lat/lng + a flow set
export const globeNodes = [ { lat, lng, label, status } /* ... */ ];
export const globeFlows = [ { from: [lat,lng], to: [lat,lng] } /* ... */ ];

// Telemetry series (months M–A) + a generator for live jitter
export const telemetry = { ndvi: number[], soil: number[], carbon: number[] };

// Copilot canned answers keyed by intent
export const copilotAnswers: Record<string, { body: string; chips: string[] }> = { ... };
```

Use the exact numbers from this brief — they are the demo's "truth." Format with helpers in `lib/format.ts` (e.g., `$287M`, `18.4M tCO₂e`, `+2.4%`).

---

## 7. Routing & auth toggle (`App.tsx`)

- Use `react-router-dom`. `/` → `Homepage`, `/app` → `Dashboard`.
- "Get Started" / "Sign In" / "View as Developer" navigate to `/app`. A small control in DashNav returns to `/`.
- No real authentication. Keep it trivially swappable.

---

## 8. Polish & quality bar

- **Animations:** number count-up on stat mount; ticker marquee; globe rotation + node pulse + arc travel; pulsing "LIVE" dots; 200ms hover lifts on cards; staggered fade-in on section enter (Framer Motion `whileInView`).
- **Responsive:** widgets stack to single column under ~1024px; globe scales and reduces node count on mobile; Copilot becomes a bottom drawer.
- **Accessibility:** maintain WCAG-AA contrast against the dark bg (emerald `#00E676` on obsidian passes for large/graphic text; use `#E8EDEC` for body copy, not pure emerald). All interactive elements keyboard-focusable with a visible emerald focus ring. Respect `prefers-reduced-motion` — pause marquee, globe spin, and jitter.
- **Performance:** lazy-load `Globe.tsx`; cap DPR; memoize charts; no layout thrash from the live jitter (update via state at a fixed interval, not per-frame).
- **Empty of real secrets/APIs:** everything is mock and client-side. No env keys.

### Acceptance checklist
- [ ] `npm run dev` serves a dark, glassy homepage with a rotating globe, live ticker, network-health ribbon, and 7-stage pipeline strip.
- [ ] Clicking Get Started lands on `/app`.
- [ ] Dashboard shows all 5 widgets + a working Copilot that answers the seeded questions and at least 3 keyword intents.
- [ ] Telemetry charts visibly update over time.
- [ ] Numbers across homepage and dashboard agree (sourced from `mock.ts`).
- [ ] Responsive down to mobile; reduced-motion respected; AA contrast for text.

---

## 9. Stretch (only if time remains)
- Drag-to-rotate globe with inertia.
- A second dashboard persona (Buyer view) reusing the Exchange + a portfolio table.
- A "Capital Stack Builder" mini-widget (stacked bar of Grants / Incentives / Pre-purchase / Debt / Equity).
- Country workflow visual (Canada / Japan vertical step rails).

---

**One-paragraph prompt you can paste to Claude Code to kick off:**

> Build a front-end-only React + Vite + TypeScript + Tailwind prototype called CarbonOS following the attached `CarbonOS-Build-Brief.md`. Implement the design tokens in Section 2, the shared primitives in Section 3, then the Homepage (Section 4) with a Three.js hero globe, live ticker, network-health ribbon, and 7-stage pipeline strip, and the Developer Console dashboard (Section 5) with all five widgets and a mock Carbon Copilot. Centralize all numbers in `src/data/mock.ts` exactly as specified. Aesthetic: obsidian black-glass surfaces with emerald (#00E676) accents, institutional-fintech density, mono fonts for all data. Meet the acceptance checklist in Section 8. No backend, no API keys — all data mocked and client-side.
