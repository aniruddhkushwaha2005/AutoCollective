# AutoCollective

### Buy Together. Save Together.

AutoCollective is a full-featured group car-buying web application built for the Indian passenger vehicle market. Multiple buyers looking for the exact same car model, compatible variant, fuel type, transmission, city, and purchase timeline are automatically matched into a collective buying group (default target: **5 buyers**). Once a group reaches its target or moves into negotiation, platform administrators engage authorized dealerships to publish itemized quotations that buyers can compare side-by-side before confirming their purchase intention.

> **Platform Disclaimer:** AutoCollective connects verified buyers and authorized dealerships. It does **not** directly sell vehicles or guarantee discounts. All seeded offers and savings estimates are clearly labelled as demonstration/sample quotations.

---

## Key Features

### Buyer & Public Experience

- **35 Complete Pages:** 13 Public pages, 11 Role-Protected Buyer Workspace pages (`/dashboard/*`), and 11 Role-Protected Admin Workspace pages (`/admin/*`).

- **Automatic Group Matching Engine** (`src/services/matchingEngine.ts`):
  - Strictly matches requests across **7 criteria**: Brand, Model, Variant, City, Fuel Type, Transmission, and Purchase Timeline.
  - Prevents duplicate active requests per user and prevents duplicate group memberships.
  - Automatically creates a new city-coded group (e.g., `AC-BLY-220`) when no open compatible cohort exists.
  - Manages capacity, expiry dates, and status transitions (`Collecting Buyers` → `Ready for Negotiation` → `Negotiating` → `Offer Received` → `Deal Completed` / `Expired`).

- **Potential Savings Calculator** (`src/components/SavingsCalculator.tsx`):
  - Interactive homepage tool grounded in historical published sample quotations, allowing visitors to estimate potential collective savings by car model, variant, target group size (`3`, `5`, `8`, `10` buyers), and buying timeline.

- **Side-by-Side Offer Comparison Matrix:**
  - Itemized comparison across Ex-Showroom Price, RTO Charges, Insurance, Accessories, Additional Charges, Group Discount, and computed Final On-Road Price.

- **5-Stage Purchase Tracking & Celebration UX:**
  - Tracks progress from `Intention Confirmed` → `Dealer Assigned` → `Booking Paid` → `Vehicle Allocated` → `Delivered`.
  - Triggers an accessible `canvas-confetti` celebration (`prefers-reduced-motion` compliant) when confirming purchase intention or reaching vehicle delivery.

- **Built-in Member Privacy:**
  - Shared group member rosters mask names (`maskMemberName`) and phone numbers (`maskPhone`) to protect buyer privacy.

### Admin Operations Console

- **KPI Dashboard & Activity Audit Log:** Live totals for users, requests, active groups, negotiation-ready cohorts, published offers, and completed purchases.

- **Full Catalog Management:** Add, edit, and delete car brands, models, and detailed trim variants.

- **Group & Request Management:** Advance negotiation statuses, adjust group capacity/expiry, manage members, and review buyer requests.

- **Dealer & Quotation Management:** Register authorized dealerships, assign supported brands/models, and publish itemized sample quotations with automatic on-road price calculation.

- **Purchase Milestone Management & CSV Reports:** Update delivery stages with dealer reference codes and export cohort reports to CSV (`downloadCSV`).

---

## Tech Stack

| Category | Technology | Version | Role |
|---|---|---|---|
| **UI Framework** | React (`react`, `react-dom`) | `^19.0.1` | Component UI & hooks |
| **Language** | TypeScript | `^7.0.2` | Strict domain & component typing |
| **Build Tool** | Vite (`vite`, `@vitejs/plugin-react`) | `^8.3.0` / `^6.1.1` | Fast bundler & dev server (port `3000`) |
| **Routing** | React Router DOM | `^7.18.5` | Nested layouts, dynamic routes & `RoleGuard` |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) | `^4.3.3` | Utility styling & `@theme` tokens |
| **Icons** | Lucide React | `^0.546.0` | Vector UI icons |
| **Celebration UX** | Canvas Confetti | `^1.9.4` | Deal confirmation & delivery confetti |
| **Typography** | Google Fonts | CDN | `Manrope`, `Plus Jakarta Sans`, `JetBrains Mono` |
| **Persistence** | Browser `localStorage` | Built-in | Client-side stateful persistence across reloads |

### Design Tokens (`src/index.css`)

| Design Element | Value |
|---|---|
| Canvas Background | `#F8F8F6` |
| Primary Text | `#17191D` |
| Brand Accent | `#176B50` |
| Tabular Figures | `.tabular-nums` (`font-variant-numeric: tabular-nums`) on all prices, discounts, and metrics |

---

## Project Structure

```text
/
├── index.html                     # HTML entry, SEO/OpenGraph tags, Google Fonts
├── metadata.json                  # App manifest metadata
├── package.json                   # Scripts & dependencies
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite + React + Tailwind v4 config (allowedHosts enabled)
├── PROJECT_DOCUMENTATION.md       # Deep technical docs & 16 Viva/Interview Q&As
└── src/
    ├── main.tsx                   # React root mount
    ├── index.css                  # Tailwind v4 setup & design tokens
    ├── App.tsx                    # Router, RoleGuard & all 35 page routes
    ├── types/index.ts             # TypeScript interfaces & status unions
    ├── data/seedData.ts           # Seeded Indian cars, groups, dealers & sample offers
    ├── services/matchingEngine.ts # Matching, lifecycle transitions & pricing math
    ├── store/AppContext.tsx       # Centralized state provider & localStorage sync
    ├── utils/
    │   ├── carImages.ts           # Static imports for exact matched vehicle photos
    │   ├── celebration.ts         # canvas-confetti trigger with reduced-motion check
    │   └── formatters.ts          # INR currency, date, privacy masking & CSV helpers
    ├── components/                # Layouts, GroupCard, SavingsCalculator, StatusBadge, etc.
    └── pages/
        ├── public/                # 13 Public pages
        ├── user/                  # 11 Buyer workspace pages
        └── admin/                 # 11 Admin workspace pages
```

---

## Route Inventory (35 Pages)

| Area | Count | Routes |
|---|:---:|---|
| **Public** | 13 | `/`, `/cars`, `/groups`, `/groups/:groupId`, `/how-it-works`, `/about`, `/faq`, `/contact`, `/login`, `/register`, `/forgot-password`, `/terms`, `/privacy` |
| **User Workspace** | 11 | `/dashboard`, `/dashboard/profile`, `/dashboard/requests`, `/dashboard/requests/new` (+ `/edit`), `/dashboard/groups`, `/dashboard/groups/:groupId`, `/dashboard/offers`, `/dashboard/compare`, `/dashboard/notifications`, `/dashboard/purchases`, `/dashboard/settings` |
| **Admin Workspace** | 11 | `/admin`, `/admin/users`, `/admin/brands`, `/admin/models`, `/admin/requests`, `/admin/groups`, `/admin/dealers`, `/admin/offers`, `/admin/purchases`, `/admin/reports`, `/admin/settings` |

---

## Getting Started

### Prerequisites

- Node.js `v20+` (or `v22+`)
- npm (or bun)

### Installation & Local Development

**1. Install dependencies:**

```bash
npm install
```

**2. Start the development server (runs on port `3000`):**

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

**3. Type-check the codebase:**

```bash
npm run lint
```

**4. Build for production:**

```bash
npm run build
```

**5. Preview the production build locally:**

```bash
npm run preview
```

---

## Demo Credentials & Seeded Data

You can sign in directly on `/login` using the one-click demo buttons or the credentials below:

| Role | Email | Password |
|---|---|---|
| **Buyer Account** | `arjun.verma@example.com` | `Buyer@123` |
| **Admin Account** | `admin@autocollective.in` | `Admin@123` |

### Seeded Automotive Catalog

- **Hyundai Creta**
- **Tata Nexon**
- **Kia Seltos**
- **Mahindra Scorpio-N**
- **Maruti Suzuki Brezza**

Includes **5 regional groups** (such as Bareilly Hyundai Creta `AC-BLY-204` at `4/5` buyers), **7 regional dealerships**, and **4 published sample quotations**.

---

## Client-Side Persistence & Reset

All data persists automatically in browser `localStorage`:

| Storage Key | Description |
|---|---|
| `autocollective_db_v1` | Master application database (users, catalog, requests, groups, dealers, offers, purchases, notifications, contacts, activity logs, settings) |
| `autocollective_session_v1` | Active logged-in user session ID |
| `autocollective_celebrated_deliveries_v1` | Tracks delivered purchase IDs that have already played the confetti celebration |

You can reset all demo data back to the initial seed state anytime from Account Settings (`/dashboard/settings`).