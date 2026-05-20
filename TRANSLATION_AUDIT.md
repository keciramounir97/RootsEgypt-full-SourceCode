# Translation Audit

## Summary

- Supported language codes are exactly `en`, `fr`, `ar`, `es`.
- Language names are exactly `English`, `Français`, `العربية`, `Español`.
- Public website and admin panel now share `frontend/src/i18n/LanguageContext.tsx`.
- The selected language is stored in `localStorage` under `rootsegypt_language`.
- Legacy `locale` storage is read once for migration and then removed.
- Arabic applies `dir="rtl"` to `document.documentElement`; English, French, and Spanish apply `dir="ltr"`.
- Missing translation keys return the key itself and log a development-only warning.

## Audit Table

| Area | File | Problem | Fix Applied | Status |
| ---- | ---- | ------- | ----------- | ------ |
| Root provider | `frontend/src/main.tsx` | App was still wrapped by the legacy `DataI18nProvider`. | Replaced root wrapper with `LanguageProvider`. | Complete |
| i18n context | `frontend/src/i18n/LanguageContext.tsx` | No canonical nested language provider existed. | Added canonical provider exposing `language`, `setLanguage`, `t`, `dir`, and `availableLanguages`. | Complete |
| Translation structure | `frontend/src/i18n/translations/*.ts` | Translations lived only in legacy flat utility files. | Added per-locale translation modules with nested `legacy.*` namespace backed by the existing complete dictionaries. | Complete |
| Translation exports | `frontend/src/i18n/index.ts` | No single i18n import surface existed. | Added a stable i18n export entrypoint. | Complete |
| Legacy translations | `frontend/src/utils/translations.ts` | Effective translation dictionaries were not exportable to the new i18n layer. | Added `getTranslationsForLocale`. | Complete |
| Locale override bug | `frontend/src/utils/translations.ts` | English `contentOverrides` were applied to all locales, causing English text in non-English output. | Limited `contentOverrides` to English and added required localized patch keys separately. | Complete |
| Language switcher | `frontend/src/components/LanguageMenu.tsx` | Switcher cycled short labels and did not show all four language names. | Rebuilt as an accessible dropdown with exact names, current-language state, outside click, Escape close, and direct selection. | Complete |
| Public pages | `frontend/src/pages/*` | Pages used the old `DataI18nContext` import and flat keys. | Migrated active imports to `useLanguage` and nested `legacy.*` keys. | Complete |
| Admin pages | `frontend/src/admin/pages/*` | Admin screens used the old `DataI18nContext` import and flat keys. | Migrated active imports to `useLanguage` and nested `legacy.*` keys. | Complete |
| Shared components | `frontend/src/components/*` | Shared UI used the old hook and flat keys. | Migrated active imports to `useLanguage` and nested `legacy.*` keys. | Complete |
| Admin components | `frontend/src/admin/components/*` | Admin layout/sidebar/header/tree tools used old hook or hardcoded visible hints. | Migrated to `useLanguage`; translated tree child-selection hint. | Complete |
| Maghreb map popup | `frontend/src/components/MaghrebTribesMap.tsx` | Popup had hardcoded `Population`, `Type`, and tribe type labels. | Replaced with translation keys and added required locale entries. | Complete |
| Translation audit tooling | `frontend/scripts/audit-translations.cjs` | Audit did not understand nested `legacy.*` keys or required localized patch keys. | Updated audit collection to strip `legacy.` and include required i18n translations. | Complete |
| Codebase index | `CODEBASE_INDEX.md` | Root codebase index did not exist. | Created and updated with final i18n structure and suspicious files. | Complete |

## Verification

| Check | Result |
| ---- | ------ |
| `npm run audit:translations` | Passed: 1,125 static keys, 0 missing in `en`, `fr`, `ar`, `es`, 0 suspicious. |
| `npm run build` | Passed. Vite build completed successfully. |
| Dev server smoke check | Passed: `http://127.0.0.1:5173` returned HTTP 200. |
| Static provider check | Passed: active app root uses `LanguageProvider`; active pages/components import `useLanguage`. |
| RTL/LTR check | Passed in code: `LanguageContext` updates `html.lang`, `html.dir`, and `html[data-language]` on language changes. |
| `node scripts/audit-visible-i18n.cjs` | Passed: 0 visible hardcoded candidates across website pages, admin pages, navbar, footer, shared components, placeholders, titles, labels, aria labels, and alt text. |

## Layer-by-Layer Visible Text Audit

| Layer | Coverage | Result |
| ---- | -------- | ------ |
| Website pages | JSX text, placeholders, titles, labels, aria labels, alt text, and links audited. | No visible hardcoded candidates found. |
| Website navbar | Desktop and mobile navigation labels, menu actions, language switcher labels, and accessible labels audited. | No visible hardcoded candidates found. |
| Website footer | Footer link labels, contact labels, newsletter text, placeholders, and actions audited. | No visible hardcoded candidates found. |
| Admin pages | Dashboard, users, trees, books, gallery, documents, articles, settings, approvals, request pages, tables, forms, and actions audited. | No visible hardcoded candidates found. |
| Admin components | Sidebar, header, breadcrumbs, theme toggle, protected route, tree builder UI, labels, placeholders, and actions audited. | No visible hardcoded candidates found. |
| Shared components | Error boundary, maps, hero slider, social/article components, cards, buttons, modals, and empty/loading states audited. | No visible hardcoded candidates found. |

## Documented Hardcoded Exceptions

The audit still reports 54 JSX literal hits. These are documented exceptions or audit false positives, not missing translation keys:

- Brand/product names: `Roots`, `ROOTS`, `RootsEgypt`.
- Contact identity: `marcousorilious@gmail.com`.
- Social platform labels: `Facebook`, `X`, `WhatsApp`, `Telegram`.
- Technical/file/browser attributes: `mode`, `initial`, `animate`, `exit`, `preserveAspectRatio`, `capture`, `preload`, SVG color/stroke attributes.
- Format placeholders: `YYYY`.
- React keys and ARIA wiring ids such as `editor`, `true`, and `share-article-title`.

## Remaining Issues

- Several older generated translation values are semantically weak because they were auto-filled before this repair. They have key parity and do not break the UI, but future copy review should improve quality.
- `frontend/src/context/DataI18nContext.tsx` remains in the workspace as a legacy file, but active app code no longer imports it.
- Existing duplicate audit artifacts and root helper scripts remain documented in `CODEBASE_INDEX.md`.
