# Roots Egypt Codebase Index

## Folder Structure

```txt
.
├── backend/                     NestJS API, database, uploads, deployment scripts
│   ├── src/
│   │   ├── common/              Shared decorators, filters, interceptors, mailer, utilities
│   │   ├── db/                  Knex config, migrations, seeds, database module
│   │   ├── models/              Objection/Knex data models
│   │   ├── modules/             API feature modules
│   │   └── types/               Shared TypeScript declarations
│   ├── scripts/                 Backend maintenance and smoke-test scripts
│   ├── uploads/                 Runtime uploaded media/files
│   └── private_uploads/         Non-public uploaded books/trees
├── frontend/                    Vite React public website and admin panel
│   ├── public/                  Static assets served by Vite/Nginx
│   ├── scripts/                 Frontend audit tooling
│   └── src/
│       ├── admin/               Admin layout, pages, admin-only components/utilities
│       ├── api/                 Axios client and API helpers
│       ├── assets/              Imported image assets
│       ├── components/          Shared public UI, motion, article, social components
│       ├── config/              Brand config
│       ├── constants/           Static constants
│       ├── content/             Curated local content data
│       ├── context/             App providers
│       ├── hooks/               Data fetching hooks
│       ├── i18n/                Canonical language provider and translations
│       ├── lib/                 Query client and mock storage helpers
│       ├── pages/               Public route pages
│       ├── store/               Zustand stores
│       └── utils/               Legacy translation/data utilities
└── scripts/                     Root-level translation audit/fill helper scripts
```

Excluded from this index: `node_modules`, `dist`, generated build maps, and large runtime upload contents except where noted.

## Important Files

| File | Purpose |
| --- | --- |
| `frontend/src/main.tsx` | React entrypoint and root provider composition. |
| `frontend/src/App.tsx` | Public/admin route definitions and route-level loading states. |
| `frontend/src/components/Navbar.tsx` | Public website header, search, resources menu, language entrypoint. |
| `frontend/src/components/Footer.tsx` | Public footer and contact/navigation links. |
| `frontend/src/components/LanguageMenu.tsx` | Accessible dropdown language switch UI. |
| `frontend/src/i18n/LanguageContext.tsx` | Canonical language provider, persistence, fallback, and document direction handling. |
| `frontend/src/i18n/translations/*.ts` | Canonical per-locale translation entrypoints. |
| `frontend/src/utils/translations.ts` | Legacy flat translation registry now used as the source dictionary for the nested `legacy.*` namespace. |
| `frontend/src/utils/generatedTranslations.ts` | Generated locale entries used by the legacy translation registry. |
| `frontend/scripts/audit-translations.cjs` | Frontend translation key and hardcoded JSX audit. |
| `backend/src/main.ts` | NestJS bootstrap. |
| `backend/src/app.module.ts` | Backend root module wiring feature modules. |
| `backend/src/db/migrations/` | Database schema migrations. |

## Website Pages

`frontend/src/pages/` contains public routes:

- `home.tsx` (`/`)
- `Gallery.tsx` (`/gallery`)
- `GalleryTrees.tsx` (`/gallery/trees`)
- `GalleryImages.tsx` (`/gallery/images`)
- `GalleryAudios.tsx` (`/gallery/audios`)
- `GalleryDocuments.tsx` (`/gallery/documents`)
- `GalleryBooks.tsx` (`/gallery/books`, `/library`)
- `GalleryArticles.tsx` (`/gallery/articles`)
- `genealogy-gallery.tsx` (`/genealogy-gallery`)
- `audio.tsx` (`/audio`)
- `articles.tsx` (`/articles`)
- `periods.tsx` (`/periods`)
- `SourcesAndArchives.tsx` (`/sources-and-periods`, `/sources`, `/archives`, aliases)
- `Research.tsx` (`/research`)
- `contactUs.tsx` (`/contact`)
- `login.tsx` (`/login`)
- `signup.tsx` (`/signup`)
- `resetpassword.tsx` (`/resetpassword`)
- `error.tsx` (`*`)

## Admin Pages

`frontend/src/admin/pages/` contains admin routes:

- Dashboard, Trees, Gallery, Books, Audios, Documents, Articles
- Suggestions, NewsletterSubscribers, ContactMessages
- Users, Settings, ActivityLog
- FooterSettings, HeroImages, BackgroundImages
- ValidationApprovals, UserApprovals, SuperAdminApprovals
- PasswordResetRequests, AccountDeletionRequests, RoleDistribution
- AdminManagement

## Components

Shared components include:

- Layout/navigation: `Navbar`, `Footer`, `LanguageMenu`, `RootsPageShell`, `Toast`, `ErrorBoundary`
- Visual/interactive: `HeroSlider`, `EgyptMap`, `MaghrebTribesMap`, `EgyptianLogoMark`
- Articles/social: `ArticlePostCard`, `CreatePostCard`, `ShareArticleModal`, `CommentSection`, `LikeButton`, `ShareButton`
- Motion primitives under `frontend/src/components/motion/`

Admin components include:

- `AdminLayout`, `AdminHeader`, `AdminSidebar`, `Breadcrumb`, `ThemeToggle`, `protectedRoute`, `TreesBuilder`, `AuthContext`

## Context Providers

- `GlobalContext` - site-wide global state.
- `LanguageContext` - active canonical language/i18n provider.
- `DataI18nContext` - legacy language provider kept in the workspace but no longer used by active app imports.
- `NotificationContext` - notification state used by navbar.
- `FavoritesContext` - saved/favorite item state.
- `AuthContext` - admin/auth session and permission state.

## Translation Files

Translation-related files after repair:

- `frontend/src/i18n/LanguageContext.tsx`
- `frontend/src/i18n/translations/en.ts`
- `frontend/src/i18n/translations/fr.ts`
- `frontend/src/i18n/translations/ar.ts`
- `frontend/src/i18n/translations/es.ts`
- `frontend/src/i18n/index.ts`
- `frontend/src/context/DataI18nContext.tsx`
- `frontend/src/context/TranslationContext.tsx` (deleted in current worktree, legacy path)
- `frontend/src/utils/translations.ts`
- `frontend/src/utils/generatedTranslations.ts`
- `frontend/src/utils/englishGeneratedTranslations.ts`
- `frontend/src/utils/backendMessages.ts`
- `frontend/scripts/audit-translations.cjs`
- Root helper scripts in `scripts/`

## Suspicious Or Duplicated Items

- Translation audit tooling exists both at `frontend/scripts/audit-translations.cjs` and root `scripts/audit-translations.cjs`.
- Existing audit artifacts exist at `frontend/TRANSLATION_AUDIT*.md`, `translation-audit.json`, `translation-audit-report.md`, and `hardcoded-candidates.json`.
- Root `index.html` is large and separate from `frontend/index.html`; verify whether it is a generated/exported artifact before relying on it.
- Backend `dist/` and `node_modules/` are present in the repo workspace and should not be treated as source of truth.
- `frontend/photos/RootsEgypt-full-SourceCode.code-workspace` and `backend/src/modules/stats/RootsEgypt-full-SourceCode.code-workspace` look misplaced.
