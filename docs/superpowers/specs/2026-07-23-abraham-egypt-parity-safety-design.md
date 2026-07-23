# Abraham Roots and Egypt Roots parity, safety, and operations design

## Scope

Apply equivalent behavior to the two existing, independently deployed products:

- Egypt Roots: `C:/Users/kecir/OneDrive/Desktop/RootsEgypt-full-SourceCode`
- Abraham Roots: `C:/Users/kecir/OneDrive/Desktop/RootsAbraham/AbrahamRoots-full-code-source`

Each product keeps its own frontend, backend, database, translations, branding, assets, and color identity. The parity target is behavior, page names, admin-page order, data contracts, and safety guarantees—not a shared runtime or merged database.

## Goals and acceptance criteria

1. Both products expose the same public page set and the same ordered admin page set. Missing pages are added without removing existing pages.
2. A frontend or backend build never deletes, recreates, truncates, or replaces user data. Database migrations are forward-only in deployment; destructive rollback is not part of startup.
3. A tree deleted from the UI is recoverable by an administrator. A pre-delete snapshot includes tree metadata, GEDCOM text, people, linked source metadata, and database-stored upload payloads.
4. Tree data and uploads remain recoverable when a deployment replaces the application container or upload directory. The database is the source of truth; disk is an optional cache.
5. Person-card links consistently support document, audio, image, and external URL targets. Each action opens the correct viewer/download/external destination and works for both public and admin tree views.
6. Public and admin search bars perform real, debounced searches across their intended resources, preserve empty/error/loading states, and use the same contract in both products.
7. Light and dark mode use each product's own semantic design tokens for surfaces, text, borders, controls, placeholders, focus rings, badges, and tier cards. No premium tier title may become invisible against its card background.
8. Administrators can edit payment instructions and required payment fields. The user payment page reads those settings from the backend.
9. A user can submit a subscription request with payment proof. An administrator can approve or reject it. Approval updates the user's subscription atomically, records reviewer/audit data, and is visible to the user.
10. All new UI text has translation keys in every supported locale; translation audits report no missing keys or accidental hardcoded user-facing strings.

## Architecture

### Project isolation and parity

The projects remain separate deployments and databases. Each receives the same route/page contract and equivalent implementations adapted to its existing design system. A parity manifest and verification script compare admin page names, paths, order, and required backend endpoints without coupling runtime data.

The canonical admin order is:

1. Dashboard
2. Trees
3. Gallery
4. Books
5. Audios
6. Documents
7. Articles
8. Suggestions
9. Newsletter
10. Contact Messages
11. Users
12. Validation Approvals
13. Download Requests
14. Hero Images
15. Background Images
16. Approvals
17. Password Reset Requests
18. Account Deletion Requests
19. Role Distribution
20. Admins
21. Activity
22. Notes
23. Tasks
24. Settings
25. Footer Settings
26. Legal Content
27. Subscriptions
28. Tier Features
29. Subscription Payments
30. Payment Settings
31. Backups
32. User Upgrade

Role/privilege filtering may hide a page from a particular user, but it must not change the canonical order or remove the route from the application.

### Data safety and backups

The backend will add explicit backup/snapshot services and tables. Tree deletion is implemented as an auditable archive operation with a confirmation step. A snapshot is created in the same database transaction before the tree is marked deleted. Restore rehydrates the tree and people and preserves original metadata. Permanent purge is excluded from normal UI flows.

Startup performs only idempotent schema checks, forward migrations, and non-destructive seed creation for missing system records. It must never refresh existing user passwords or mutate existing user-owned content from hardcoded seed data. Build commands remain compile-only.

Database-stored GEDCOM text and file payloads are required for recovery. Upload serving first checks the filesystem and falls back to the database payload. Backup exports provide an administrator-downloadable JSON/ZIP-compatible package and a restore workflow with validation and an audit entry.

### Person-card source links

Introduce a normalized source-link resolver shared by tree viewers and editors. Every link has a stable kind (`document`, `audio`, `image`, `external`), label, URL, optional MIME type, and optional record ID. Local upload paths are resolved against the product's API root. The modal owns action dispatch and stops card click propagation, so opening a link cannot accidentally select or close the person card.

### Search

Define a consistent search response with resource groups, pagination/limits, and safe empty results. Public search respects visibility and ownership. Admin search may search all authorized records. Frontend search inputs share debounce, cancellation, loading, empty, error, clear, keyboard, and theme behavior. Admin pages use backend query parameters instead of filtering only the currently loaded page where the endpoint supports it.

### Subscriptions and payment settings

Add a per-product payment-settings record containing enabled methods, beneficiary name, account/IBAN/reference fields, currency, instructions, and proof requirements. Secrets and payment-provider credentials are never exposed to the frontend.

Payment submission validates tier, amount, proof type/size, and authenticated ownership. Review runs in a transaction with row locking/idempotency: one payment cannot be approved twice, and approval creates or updates exactly one active subscription. Rejection records a reason. Both user and admin views show the same status and audit timeline.

### Design and translations

Keep each site's existing visual identity and assets, but replace conflicting literal colors with semantic variables: page background, panel, elevated surface, text, muted text, border, input, placeholder, focus, primary, accent, success, warning, danger, and tier-specific foreground/background. Add component-level dark/light regression checks for cards, tables, forms, search bars, modals, and admin shells.

## Error handling and observability

- Return localized, user-safe messages for failed uploads, searches, restores, and payment reviews.
- Log migration, backup, restore, delete, payment submission, approval, and rejection events with product-local user/admin IDs.
- Reject malformed links, invalid restore packages, duplicate approvals, and unauthorized tree access without partial writes.
- Keep the original data when a rebuild/deployment loses the filesystem; report missing database payloads as an explicit recovery error rather than silently returning empty data.

## Verification plan

For each project:

- unit tests for link normalization, tree delete/restore, backup serialization, payment approval idempotency, search normalization, and theme token mappings;
- backend migration and persistence tests against an isolated test database;
- frontend component tests for person-card actions, search states, payment settings, subscription submission, and light/dark contrast-sensitive classes;
- translation audit and admin parity audit;
- frontend and backend production builds;
- browser smoke tests covering login, admin navigation order, tree create/edit/delete/restore, each person-link type, search, payment proof submission, and approval-to-active-subscription flow.

Implementation will be staged: safety/persistence first, parity and missing pages second, person links/search third, subscriptions/payment settings fourth, then theme/translation cleanup and full verification. Existing unrelated worktree changes will be preserved.
