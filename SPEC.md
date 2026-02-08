# Analytics Dashboard — Technical Specification

> **Project:** AppifyDevs Frontend Assignment  
> **Author:** Candidate  
> **Date:** February 8, 2026  
> **Time Budget:** 48 hours  

---

## 1. Confirmed Decisions (from interview)

| Decision | Choice | Rationale |
|---|---|---|
| **State Management** | Redux Toolkit + manual async thunks (fetch) | Satisfies Redux + Fetch API requirements; candidate control over data flow |
| **Charting** | shadcn/ui Charts (Recharts under the hood) | Themed chart wrappers; Recharts installed as peer dep automatically |
| **Styling** | Tailwind CSS + shadcn/ui component library | shadcn/ui IS Tailwind; generates `.tsx` files with utility classes |
| **Icons** | Lucide React | Default shadcn/ui icon set; tree-shakeable |
| **Color Theme** | Default shadcn/ui theme (zinc/slate) | Clean, professional, dark-mode ready |
| **Sidebar** | shadcn/ui Sidebar (collapsible) | Built-in collapse, mobile sheet, icon-only mode |
| **Layout Strategy** | Next.js App Router `layout.tsx` | Sidebar + header in layout; pages = content only |
| **Filter State** | URL query params (shareable) | Filters sync to `?period=30d&userType=premium`; shareable URLs |
| **Data Source (Dev)** | JSON Server on port 4000 | Mock API with 200-600ms latency simulation |
| **Data Source (Prod)** | Next.js API Routes (`app/api/`) | Serverless; deploys natively to Vercel |
| **API Switching** | `NEXT_PUBLIC_API_URL` env variable | Dev → `http://localhost:4000/api`, Prod → `/api` |
| **Notification** | Static dropdown (UI only) | Bell icon + badge + mock notification items |
| **Profile** | Dropdown with mock menu items | Avatar + name + Profile/Settings/Logout items |
| **Animations** | CSS/Tailwind transitions only | Zero extra deps; hover, shimmer, sidebar collapse |
| **Traffic Chart** | Included (optional advanced) | Data already in JSON Server; shows initiative |
| **Git Strategy** | Feature branches + meaningful commits | `feat/sidebar`, `feat/charts`, etc. |
| **Deployment** | Vercel | Native Next.js support |
| **Testing** | Skipped | Time allocated to features and polish |

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| State Management | Redux Toolkit | latest |
| Data Fetching | Native Fetch API (in createAsyncThunk) | — |
| Charts | Recharts (via shadcn/ui Charts) | latest |
| Styling | Tailwind CSS 4 | 4.x |
| UI Components | shadcn/ui | latest |
| Icons | Lucide React | latest |
| Dev API | JSON Server | 0.17.4 |
| Deployment | Vercel | — |

---

## 3. Folder Structure (Feature-Based Co-location)

```
src/
├── app/
│   ├── layout.tsx                  # Root layout: providers, fonts
│   ├── page.tsx                    # Redirect to /dashboard
│   ├── globals.css                 # Tailwind imports + custom tokens
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard shell: sidebar + header + main area
│   │   └── page.tsx                # Dashboard content: KPIs + charts + filters
│   └── api/                        # Next.js API routes (prod data source)
│       ├── stats/
│       │   └── route.ts
│       ├── revenue/
│       │   └── route.ts
│       ├── orders/
│       │   └── route.ts
│       ├── users/
│       │   └── route.ts
│       └── traffic/
│           └── route.ts
├── components/
│   ├── ui/                         # shadcn/ui generated components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── skeleton.tsx
│   │   ├── sidebar.tsx
│   │   ├── chart.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── app-sidebar.tsx         # Sidebar navigation content
│   │   ├── header.tsx              # Top header bar
│   │   ├── notification-dropdown.tsx
│   │   └── user-profile-dropdown.tsx
│   ├── dashboard/
│   │   ├── kpi-card.tsx            # Reusable KPI stat card
│   │   ├── kpi-grid.tsx            # Grid of 4 KPI cards
│   │   ├── revenue-chart.tsx       # Line chart
│   │   ├── orders-chart.tsx        # Bar chart
│   │   ├── user-distribution-chart.tsx  # Pie chart
│   │   ├── traffic-source-chart.tsx     # Optional advanced chart
│   │   ├── chart-card.tsx          # Reusable chart wrapper (title + loading + error)
│   │   └── dashboard-filters.tsx   # Date range + user type filters
│   └── shared/
│       ├── error-state.tsx         # Reusable error display with retry
│       └── empty-state.tsx         # Reusable empty state display
├── store/
│   ├── index.ts                    # Store configuration
│   ├── hooks.ts                    # Typed useAppDispatch, useAppSelector
│   ├── provider.tsx                # Redux Provider wrapper (client component)
│   └── slices/
│       ├── dashboard-slice.ts      # Dashboard data (stats, revenue, orders, users, traffic)
│       └── filters-slice.ts        # Filter state (period, userType) — synced with URL
├── lib/
│   ├── api.ts                      # Centralized fetch functions (getStats, getRevenue, etc.)
│   ├── utils.ts                    # shadcn/ui cn() helper + general utils
│   └── constants.ts                # API base URL, filter options, chart colors
├── hooks/
│   ├── use-url-filters.ts          # Hook to sync Redux filter state ↔ URL search params
│   └── use-media-query.ts          # Responsive breakpoint hook (if needed)
└── types/
    ├── dashboard.ts                # KPI, Revenue, Order, User, Traffic types
    └── filters.ts                  # FilterState, Period, UserType types
```

---

## 4. API Endpoints & Data Contract

### Base URL
- **Development:** `http://localhost:4000/api` (JSON Server)
- **Production:** `/api` (Next.js API Routes)
- Controlled by: `NEXT_PUBLIC_API_URL`

### Endpoints

| Method | Endpoint | Query Params | Response |
|---|---|---|---|
| GET | `/api/stats` | `?period=7d\|30d\|12m` | `Stats[]` — KPI data for selected period |
| GET | `/api/revenue` | `?period=...&userType=all\|free\|premium\|enterprise` | `Revenue[]` — Revenue time-series |
| GET | `/api/orders` | `?period=...&userType=all\|free\|premium\|enterprise` | `Orders[]` — Orders time-series |
| GET | `/api/users` | `?period=7d\|30d\|12m` | `UserDist[]` — User segment distribution |
| GET | `/api/traffic` | `?period=7d\|30d\|12m` | `Traffic[]` — Traffic source breakdown |

### TypeScript Types

```typescript
// types/dashboard.ts

type Trend = 'up' | 'down';

interface KpiValue {
  value: number;
  previousValue: number;
  changePercent: number;
  trend: Trend;
}

interface Stats {
  id: string;
  period: string;
  label: string;
  kpis: {
    totalRevenue: KpiValue;
    totalUsers: KpiValue;
    orders: KpiValue;
    conversionRate: KpiValue;
  };
}

interface RevenueDataPoint {
  label: string;
  revenue: number;
}

interface Revenue {
  id: string;
  period: string;
  userType: string;
  data: RevenueDataPoint[];
}

interface OrderDataPoint {
  label: string;
  orders: number;
}

interface Orders {
  id: string;
  period: string;
  userType: string;
  data: OrderDataPoint[];
}

interface UserSegment {
  segment: string;
  count: number;
  color: string;
}

interface UserDistribution {
  id: string;
  period: string;
  distribution: UserSegment[];
}

interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

interface Traffic {
  id: string;
  period: string;
  sources: TrafficSource[];
}
```

### Filter Types

```typescript
// types/filters.ts

type Period = '7d' | '30d' | '12m';
type UserType = 'all' | 'free' | 'premium' | 'enterprise';

interface FilterState {
  period: Period;
  userType: UserType;
}
```

---

## 5. State Management Architecture

### Redux Store Structure

```
store/
├── slices/
│   ├── dashboard-slice.ts    # Async thunks + data state
│   └── filters-slice.ts     # Synchronous filter state
```

### Dashboard Slice

```typescript
interface DashboardState {
  stats: {
    data: Stats | null;
    loading: boolean;
    error: string | null;
  };
  revenue: {
    data: Revenue | null;
    loading: boolean;
    error: string | null;
  };
  orders: {
    data: Orders | null;
    loading: boolean;
    error: string | null;
  };
  users: {
    data: UserDistribution | null;
    loading: boolean;
    error: string | null;
  };
  traffic: {
    data: Traffic | null;
    loading: boolean;
    error: string | null;
  };
}
```

Each data domain has **independent** loading/error states so:
- Charts load independently (no single blocking fetch)
- One failing endpoint doesn't break the entire dashboard
- Each component shows its own skeleton/error state

### Async Thunks

```typescript
// 5 independent thunks — one per endpoint
export const fetchStats = createAsyncThunk('dashboard/fetchStats', ...);
export const fetchRevenue = createAsyncThunk('dashboard/fetchRevenue', ...);
export const fetchOrders = createAsyncThunk('dashboard/fetchOrders', ...);
export const fetchUsers = createAsyncThunk('dashboard/fetchUsers', ...);
export const fetchTraffic = createAsyncThunk('dashboard/fetchTraffic', ...);
```

### Filter → Data Flow

1. User changes filter (date range or user type)
2. `filters-slice` updates Redux state
3. `use-url-filters` hook syncs new filters to URL search params
4. Dashboard page `useEffect` watches filter state and dispatches all 5 thunks
5. Each thunk fetches from API with filter params
6. Each chart re-renders with new data independently

---

## 6. URL Filter Synchronization

### Hook: `use-url-filters.ts`

```
URL ?period=30d&userType=premium
          ↕ (bidirectional sync)
Redux filters-slice { period: '30d', userType: 'premium' }
```

- **On page load:** Read URL params → initialize Redux filter state
- **On filter change:** Update Redux → push new URL params (without navigation)
- **On browser back/forward:** Read URL params → update Redux
- Uses `useSearchParams()` from `next/navigation`

---

## 7. Component Architecture

### Reusable Components

#### `KpiCard`
```
Props:
  - title: string (e.g., "Total Revenue")
  - value: number | string (formatted display value)
  - changePercent: number
  - trend: 'up' | 'down'
  - icon: LucideIcon
  - formatter?: (value: number) => string  (e.g., currency, percentage)
  - loading: boolean
```

Renders:
- Icon in colored circle
- Title + formatted value
- Percentage badge (green/up or red/down with arrow icon)
- Skeleton state when `loading=true`

#### `ChartCard`
```
Props:
  - title: string
  - description?: string
  - loading: boolean
  - error: string | null
  - onRetry: () => void
  - children: React.ReactNode (the actual chart)
```

Renders:
- Card wrapper with header
- Skeleton shimmer when loading
- Error state with retry button when error
- Chart content when loaded

#### `DashboardFilters`
```
Props:
  - period: Period
  - userType: UserType
  - onPeriodChange: (period: Period) => void
  - onUserTypeChange: (userType: UserType) => void
```

Renders:
- Date range selector: "Last 7 days" | "Last 30 days" | "Last 12 months"
- User type dropdown: "All Users" | "Free" | "Premium" | "Enterprise"

---

## 8. Layout Architecture

```
┌─────────────────────────────────────────────────────┐
│ RootLayout (app/layout.tsx)                         │
│  └─ Providers (Redux, Theme)                        │
│     └─ DashboardLayout (app/dashboard/layout.tsx)   │
│        ┌──────────┬──────────────────────────────┐  │
│        │          │  Header                      │  │
│        │ Sidebar  │  ┌─ Notification bell        │  │
│        │ (collap- │  └─ User profile dropdown    │  │
│        │  sible)  ├──────────────────────────────┤  │
│        │          │  Main Content Area            │  │
│        │  - Nav   │  ┌─ Filters bar ──────────┐  │  │
│        │    items │  │  Period | UserType      │  │  │
│        │  - Logo  │  └────────────────────────┘  │  │
│        │          │  ┌─ KPI Grid (4 cards) ───┐  │  │
│        │          │  │ Revenue|Users|Orders|CR │  │  │
│        │          │  └────────────────────────┘  │  │
│        │          │  ┌─ Charts (2x2 grid) ────┐  │  │
│        │          │  │ Line     │ Bar          │  │  │
│        │          │  │ (Revenue)│ (Orders)     │  │  │
│        │          │  ├──────────┼──────────────┤  │  │
│        │          │  │ Pie      │ Donut/Bar    │  │  │
│        │          │  │ (Users)  │ (Traffic)    │  │  │
│        │          │  └────────────────────────┘  │  │
│        └──────────┴──────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- **Desktop (lg: 1024px+):** Full sidebar + 2-column chart grid
- **Tablet (md: 768px):** Collapsed sidebar (icon-only rail) + 2-column chart grid
- **Mobile (< 768px):** Sidebar hidden (hamburger toggle opens sheet overlay) + single-column stack

---

## 9. Loading & Error States

### Skeleton Loading
- **KPI Cards:** Shimmer blocks matching card layout (icon circle + 2 text lines + badge)
- **Charts:** Shimmer block matching chart container height
- **Triggered:** On initial load AND on every filter change
- **Implementation:** shadcn/ui `<Skeleton>` component with Tailwind `animate-pulse`

### Error States
- **Per-component error boundary approach**
- Each `ChartCard` shows its own error state when its thunk fails
- Error state includes: error icon + message + "Retry" button
- Retry button re-dispatches the specific thunk for that component
- KPI grid shows individual card errors independently

### Empty States
- If API returns empty data array: show centered empty state illustration + message
- If no data matches filters: "No data for selected filters"

---

## 10. Performance Strategy (Targeted Memoization)

| Technique | Where | Why |
|---|---|---|
| `React.memo()` | KpiCard, ChartCard, each chart component | Prevent re-render when sibling data changes |
| `useMemo()` | Chart data transformation (formatting) | Avoid recalculating derived data on every render |
| `useCallback()` | Filter change handlers, retry handlers | Stable references for memoized children |
| Proper `key` usage | Chart data arrays, KPI card lists | Correct reconciliation |
| Dynamic `import()` | Chart components (Recharts is heavy) | Lazy-load charts with `React.lazy` + `<Suspense>` |
| Code splitting | Next.js automatic per-route | Dashboard page only loads when accessed |

---

## 11. Micro-Interactions & Animations (CSS/Tailwind)

| Interaction | Implementation |
|---|---|
| Sidebar collapse/expand | `transition-all duration-300` on width + opacity for labels |
| KPI card hover | `hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200` |
| Chart card hover | Subtle `hover:shadow-md transition-shadow` |
| Skeleton shimmer | `animate-pulse` (Tailwind built-in) |
| Filter active state | Scale + color transition on selection |
| Dropdown open/close | shadcn/ui built-in `data-[state=open]` animations |
| Notification badge | `animate-bounce` on new notification (optional) |
| Page content fade-in | `animate-in fade-in` with custom keyframe |

---

## 12. Environment Configuration

### `.env.local` (Development)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### `.env.production` (Production / Vercel)
```
NEXT_PUBLIC_API_URL=/api
```

### `lib/constants.ts`
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
```

---

## 13. API Service Layer

### `lib/api.ts`
Centralized, typed fetch functions:

```typescript
import { API_BASE_URL } from './constants';
import type { Stats, Revenue, Orders, UserDistribution, Traffic } from '@/types/dashboard';
import type { Period, UserType } from '@/types/filters';

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function getStats(period: Period): Promise<Stats[]> {
  return fetchJSON(`${API_BASE_URL}/stats?period=${period}`);
}

export async function getRevenue(period: Period, userType: UserType): Promise<Revenue[]> {
  return fetchJSON(`${API_BASE_URL}/revenue?period=${period}&userType=${userType}`);
}

export async function getOrders(period: Period, userType: UserType): Promise<Orders[]> {
  return fetchJSON(`${API_BASE_URL}/orders?period=${period}&userType=${userType}`);
}

export async function getUsers(period: Period): Promise<UserDistribution[]> {
  return fetchJSON(`${API_BASE_URL}/users?period=${period}`);
}

export async function getTraffic(period: Period): Promise<Traffic[]> {
  return fetchJSON(`${API_BASE_URL}/traffic?period=${period}`);
}
```

---

## 14. Next.js API Routes (Production Data Source)

Each route in `app/api/` reads from an imported JSON data file and filters by query params.

### Pattern:
```typescript
// app/api/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import data from '@/data/db.json'; // or inline data

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get('period');
  let results = data.stats;
  if (period) {
    results = results.filter(s => s.period === period);
  }
  return NextResponse.json(results);
}
```

This mirrors the JSON Server filtering behavior exactly.

---

## 15. Git Workflow

### Branch Strategy
```
main (production)
├── feat/project-setup          # Initial setup, shadcn, redux, json-server
├── feat/layout-sidebar         # Dashboard layout + collapsible sidebar
├── feat/header                 # Header + notification + profile dropdown
├── feat/kpi-cards              # KPI card component + grid
├── feat/filters                # Filter bar + URL sync + Redux integration
├── feat/charts                 # All 4 chart components
├── feat/loading-error-states   # Skeletons + error boundaries
├── feat/api-routes             # Next.js API routes for production
├── feat/responsive             # Mobile/tablet responsive polish
├── feat/performance            # Memoization + lazy loading
└── feat/deploy                 # Vercel deployment + env config
```

### Commit Convention
```
feat: add collapsible sidebar with mobile sheet
fix: chart tooltip clipping on small screens
style: adjust KPI card spacing for consistency
refactor: extract chart data transformation to useMemo
perf: lazy-load chart components with React.lazy
docs: add architecture decisions to README
chore: configure environment variables for API switching
```

---

## 16. Recommended Defaults (for "later" items)

These are the best-practice defaults for items deferred during interview:

| Item | Default Choice | Rationale |
|---|---|---|
| **KPI Card style** | Card + large number + trend arrow + percentage badge | Clean, fast to build, effective visual |
| **Chart grid layout** | 2x2 on desktop, 1-col on mobile | Standard dashboard pattern |
| **Loading UX** | Skeleton loaders (shimmer) per component | Assignment explicitly requires this |
| **Error UX** | Per-component error with retry button | Granular, doesn't block entire dashboard |
| **Responsive approach** | Mobile-first (Tailwind default) | Industry standard |
| **API service pattern** | Centralized typed fetch functions in `lib/api.ts` | Clean separation of concerns |
| **Folder architecture** | Feature-based co-location (as shown in section 3) | Scalable, evaluators look for this |
| **README** | Full: setup + stack + architecture + assumptions | Assignment requires it; differentiator |
| **Dark/light theme** | Include if time permits (nearly free with shadcn) | Strong bonus signal |
| **CSV export** | Include if time permits (~30 lines) | Quick win bonus |
| **Role-based dashboard** | Skip | Time-intensive; core quality matters more |

---

## 17. Development Workflow

### Local Development
```bash
# Terminal 1: JSON Server (mock API)
npm run server          # http://localhost:4000

# Terminal 2: Next.js dev
npm run dev             # http://localhost:3000

# Or both at once:
npm run dev:full
```

### Production Build
```bash
npm run build           # Builds Next.js (API routes included)
npm run start           # Serves production build locally
```

### Deployment (Vercel)
1. Push to GitHub
2. Connect repo to Vercel
3. Set env var: `NEXT_PUBLIC_API_URL=/api`
4. Deploy — API routes serve data serverlessly

---

## 18. Assumptions

1. No authentication required (no login page)
2. Dashboard is the only page (single view application)
3. All data is read-only (no create/update/delete operations)
4. Mock data is representative; no real backend integration expected
5. JSON Server is for development only; production uses Next.js API routes
6. Browser support: modern evergreen browsers (Chrome, Firefox, Safari, Edge)
7. Accessibility: semantic HTML + proper ARIA from shadcn/ui components
8. No real-time data updates (polling or WebSocket not needed)

---

*This spec should be treated as the source of truth for implementation. Items marked "if time permits" should only be attempted after all core features are complete and polished.*
