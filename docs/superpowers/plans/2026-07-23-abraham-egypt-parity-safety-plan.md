# Abraham Roots and Egypt Roots Parity and Safety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the two independent Abraham Roots and Egypt Roots products behaviorally equivalent, rebuild-safe, recoverable, searchable, theme-consistent, translated, and subscription-complete while preserving each site's identity.

**Architecture:** Keep the projects and databases isolated. Implement equivalent contracts in each project, with product-specific branding adapters. Store tree source text and uploaded payloads in each product's database, make destructive UI actions recoverable, and keep build/startup paths non-destructive. Use shared test names and parity scripts to detect drift.

**Tech Stack:** React 19, Vite, TypeScript, Vitest, React Testing Library, React Router, Tailwind CSS, Zustand, NestJS 10, Knex, Objection, MySQL, Jest, Supertest.

## Global Constraints

- `npm run build` must compile only; it must not touch database rows, uploaded files, migrations, or seed-owned content.
- The two products remain separate frontend/backend/database deployments.
- Existing brand assets, typography, layout character, and color identities remain in place.
- No existing admin page or route may be removed.
- Every new user-facing string must have a translation key in every supported locale.
- All feature and bug-fix production code is preceded by a failing test and followed by a fresh verification run.
- Existing unrelated worktree changes are preserved.

## File map

Egypt files use `C:/Users/kecir/OneDrive/Desktop/RootsEgypt-full-SourceCode`; Abraham files use `C:/Users/kecir/OneDrive/Desktop/RootsAbraham/AbrahamRoots-full-code-source`.

Backend safety files: `backend/src/modules/trees/trees.service.ts`, `backend/src/modules/trees/trees.controller.ts`, `backend/src/modules/trees/persons.controller.ts`, `backend/src/common/utils/db-file.util.ts`, new `backend/src/modules/backups/`, new backup migrations, and `backend/src/main.ts`.

Frontend admin files: `frontend/src/App.tsx`, `frontend/src/admin/components/AdminSidebar.tsx`, `frontend/src/admin/pages/`, `frontend/src/admin/AdminLayout.tsx`, and shared admin API/theme utilities.

Frontend tree/search files: `frontend/src/admin/components/TreesBuilder.tsx`, its existing tests, `frontend/src/components/` person-card/tree-viewer components, `frontend/src/lib/queryClient.ts`, public search components/pages, and new focused utilities/tests.

Subscription files: `backend/src/modules/subscriptions/`, new payment-settings migration/module endpoints, `frontend/src/pages/payment.tsx`, `frontend/src/pages/subscriptions.tsx`, `frontend/src/admin/pages/SubscriptionPayments.tsx`, and new `PaymentSettings.tsx` pages.

Theme/translation files: each project's `frontend/src/App.css`, theme store/config, admin pages with literal `bg-white`/`dark:bg-*` colors, translation sources, and audit scripts.

### Task 1: Lock down rebuild non-destructiveness and database-backed tree recovery

**Files:**
- Create: both `backend/src/modules/trees/tree-persistence.safety.spec.ts`
- Create: both `backend/src/db/migrations/20260724000000_create_tree_backup_snapshots.js` or the next project-local migration number
- Modify: both `backend/src/main.ts`
- Modify: both `backend/package.json`
- Modify: both `backend/src/modules/trees/trees.service.ts`
- Modify: both `backend/src/common/utils/db-file.util.ts`
- Test: both backend Jest suites and tree smoke scripts

**Interfaces:**
- Produce `TreeBackupSnapshotService.createBeforeDelete(treeId: number, actorId: number): Promise<{ id: number }>`.
- Produce `TreeBackupSnapshotService.restore(snapshotId: number, actorId: number): Promise<{ treeId: number }>`.
- Produce `TreesService.archive(id: number, userId: number, roleId: number): Promise<{ snapshotId: number }>`.
- Existing `TreesService.delete` becomes a compatibility wrapper that calls `archive` and does not hard-delete rows.

- [ ] **Step 1: Write failing tests** for: build scripts containing no migration/reset command; archive creating a snapshot before changing visibility; restore returning tree metadata and people; DB upload fallback working when the disk file is absent; startup not updating existing user-owned rows.
- [ ] **Step 2: Run both backend focused suites and confirm expected failures.** Run `npm test -- --runInBand tree-persistence.safety.spec.ts` in each backend. Expected: missing service/behavior failures, not test-setup errors.
- [ ] **Step 3: Add the snapshot migration** with `tree_backup_snapshots(id, tree_id, actor_id, reason, payload_json, created_at, restored_at, restored_by)` and indexes on `tree_id` and `created_at`. Store the full tree/person/upload-reference payload as JSON; never overwrite an existing snapshot.
- [ ] **Step 4: Implement transactional archive/restore** in a focused backup service. Archive must serialize before marking the tree archived. Restore must create a new active tree when the original ID is unavailable and must be idempotent for an already-restored snapshot.
- [ ] **Step 5: Remove destructive startup behavior.** Keep forward `knex.migrate.latest()` and missing-system-row creation, but remove any startup path that refreshes an existing user password/content from hardcoded defaults. Keep `backend:build` as `nest build` and frontend `build` as `vite build` only.
- [ ] **Step 6: Run tests and persistence smoke checks.** Run `npm test -- --runInBand tree-persistence.safety.spec.ts`, `npm run build`, and `npm run smoke:tree-db` in both backends. Expected: all focused tests pass; builds exit 0; smoke test confirms tree count and GEDCOM text before/after rebuild.
- [ ] **Step 7: Commit** each project’s safety changes separately with `fix: make tree storage rebuild safe`.

### Task 2: Add matching Backup and Payment Settings admin pages and canonical navigation

**Files:**
- Create: both `frontend/src/admin/pages/Backups.tsx`
- Create: both `frontend/src/admin/pages/PaymentSettings.tsx`
- Modify: both `frontend/src/App.tsx`
- Modify: both `frontend/src/admin/components/AdminSidebar.tsx`
- Modify: both `frontend/src/admin/pages/Trees.tsx`
- Create: both `frontend/src/admin/admin-parity.test.ts`

**Interfaces:**
- `GET /api/admin/backups`, `POST /api/admin/backups/:snapshotId/restore`, and `GET /api/admin/backups/:snapshotId/export`.
- `GET /api/admin/payment-settings` and `PUT /api/admin/payment-settings`.
- `ADMIN_NAVIGATION: readonly { to: string; labelKey: string; privilege?: string; role?: number }[]` with the 32-item order from the approved design.

- [ ] **Step 1: Write failing parity tests** that import `ADMIN_NAVIGATION`, assert exact path order, and assert both projects contain `AdminNotes.tsx`, `AdminTasks.tsx`, `Backups.tsx`, and `PaymentSettings.tsx`.
- [ ] **Step 2: Run both frontend tests and confirm failure** because Abraham lacks Notes/Tasks and both projects lack the new pages.
- [ ] **Step 3: Add the missing pages** by following the existing admin page layout/API/error/toast patterns. Backup page must list snapshots, show tree/title/date/actor, export a snapshot, and require confirmation before restore. Payment Settings must edit beneficiary, method, currency, account/reference fields, instructions, and proof requirements.
- [ ] **Step 4: Replace duplicated sidebar ordering** with the canonical manifest while retaining existing privilege and role filtering. Add routes for every manifest entry without removing existing aliases.
- [ ] **Step 5: Run frontend tests, translation audit, and builds** in both projects. Expected: parity tests pass, no missing translation keys, Vite builds exit 0.
- [ ] **Step 6: Commit** separately in each project with `feat: align admin navigation and recovery pages`.

### Task 3: Repair person-card document/audio/image/external actions

**Files:**
- Create: both `frontend/src/components/tree/sourceLinks.ts`
- Create: both `frontend/src/components/tree/sourceLinks.test.ts`
- Modify: both `frontend/src/admin/components/TreesBuilder.tsx`
- Modify: both person-card/modal components discovered by the focused test search
- Modify: both `backend/src/modules/trees/persons.controller.ts` if link metadata is missing from API responses

**Interfaces:**
- `type PersonSourceKind = "document" | "audio" | "image" | "external"`.
- `resolvePersonSource(input: unknown, apiRoot: string): { kind: PersonSourceKind; label: string; url: string; mimeType?: string; recordId?: number } | null`.
- `openPersonSource(source, handlers): void`, where handlers provide document viewer, media viewer, image viewer, and external URL behavior.

- [ ] **Step 1: Write failing unit/component tests** for all four kinds, local upload URL resolution, invalid URL rejection, click propagation, and correct handler dispatch.
- [ ] **Step 2: Run focused Vitest tests and confirm they fail** on the broken modal behavior.
- [ ] **Step 3: Implement the normalizer** using existing GEDCOM extraction and API-root helpers; preserve labels from document/audio/image records and classify external URLs safely.
- [ ] **Step 4: Implement modal action dispatch** so link buttons stop propagation, open the correct viewer/URL, and leave the person card/modal state consistent.
- [ ] **Step 5: Run existing `TreesBuilder.sourceLinks.test.ts`, the new tests, and both frontend builds.** Expected: all source-link tests pass and no type/build errors remain.
- [ ] **Step 6: Commit** in each project with `fix: restore person source link actions`.

### Task 4: Make public and admin search complete and consistent

**Files:**
- Create: both `frontend/src/components/search/searchModel.ts`
- Create: both `frontend/src/components/search/searchModel.test.ts`
- Modify: both `backend/src/modules/search/search.service.ts`
- Modify: both `backend/src/modules/search/search.controller.ts`
- Modify: both `frontend/src/lib/queryClient.ts`
- Modify: both global search/header/admin search components found by search audit
- Modify: both `frontend/src/admin/pages/SubscriptionPayments.tsx` and other admin list pages with local-only filtering

**Interfaces:**
- `SearchResponse = { books: BookResult[]; trees: TreeResult[]; people: PersonResult[]; audios: AudioResult[]; documents: DocumentResult[]; gallery: GalleryResult[]; total: number }`.
- `searchResources(query: string, options?: { scope?: "public" | "admin"; signal?: AbortSignal }): Promise<SearchResponse>`.
- `useDebouncedSearch(query: string, delayMs?: number)` with cancellation and clear semantics.

- [ ] **Step 1: Write failing tests** for whitespace/empty queries, grouped results, visibility filtering, debounced cancellation, clear behavior, and admin search by user email/name/tier/status rather than only IDs.
- [ ] **Step 2: Run focused backend/frontend tests and confirm expected failures.**
- [ ] **Step 3: Extend backend search** with explicit scope authorization, parameterized query handling, stable limits, and resource-group mapping. Return empty groups rather than `undefined`.
- [ ] **Step 4: Add the frontend search model/hook** with debounce, abort, loading/error/empty states, keyboard selection, and theme-aware placeholders.
- [ ] **Step 5: Replace local-only list filtering** where a backend endpoint exists, preserving client filtering only for already-loaded display refinement.
- [ ] **Step 6: Run backend Jest, frontend Vitest, translation audit, and both builds.** Expected: search tests pass and both builds exit 0.
- [ ] **Step 7: Commit** in each project with `fix: complete public and admin search flows`.

### Task 5: Complete payment settings and subscription approval transaction

**Files:**
- Create: both backend payment-settings migration/module files if not already covered by an existing settings module
- Modify: both `backend/src/modules/subscriptions/subscriptions.controller.ts`
- Modify: both `backend/src/modules/subscriptions/subscriptions.service.ts`
- Modify: both `backend/src/modules/subscriptions/dto/subscription.dto.ts`
- Modify: both `frontend/src/pages/payment.tsx`
- Modify: both `frontend/src/admin/pages/SubscriptionPayments.tsx`
- Modify: both `frontend/src/admin/pages/Subscriptions.tsx`
- Create: both backend subscription transaction specs and frontend payment component tests

**Interfaces:**
- `SubscriptionsService.getPaymentSettings(): Promise<PaymentSettings>`.
- `SubscriptionsService.updatePaymentSettings(input: UpdatePaymentSettingsDto, actorId: number): Promise<PaymentSettings>`.
- `SubscriptionsService.reviewPayment(id: number, decision: "approved" | "rejected", reviewerId: number, reason?: string): Promise<PaymentReviewResult>`.

- [ ] **Step 1: Write failing tests** for settings CRUD authorization, payment proof validation, duplicate approval idempotency, rejected payment behavior, and approval updating the active subscription in one transaction.
- [ ] **Step 2: Run backend/frontend focused tests and confirm failures** for hardcoded payment details and incomplete approval behavior.
- [ ] **Step 3: Add the payment-settings table/API** and seed one non-secret default row only when missing. Do not expose provider credentials.
- [ ] **Step 4: Implement transactional review** with a locked payment row, status guard, subscription upsert/update, reviewer metadata, and audit log. A second approval returns the existing approved result without a second subscription.
- [ ] **Step 5: Update the user payment page** to load settings, render all configured methods/fields, require proof when configured, and show localized success/error states.
- [ ] **Step 6: Update the admin payment page** to search by user/tier/status, preview proofs safely, require a rejection reason, and refresh the user-visible status after review.
- [ ] **Step 7: Run focused tests, migrations on isolated databases, both builds, and subscription smoke flow.** Expected: pending → approved creates active subscription; pending → rejected does not.
- [ ] **Step 8: Commit** in each project with `feat: complete payment settings and subscription approvals`.

### Task 6: Fix light/dark semantic colors and translation completeness

**Files:**
- Modify: both `frontend/src/App.css`
- Modify: both theme stores/config files
- Modify: both admin pages and subscription/tier components containing literal conflicting foreground/background classes
- Modify: both translation sources and generated/fallback translation files
- Create: both `frontend/src/theme/themeTokens.test.ts`

**Interfaces:**
- `ThemeTokens = { page: string; panel: string; elevated: string; text: string; muted: string; border: string; input: string; placeholder: string; focus: string; primary: string; accent: string; success: string; warning: string; danger: string }`.
- `getThemeTokens(theme: "light" | "dark"): ThemeTokens`.

- [ ] **Step 1: Write failing token/component tests** for premium tier title contrast, search placeholder contrast, input/div surface alignment, and admin/public light/dark token completeness.
- [ ] **Step 2: Run focused tests and translation audits to capture failures.**
- [ ] **Step 3: Define semantic tokens** per product without replacing product-specific brand colors. Use tokens for tier foreground/background and all shared controls.
- [ ] **Step 4: Replace conflicting literal classes** in payment, subscriptions, tier admin, search, forms, tables, modals, and admin shell components.
- [ ] **Step 5: Add all missing translation keys** to the source/fallback/generated files and replace new hardcoded user-facing text.
- [ ] **Step 6: Run theme tests, translation audits, lint, and both frontend builds.** Expected: no missing keys, no lint errors introduced, and both builds exit 0.
- [ ] **Step 7: Commit** in each project with `fix: align theme tokens and translations`.

### Task 7: Browser verification and final parity audit

**Files:**
- Create: both project-local browser smoke test/config files where absent
- Modify: `scripts/find-parity.cjs` or create a two-project parity runner outside application runtime
- Modify: both project README/deployment docs with the non-destructive build/deploy contract

- [ ] **Step 1: Add smoke scenarios** for login, admin navigation order, tree create/edit/archive/restore, each person-link kind, public/admin search, payment settings, proof submission, and admin approval.
- [ ] **Step 2: Start isolated frontend/backend instances** for each product using test databases and non-production upload directories.
- [ ] **Step 3: Run browser tests** with the available Playwright/webapp testing setup and collect screenshots for light/dark admin, payment, tier, and person-card states.
- [ ] **Step 4: Run both project audits:** frontend/backend builds, backend Jest, frontend Vitest, lint, translation audit, route audit, parity audit, and tree persistence smoke test.
- [ ] **Step 5: Verify the final Git diffs** only include intended application/docs/test changes and preserve unrelated pre-existing worktree changes.
- [ ] **Step 6: Commit documentation and test harness changes** in each project with `test: verify cross-site parity and rebuild safety`.

## Self-review checklist

- Spec coverage: rebuild safety is Task 1; admin parity and new pages are Task 2; person links are Task 3; search is Task 4; payment settings/approval is Task 5; colors/translations are Task 6; full verification is Task 7.
- Placeholder scan: this plan contains no `TBD`, `TODO`, `FIXME`, or deferred implementation item.
- Type consistency: snapshot, archive, restore, search, payment-settings, review-payment, source-link, and theme-token interfaces are defined before downstream tasks use them.
- Data-safety requirement: no task permits hard delete from normal UI; every delete snapshots first and restore is tested.
- Isolation requirement: every task is applied independently to Egypt and Abraham; no shared runtime/database is introduced.

