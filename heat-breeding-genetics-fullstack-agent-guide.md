
# Heat Detection, Breeding Cycle & Genetics System
## Full-Stack Implementation Guide (Nuxt 3 + Supabase)
### Agent-Ready • Corrected Logic • Frontend + Backend Inclusive

Author: Daniel Muthiru Njama

---

## STACK CONFIRMATION (SOURCE OF TRUTH)

Frontend (Web):
- Nuxt 3 (Vue 3, SSR + SPA)
- TypeScript (strict)
- Tailwind CSS
- @nuxt/icon + Lucide
- Nuxt auto-routing & middleware
- Composition API

Frontend (Mobile):
- Capacitor 6 + Vue 3
- Vite

Backend:
- Supabase (PostgreSQL)
- Supabase Auth (JWT, Google, Email/Password)
- Row Level Security (RLS)
- Supabase Storage

---

# SECTION 1: BACKEND IMPLEMENTATION (SUPABASE)

## 1.1 Database Design Rules

- Store only factual data (no derived dates)
- All timestamps stored in UTC
- All tables include:
  - farm_id (UUID)
  - created_at
  - updated_at
  - deleted_at (soft delete)

---

## 1.2 Core Tables (Summary)

Tables:
- heat_events
- breeding_attempts
- pregnancy_checks
- breeding_alerts
- cows (extended for genetics)

Derived values (breeding window, expected heat, calving date) are calculated in SQL views or backend logic, never stored.

---

## 1.3 Row Level Security (RLS)

### Global Rule Pattern
```sql
farm_id = auth.jwt() ->> 'farm_id'
```

Applied to:
- SELECT
- INSERT
- UPDATE
- DELETE

Pregnancy, breeding, and genetics data is strictly farm-isolated.

---

## 1.4 SQL Views (Critical)

Create views for agent consumption:

- v_active_breeding_windows
- v_pending_pregnancy_checks
- v_expected_heats
- v_breeding_success_rates

Views calculate:
- breeding window status
- urgency levels
- countdowns

---

## 1.5 Backend Services (Supabase Functions)

### Heat Service
Triggered via RPC or Edge Function:
- validate_heat_event()
- create_heat_event()
- schedule_breeding_alerts()

### Breeding Service
- validate_breeding_attempt()
- calculate_attempt_number()
- schedule_pregnancy_check_alert()

### Pregnancy Service
- record_pregnancy_result()
- update_cow_status()
- schedule_calving_or_next_heat_alert()

### Genetics Service
- get_ancestors(cow_id, depth)
- get_descendants(cow_id, depth)
- check_breeding_compatibility(cow_id, sire_id)

---

## 1.6 Background Jobs (CRON)

Supabase scheduled functions run every 5 minutes to:
- trigger breeding window alerts
- trigger overdue pregnancy checks
- escalate overdue alerts

---

# SECTION 2: FRONTEND (NUXT 3 WEB)

## 2.1 Routes (Auto-routing)

Routes:
- /breeding
- /pregnancy-checks
- /family-tree
- /genetics/compatibility
- /genetics/lines
- /cows/[id]

---

## 2.2 Page → Component Map

### /breeding
- HeatForm.vue
- ActiveBreedingWindows.vue
- BreedingForm.vue
- BreedingHistoryTable.vue

### /pregnancy-checks
- PregnancyCheckForm.vue
- PendingChecksTable.vue

### /family-tree
- FamilyTreeCanvas.vue
- TreeSidebar.vue

---

## 2.3 State Management Rules

- useAsyncData() for server data
- Local component state for forms
- No derived date logic in frontend
- All calculations come from backend views or RPC

---

## 2.4 Data Flow Example (Heat Recording)

HeatForm.vue
→ submit()
→ supabase.from('heat_events').insert()
→ backend trigger schedules alerts
→ refresh ActiveBreedingWindows

---

## 2.5 UI Rules

- Tailwind utility-first
- Color coding:
  - Red = urgent
  - Yellow = warning
  - Green = success
- Mobile-first layout
- Skeleton loaders for async data

---

# SECTION 3: MOBILE (CAPACITOR)

- Same Vue components reused
- Capacitor plugins:
  - Push notifications (alerts)
  - Camera (animal photos)
- Offline-first for forms (sync on reconnect)

---

# SECTION 4: GENETICS & FAMILY TREE

## 4.1 Backend

- Recursive CTEs for ancestry
- Limit depth to 5 generations
- Cache compatibility results (TTL-based)

## 4.2 Frontend

- SVG-based tree
- Lazy-load ancestors/descendants
- Tap-to-focus for mobile

---

# SECTION 5: IMPLEMENTATION PHASES (AGENT EXECUTION ORDER)

## Phase 1: Backend Core
- Tables + RLS
- Heat → Breeding → Pregnancy logic
- Alerts

## Phase 2: Web Frontend Core
- Breeding page
- Dashboards
- Forms + validation

## Phase 3: Genetics
- Parentage
- Compatibility checker
- Family tree API

## Phase 4: Visualization + Mobile
- Tree UI
- Capacitor build
- Push notifications

---

# SUCCESS CRITERIA

- No duplicated logic frontend/backend
- Alerts always reliable
- Genetics prevents inbreeding
- Scales to 1,000+ animals
- Works offline (mobile)

---

END OF FULL-STACK AGENT IMPLEMENTATION GUIDE
