# LiveStocka - TODO List

Single source of truth for project status + remaining work.

**Last Updated:** May 4, 2026

---

## Current State (Implemented)
- Authentication: email/password + Google OAuth
- Cows: add/list/search/filter, view details, edit/delete
- Health records: CRUD (modal + pages)
- Reproduction: heat events, breeding attempts, pregnancy checks
- Milk production: per-cow logging + bulk entry + charts
- Reports page: available (exports still limited)
- Responsive single Nuxt web app (desktop/tablet/mobile)

---

## UX + Product Polish (Next)
- [ ] Audit remaining pages for mobile spacing, overflow, and touch targets
- [ ] Add consistent loading + empty states to all async views
- [ ] Add consistent form validation (schema-based) and inline errors
- [ ] Accessibility pass (focus states, labels, keyboard navigation)
- [ ] Improve toast/notification UX (timeouts, actions, stacking rules)

---

## Platform (PWA / Offline)
- [ ] Add PWA install support
- [ ] Add offline-first behavior for read-only views (cache last successful data)
- [ ] Test on physical devices (phones + iPad viewports)

---

## Data Export / Import
- [ ] CSV export for cows
- [ ] CSV export for milk production
- [ ] CSV export for health records
- [ ] CSV import flow (mapping + validation + preview)
- [ ] Optional: PDF/Excel export for reports

---

## Enhancements (Backlog)
- [ ] Photo uploads for cows (Supabase Storage)
- [ ] Multi-user roles / permissions (RBAC)
- [ ] Notifications / reminders (in-app, optional email/push later)
- [ ] Dark mode
- [ ] Keyboard shortcuts
- [ ] Tooltips/help text for complex form fields
- [ ] Onboarding tour for new users

---

## Engineering
- [ ] Unit tests (Vitest)
- [ ] E2E tests (Playwright)
- [ ] Optimize Supabase queries (indexes, pagination where needed)
- [ ] Caching strategy for static/reference data
- [ ] Lazy-load images and heavy charts
