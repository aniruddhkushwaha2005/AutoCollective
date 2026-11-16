# AutoCollective — Complete Project & Technical Documentation

**Tagline:** *Buy Together. Save Together.*  
**Platform Type:** Collective Automotive Demand Aggregation & Dealership Quotation Platform (Single-Page Web Application)

---

## 1. Executive Project Overview

**AutoCollective** is a group car-buying web platform designed for the Indian passenger vehicle market. Multiple prospective buyers who want the same car model, compatible variant, fuel type, transmission, city, and purchase timeline are automatically matched into a collective buying group (default target: **5 buyers**). Once a group reaches its target or is ready for dealership outreach, platform administrators collect and publish itemized sample dealership quotations so members can compare on-road costs side-by-side and confirm their purchase intention.

### Important Business & Compliance Boundaries
- **Facilitator Model:** AutoCollective connects verified buyers with authorized dealerships. It **does not directly sell cars** and **does not guarantee discounts**.
- **Sample Quotations:** Seeded and demo offers are clearly flagged (`isSampleQuotation: true`) and labelled as demonstration/sample quotations.
- **Privacy First:** Member identities and contact numbers inside shared group rosters are masked (`maskMemberName`, `maskPhone`) so fellow buyers only see anonymized initials, city, preferred colour, and join date.

### Demo Accounts (Seeded)
| Role | Email | Password | Workspace Access |
| :--- | :--- | :--- | :--- |
| **Buyer (Standard User)** | `arjun.verma@example.com` | `Buyer@123` | `/dashboard` (11 user pages) |
| **Platform Administrator** | `admin@autocollective.in` | `Admin@123` | `/admin` (11 admin pages) |

---

## 2. Complete Tech Stack

### 2.1 Actively Used Core Stack (Verified from `package.json` & Source)
| Layer | Technology | Installed Version | Purpose in AutoCollective |
| :--- | :--- | :--- | :--- |
| **UI Library** | React (`react`, `react-dom`) | `^19.0.1` | Component-driven UI, hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useContext`) |
| **Language** | TypeScript (`typescript`) | `^7.0.2` | Strict static typing across data models, context actions, matching rules, and UI props |
| **Build Tool & Dev Server** | Vite (`vite`, `@vitejs/plugin-react`) | `^8.3.0` / `^6.1.1` | Fast ES-module bundling, dev server on port `3000`, static asset bundling |
| **Routing** | React Router DOM (`react-router-dom`) | `^7.18.5` | Nested layouts, dynamic URL params (`/groups/:groupId`, `/requests/:requestId/edit`), query params, and `RoleGuard` route protection across 35 pages |
| **Styling** | Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`) | `^4.3.3` | Utility-first styling with CSS-first `@theme` configuration (`@import "tailwindcss";`) |
| **Icons** | Lucide React (`lucide-react`) | `^0.546.0` | Crisp, consistent vector UI iconography |
| **Celebration UX** | Canvas Confetti (`canvas-confetti`, `@types/canvas-confetti`) | `^1.9.4` / `^1.9.0` | Dual-burst celebration animation on purchase confirmation & vehicle delivery (with `prefers-reduced-motion` guard) |
| **Typography** | Google Fonts (`Manrope`, `Plus Jakarta Sans`, `JetBrains Mono`) | Hosted CDN | Editorial headings (`Manrope`), readable body copy (`Plus Jakarta Sans`), group codes & tabular currency figures (`JetBrains Mono`) |
| **State & Persistence** | React Context API + Browser `localStorage` | Built-in | Centralized CRUD store (`AppContext`) persisted across reloads without requiring an external database server |

### 2.2 Template Packages Present in `package.json` (Not Actively Invoked at Runtime)
The starter workspace `package.json` also includes `@google/genai` (`^2.4.0`), `express` (`^4.21.2`), `motion` (`^12.23.24`), `dotenv` (`^17.2.3`), `tsx` (`^4.21.0`), and `autoprefixer` (`^10.4.21`). AutoCollective's active runtime does **not** invoke Express routes, Motion animations, or Gemini API calls—it operates as a self-contained, deterministic client-side React + Vite SPA with local state persistence.

---

## 3. Design System & Visual Architecture

| Token / Rule | Implementation |
| :--- | :--- |
| **Primary Canvas Background** | `#F8F8F6` (Warm off-white neutral) |
| **Primary Ink / Text** | `#17191D` (Deep charcoal) |
| **Brand Accent** | `#176B50` (Deep automotive emerald; hover `#125640`) |
| **Card Surfaces & Borders** | `#FFFFFF` cards with subtle `#E4E4E0` / `#ECECE8` 1px borders (`rounded-xl`) |
| **Numeric Alignment** | `.tabular-nums` (`font-variant-numeric: tabular-nums`) on all prices, discounts, counts, and calculator outputs |
| **Badge Discipline** | Structured `StatusBadge` components (`rounded-md` with status icon + label; avoids decorative pill bloat) |
| **Accessibility** | Semantic landmarks, explicit `<label htmlFor>` associations, `aria-labelledby`, and `prefers-reduced-motion` CSS + JS checks |
| **Vehicle Imagery** | Custom exact-matched automotive photographs in `src/assets/images/` (`exact_*` files) mapped statically via `src/utils/carImages.ts` |

---

## 4. Application Architecture & Directory Structure

```text
/
├── index.html                        # HTML shell, SEO/OG meta tags, Google Fonts
├── metadata.json                     # App manifest metadata
├── package.json                      # Dependencies & npm scripts (dev, build, preview, lint)
├── tsconfig.json                     # TypeScript compiler configuration
├── vite.config.ts                    # Vite + React + Tailwind v4 configuration
└── src/
    ├── main.tsx                      # React 19 root mount
    ├── index.css                     # Tailwind v4 @import, @theme fonts, base & reduced-motion rules
    ├── App.tsx                       # BrowserRouter, ScrollToTop, RoleGuard, all 35 page routes
    ├── types/index.ts                # Core domain interfaces & union types
    ├── data/seedData.ts              # Realistic Indian cars, users, groups, dealers, offers, purchases
    ├── services/matchingEngine.ts    # Pure functions for matching, lifecycle transitions & pricing math
    ├── store/AppContext.tsx          # Global state provider, localStorage sync & all CRUD mutations
    ├── utils/
    │   ├── carImages.ts              # Static ES imports mapping model imageKey -> exact car photos
    │   ├── celebration.ts            # canvas-confetti trigger with reduced-motion safeguard
    │   └── formatters.ts             # INR currency formatting, date helpers, privacy masking, CSV export
    ├── components/                   # Reusable UI blocks (Layouts, GroupCard, SavingsCalculator, Modals, etc.)
    └── pages/
        ├── public/                   # 13 Public pages
        ├── user/                     # 11 Authenticated Buyer workspace pages
        └── admin/                    # 11 Authenticated Admin workspace pages
```

---

## 5. Complete 35-Page Route Map

### 5.1 Public Pages (13 Routes — `PublicLayout`)
1. `/` — **Home (`HomePage`)**: Hero section ("Better Deals Happen When We Buy Together."), featured group deals, popular models, **Potential Savings Calculator**, How It Works, Why Choose AutoCollective, FAQs, compliance disclaimer.
2. `/cars` — **Explore Cars (`ExploreCarsPage`)**: Filterable Indian car catalog with variant ex-showroom pricing, specs, and direct request launch.
3. `/groups` — **Browse Group Deals (`BrowseGroupsPage`)**: Search/filter active cohorts by model, city, fuel, transmission, and status.
4. `/groups/:groupId` — **Public Group Details (`PublicGroupDetailsPage`)**: Full group specs, target progress bar, masked member roster, published offers preview, and Join Group action.
5. `/how-it-works` — **How It Works (`HowItWorksPage`)**: Step-by-step lifecycle from request submission to dealership quotation comparison.
6. `/about` — **About Us (`AboutPage`)**: Platform mission, transparency standards, and non-brokerage facilitator role.
7. `/faq` — **FAQ (`FaqPage`)**: Expandable answers covering matching, privacy, timelines, offers, and cancellations.
8. `/contact` — **Contact Us (`ContactPage`)**: Validated inquiry form persisted in `db.contacts`.
9. `/login` — **Login (`LoginPage`)**: Email/password login + one-click demo credential fill for Buyer and Admin.
10. `/register` — **Register (`RegisterPage`)**: Buyer registration with validation and immediate session creation.
11. `/forgot-password` — **Forgot Password (`ForgotPasswordPage`)**: Interactive demo password reset flow.
12. `/terms` — **Terms & Conditions (`TermsPage`)**: Platform usage terms, quotation disclaimers, and buyer obligations.
13. `/privacy` — **Privacy Policy (`PrivacyPage`)**: Data handling and member masking practices.

### 5.2 User Workspace Pages (11 Routes — `RoleGuard allowedRole="user"` + `WorkspaceLayout mode="user"`)
14. `/dashboard` — **User Dashboard (`UserDashboardPage`)**: KPI summary, active groups, request statuses, unread notifications, recent offers, and quick actions.
15. `/dashboard/profile` — **My Profile (`MyProfilePage`)**: Editable buyer profile (name, phone, city) and notification toggles.
16. `/dashboard/requests` — **My Car Requests (`MyRequestsPage`)**: Request status tracking with edit (where permitted) and cancel actions.
17. `/dashboard/requests/new` (and `/dashboard/requests/:requestId/edit`) — **Create / Edit Car Request (`CreateRequestPage`)**: Searchable brand/model/variant selector, fuel/transmission sync, budget, timeline, and automatic group matching on submit.
18. `/dashboard/groups` — **My Groups (`MyGroupsPage`)**: Buyer's joined cohorts with progress and leave-group controls.
19. `/dashboard/groups/:groupId` — **User Group Details (`UserGroupDetailsPage`)**: Member workspace view with join/leave, negotiation status, and offer review.
20. `/dashboard/offers` — **Dealer Offers (`DealerOffersPage`)**: Published dealership quotations for the buyer's groups with "Confirm Purchase Intention" trigger.
21. `/dashboard/compare` — **Offer Comparison (`OfferComparisonPage`)**: Side-by-side itemized cost breakdown matrix across quotations (Ex-Showroom, RTO, Insurance, Accessories, Additional Charges, Group Discount, Final On-Road Price).
22. `/dashboard/notifications` — **Notifications (`NotificationsPage`)**: Real-time platform alerts with mark-read and mark-all-read controls.
23. `/dashboard/purchases` — **Purchase Tracking (`PurchaseTrackingPage`)**: 5-stage stepper (`Intention Confirmed` → `Dealer Assigned` → `Booking Paid` → `Vehicle Allocated` → `Delivered`) + celebration trigger upon newly delivered vehicles.
24. `/dashboard/settings` — **Account Settings (`AccountSettingsPage`)**: Password change, notification preferences, and local demo data reset option.

### 5.3 Admin Workspace Pages (11 Routes — `RoleGuard allowedRole="admin"` + `WorkspaceLayout mode="admin"`)
25. `/admin` — **Admin Dashboard (`AdminDashboardPage`)**: Platform KPIs (users, requests, active groups, ready-for-negotiation groups, published offers, completed purchases), status distribution charts, and recent audit activity logs.
26. `/admin/users` — **User Management (`AdminUsersPage`)**: Activate/deactivate accounts and switch user roles (`user` / `admin`).
27. `/admin/brands` — **Car Brand Management (`AdminBrandsPage`)**: Full CRUD for OEM brands (Hyundai, Tata Motors, Kia, Mahindra, Maruti Suzuki, etc.).
28. `/admin/models` — **Car Model & Variant Management (`AdminModelsPage`)**: Full CRUD for models and trim variants (ex-showroom price, fuel, transmission, engine spec, mileage, key features).
29. `/admin/requests` — **Request Management (`AdminRequestsPage`)**: View all buyer requests, filter by status/city, and manually update request statuses.
30. `/admin/groups` — **Group Management (`AdminGroupsPage`)**: Create/edit/delete groups, adjust capacity/expiry, manage members, and advance negotiation statuses.
31. `/admin/dealers` — **Dealer Management (`AdminDealersPage`)**: Register authorized dealerships, assign brands/models, and toggle verification status.
32. `/admin/offers` — **Dealer Offer Management (`AdminOffersPage`)**: Create, edit, publish, or delete itemized quotations with automatic `finalOnRoadPrice` computation.
33. `/admin/purchases` — **Purchase Management (`AdminPurchasesPage`)**: Advance buyer purchase milestones, assign dealer reference codes, and record remarks.
34. `/admin/reports` — **Reports & Analytics (`AdminReportsPage`)**: City-wise demand summary, average quoted discount, average on-road price, agreed volume, and **one-click CSV export** (`downloadCSV`).
35. `/admin/settings` — **Admin Settings (`AdminSettingsPage`)**: Configure `defaultGroupTarget`, `defaultGroupExpiryDays`, `allowAutoGroupCreation`, support contacts, and maintenance notice.

---

## 6. Core Business Logic, Data Models & Features

### 6.1 Data Schema (`src/types/index.ts` & `localStorage`)
State is stored under:
- `autocollective_db_v1`: Master `AppDatabase` JSON object containing `users`, `brands`, `models`, `requests`, `groups`, `dealers`, `offers`, `purchases`, `notifications`, `contacts`, `activities`, and `settings`.
- `autocollective_session_v1`: Currently logged-in `userId`.
- `autocollective_celebrated_deliveries_v1`: Array of delivered `purchaseId`s already celebrated with confetti to prevent repeat triggers on page revisit.

### 6.2 Automatic Group Matching Engine (`src/services/matchingEngine.ts`)
When a buyer submits a car request:
1. **Duplicate Prevention (`findDuplicateActiveRequest`)**: Blocks creating a second non-cancelled request by the same user for the same `modelId + variantId + city + fuelType + transmission`.
2. **Strict Compatibility Check (`isRequestCompatibleWithGroup`)**: Only matches an open group (`Collecting Buyers` or `Ready for Negotiation`) if **all 7 dimensions** match:
   - `brandId`, `modelId`, `variantId`, `city` (case-insensitive trimmed), `fuelType`, `transmission`, `timeline`.
   - Plus group checks: `members.length < targetBuyers`, `expiresAt > now`, and user is not already a member.
3. **Auto-Creation Fallback (`matchOrCreateGroupForRequest`)**: If no compatible open group exists, automatically creates a new `BuyingGroup` with a city-coded ID (e.g., `AC-BLY-225`), `targetBuyers = settings.defaultGroupTarget` (default `5`), and `expiresAt = now + defaultGroupExpiryDays` (default `30` days).
4. **Lifecycle State Machine**:
   - Group statuses: `Collecting Buyers` → `Ready for Negotiation` → `Negotiating` → `Offer Received` → `Deal Completed` / `Expired`.
   - `refreshGroupLifecycleStatuses` automatically transitions past-due non-completed groups to `Expired` on load.

### 6.3 Dealership Pricing Formula
In `calculateFinalOnRoadPrice`:
$$\text{Final On-Road Price} = \max\big(0, \text{round}(\text{Ex-Showroom} + \text{RTO} + \text{Insurance} + \text{Accessories} + \text{Additional Charges} - \text{Group Discount})\big)$$

### 6.4 Potential Savings Calculator (`src/components/SavingsCalculator.tsx`)
- Dynamically derives min, max, and average historical discount percentages directly from `db.offers` where `status === 'Published'` (`groupDiscount / exShowroomPrice`).
- Lets visitors select any Car Model, Variant, Target Group Size (`3`, `5`, `8`, `10` buyers), and Expected Purchase Timeline (`Immediate`, `Within 30 Days`, `1 - 2 Months`, `2 - 3 Months`).
- Applies cohort-size and timeline multipliers plus estimated insurance/accessory quote optimization to project an illustrative collective savings range and estimated collective on-road price range alongside an explicit non-guarantee disclaimer.

### 6.5 Seeded Indian Automotive Catalog (`src/data/seedData.ts`)
5 OEM Brands, 5 Popular Models with multiple variants & exact matched photography:
- **Hyundai Creta** (`SX (O) IVT`, `SX Tech 1.5 Petrol`, etc.)
- **Tata Nexon** (`Fearless Plus S DCA`, `Creative Plus`, etc.)
- **Kia Seltos** (`HTX 1.5 Petrol IVT`, `GTX+`, etc.)
- **Mahindra Scorpio-N** (`Z8 L Diesel AT`, `Z6`, etc.)
- **Maruti Suzuki Brezza** (`ZXi+ AT`, `VXi Smart Hybrid`, etc.)

Includes 5 active regional groups (notably Bareilly Hyundai Creta `AC-BLY-204` at **4/5 buyers** ready to tip into negotiation), 7 regional dealerships, and 4 published sample quotations.

### 6.6 Confetti Celebration (`src/utils/celebration.ts`)
- Fires `triggerDealCelebration()` inside `AppContext.confirmPurchaseIntention` when a buyer confirms a published dealer offer, and inside `PurchaseTrackingPage` when a purchase reaches `'Delivered'` for the first time.
- Uses brand-aligned colors (`#176B50`, `#23946F`, `#17191D`, `#D97706`, `#D4D0C5`) and checks `window.matchMedia('(prefers-reduced-motion: reduce)').matches` plus `disableForReducedMotion: true`.

---

## 7. Viva, Technical Interview & Evaluation Q&A Bank

### Category A: Project Concept, Business Logic & Compliance

**Q1. What problem does AutoCollective solve, and how is it different from a regular car-buying marketplace?**  
*Answer:* Individual car buyers negotiate alone against dealerships and lack volume leverage, leading to opaque accessory markups and inconsistent discounts. AutoCollective aggregates verified buyers looking for the exact same vehicle specification, city, and buying timeline into a single cohort (default 5 buyers), enabling platform admins to invite transparent, itemized bulk quotations from authorized dealers.

**Q2. Does AutoCollective sell cars directly or guarantee discounts?**  
*Answer:* No. AutoCollective acts strictly as a demand-aggregation and facilitation platform connecting buyers and authorized dealerships. Discounts, RTO slabs, and vehicle availability are determined by participating dealers, and sample quotations shown in the app are explicitly labelled as demonstration figures.

**Q3. How does the automatic group matching algorithm work, and how do you avoid bad matches?**  
*Answer:* `matchOrCreateGroupForRequest` in `src/services/matchingEngine.ts` enforces strict 7-field compatibility (`brandId`, `modelId`, `variantId`, `city`, `fuelType`, `transmission`, `timeline`) along with capacity (`members.length < targetBuyers`), non-expiry (`expiresAt > now`), and duplicate-membership checks. It never relaxes compatibility rules just to fill a group; if no exact match exists, it automatically creates a new group for that demand profile.

**Q4. How do you prevent a user from inflating a group's buyer count with duplicate requests?**  
*Answer:* Two safeguards exist: `findDuplicateActiveRequest` prevents a user from submitting multiple active (non-cancelled) requests for the same model, variant, city, fuel, and transmission; and `joinGroup` / `matchOrCreateGroupForRequest` checks `!grp.members.some(m => m.userId === userId)` before adding any member.

**Q5. Explain the Group Status lifecycle in AutoCollective.**  
*Answer:* Groups move through: `Collecting Buyers` → `Ready for Negotiation` (automatically triggered when `members.length >= targetBuyers`) → `Negotiating` (admin actively engaging dealerships) → `Offer Received` (at least one `Published` quotation exists) → `Deal Completed` or `Expired` (automatically transitioned by `refreshGroupLifecycleStatuses` once `expiresAt` passes).

**Q6. How do you protect buyer privacy inside public and shared group pages?**  
*Answer:* While full contact info is stored in the user record for admin coordination, shared group member rosters pass names and phone numbers through `maskMemberName` (e.g., `Arjun Verma` → `A**** V****`) and `maskPhone` (`+91 ••••• •4321`) in `src/utils/formatters.ts`.

---

### Category B: Tech Stack & Architecture

**Q7. Why did you choose React 19 + TypeScript + Vite 8 + Tailwind CSS v4?**  
*Answer:*  
- **React 19** provides fast client-side rendering and clean hook-based composition across 35 interactive routes.  
- **TypeScript** eliminates runtime shape mismatches across complex nested domain entities (`CarModel` → `CarVariant`, `BuyingGroup` → `GroupMember`, `DealerOffer` pricing breakdown).  
- **Vite 8** gives near-instant dev startup and optimized production bundling.  
- **Tailwind CSS v4** (`@tailwindcss/vite`) removes legacy config boilerplate via `@import "tailwindcss";` and `@theme` font tokens in `src/index.css`.

**Q8. How is state management handled without Redux or Zustand?**  
*Answer:* Global application state is managed through a typed React Context (`AppProvider` / `useApp` in `src/store/AppContext.tsx`). All mutations (auth, requests, group matching, catalog CRUD, dealer offers, purchases, settings) execute inside structured `ActionResult<T>` methods that update React state, write audit logs (`activities`), push user/admin notifications, fire toast feedback, and sync atomically to `localStorage`.

**Q9. Why is `localStorage` used instead of a live database, and what are its trade-offs?**  
*Answer:* `localStorage` (`autocollective_db_v1`) makes the prototype 100% self-contained, zero-setup, and immediately interactive with full CRUD persistence across page refreshes. Its trade-offs are that data is browser-local (not shared across separate devices/users in real time), storage is capped (~5 MB), and password checks occur client-side—which is fine for a demonstration prototype but must be moved to a backend for production.

**Q10. How did you implement Role-Based Access Control (RBAC) in routing?**  
*Answer:* `src/App.tsx` wraps the 11 `/dashboard/*` routes in `<RoleGuard allowedRole="user">` and the 11 `/admin/*` routes in `<RoleGuard allowedRole="admin">`. Unauthenticated visitors are redirected to `/login` (preserving their intended path via `location.pathname` in router state), while authenticated users attempting to access the opposite role's workspace see a "Role Access Restricted" screen with a shortcut back to their own workspace.

**Q11. Why are `express`, `@google/genai`, or `motion` listed in `package.json` if the app runs on client-side `localStorage`?**  
*Answer:* They came pre-installed in the base workspace template (`package.json`). During implementation, AutoCollective was architected cleanly as a deterministic client-side SPA using `React`, `TypeScript`, `React Router v7`, `Tailwind CSS v4`, `Lucide React`, and `Canvas Confetti`, without invoking unused server or AI packages.

**Q12. How does the Potential Savings Calculator compute its estimates?**  
*Answer:* Rather than hardcoding arbitrary numbers, `SavingsCalculator.tsx` reads all `Published` quotations in `db.offers`, computes historical discount rates (`groupDiscount / exShowroomPrice`), and scales them using target cohort size (`3`, `5`, `8`, `10` buyers) and timeline multipliers, plus estimated insurance/accessory quote optimization, displaying an illustrative range with an explicit disclaimer.

**Q13. How is the Final On-Road Price calculated in Dealer Offers?**  
*Answer:* `calculateFinalOnRoadPrice` in `src/services/matchingEngine.ts` computes:  
`Ex-Showroom + RTO + Insurance + Accessories + Additional Charges - Group Discount`, clamped at `>= 0` and rounded to the nearest rupee. Putting this in a shared pure function ensures the Admin Offer creator, User Offer list, and Side-by-Side Offer Comparison always agree down to the exact rupee.

**Q14. How did you handle accessibility and UX polish for animations and numbers?**  
*Answer:*  
1. **Confetti (`src/utils/celebration.ts`):** Checks `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and passes `disableForReducedMotion: true` to `canvas-confetti`, while `src/index.css` disables CSS animations/transitions for reduced-motion users.  
2. **Tabular Numbers:** Uses `.tabular-nums` (`font-variant-numeric: tabular-nums`) on currency columns, calculators, and counters so digits align vertically without layout jitter.  
3. **CSV Export (`downloadCSV`):** Safely escapes double quotes inside CSV cells and builds a `Blob` download for admin reports without external dependencies.

---

### Category C: Production Scalability & Future Enhancements

**Q15. What changes would be required to take AutoCollective from this prototype to real-world production?**  
*Answer:*  
1. **Backend & Relational Database:** Move `AppContext` mutations into REST/GraphQL endpoints (e.g., Node.js/Express + PostgreSQL via Drizzle/Prisma) with database transactions so two buyers claiming the 5th spot in a group cannot exceed capacity due to race conditions.  
2. **Authentication & Security:** Replace client-side demo passwords with hashed passwords (`bcrypt`/`argon2`), HTTP-only JWT/session cookies, OTP phone verification, and server-enforced RBAC middleware.  
3. **Dealer Portal & Real-Time Alerts:** Add a third `dealer` role so dealerships upload PDFs/quotes directly, plus WebSockets/SSE or email/WhatsApp webhooks for instant group-milestone notifications.  
4. **Object Storage & CDN:** Serve verified vehicle brochure assets and dealer quote documents from cloud storage rather than bundled local assets.

**Q16. If two users submit compatible requests at the exact same millisecond in production, how would you prevent overfilling a 5-buyer group?**  
*Answer:* In a relational backend, wrap the matching query and member insertion inside an ACID transaction using row-level locking (`SELECT ... FOR UPDATE` on open compatible groups) or an atomic conditional update checking `member_count < target_buyers`.
