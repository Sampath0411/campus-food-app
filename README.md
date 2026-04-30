# Campus Grub Hub (Bytebites)

A modern campus food-ordering web app built with **React + Vite + TypeScript**.  
The app focuses on student use-cases like fast hostel delivery, group ordering with split bills, scheduled meals, and live order tracking.

## Highlights

- Dashboard with AI-style meal recommendations and category/filter UI
- Restaurant browsing and menu flow with add/remove cart actions
- Cart and checkout UI with coupon + payment method selection
- Live order tracking timeline with rider card and animated map path
- Real geolocation support for distance + ETA estimation
- Group order flow with invite links, member tabs, item-level ownership, and split modes
- Search page for restaurants/cuisines/tags
- Profile and scheduled orders screens
- Responsive layout with desktop sidebar + mobile bottom nav
- Dark mode toggle

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Routing:** React Router
- **State:** React Context + local component state
- **UI:** Tailwind CSS, shadcn/ui, Radix UI, Lucide icons
- **Data layer:** Local mock data (`src/data/mock.ts`) + localStorage-backed stores
- **Testing:** Vitest + Testing Library

## Important Implementation Notes

This is currently a **frontend-first demo app**:

- No backend API/database is wired yet.
- Restaurants/menu are from static mock data.
- Group order and order progress are persisted in `localStorage`:
  - `bb:group:*`
  - `bb:group:active`
  - `bb:active-order`
  - `bb:geo`

## Routes

- `/` — Home dashboard
- `/r/:id` — Restaurant page
- `/cart` — Cart + checkout
- `/orders` — Live order tracking
- `/group` — Group order home
- `/g/:code` — Group invite entry route
- `/search` — Search
- `/profile` — Profile
- `/scheduled` — Scheduled orders

## Project Structure

```text
campus-grub-hub/
├─ public/
├─ src/
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ AppShell.tsx
│  │  ├─ NavLink.tsx
│  │  └─ RestaurantCard.tsx
│  ├─ context/
│  │  └─ CartContext.tsx
│  ├─ data/
│  │  └─ mock.ts
│  ├─ hooks/
│  │  ├─ useGeolocation.ts
│  │  └─ useOrderProgress.ts
│  ├─ lib/
│  │  ├─ groupStore.ts
│  │  ├─ orderStore.ts
│  │  └─ utils.ts
│  ├─ pages/
│  │  ├─ Dashboard.tsx
│  │  ├─ Restaurant.tsx
│  │  ├─ Cart.tsx
│  │  ├─ OrderTracking.tsx
│  │  ├─ GroupOrder.tsx
│  │  ├─ Search.tsx
│  │  ├─ Profile.tsx
│  │  ├─ Scheduled.tsx
│  │  └─ NotFound.tsx
│  ├─ App.tsx
│  └─ main.tsx
├─ package.json
└─ vite.config.ts
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — create production build
- `npm run build:dev` — development-mode build
- `npm run lint` — run ESLint
- `npm run test` — run Vitest once
- `npm run test:watch` — run Vitest in watch mode

## Deploy to Vercel

This app is Vite-based and deploys directly on Vercel.

1. Push this repository to GitHub.
2. Import the repo in Vercel.
3. Keep default settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy.

No environment variables are required for the current demo version.
