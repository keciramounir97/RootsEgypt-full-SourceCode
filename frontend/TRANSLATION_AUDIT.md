# Translation Audit Checklist

## Summary
- **Locales:** EN, FR, AR, ES (all keys present in all four).
- **Fallback:** Missing keys fall back to English, then to the `t(key, fallback)` fallback string.
- **RTL:** Arabic uses `dir="rtl"` via `TranslationContext`.

## Keys Added in This Audit (all 4 locales)

### Auth & Reset
- `back_to`, `send_code`, `code_required`, `code_placeholder`, `verify_and_reset`, `reset_step1_desc`, `reset_step2_desc`, `new_password`, `verification_code`, `reset_email_failed`, `invalid_code_or_password`, `email_placeholder_example`, `password_placeholder_mask`

### Dashboard & Activity
- `activity_desc`, `search_activity`, `all_types`, `security`, `events_count`, `admin_required`, `no_activity_found`, `no_activity_yet`, `stats_latest_actions`, `my_dashboard_subtitle`, `total_users`, `total_books`, `family_trees`, `total_people`, `admin_overview`, `my_dashboard`, `recent_activity`, `dashboard_load_failed`, `check_api_endpoints`, `activity_load_failed`

### Users Admin & Trees
- `add_user`, `search_users`, `edit`, `delete`, `create_user`, `edit_user`, `save`, `active`, `disabled`, `creating`, `role`, `status`, `user`, `full_name_required`, `signup_desc`, `users_page_desc`, `admin_only`, `add_user_hint`, `add_user_email_hint`, `owner`, `download_failed`

### Contact & Research
- `contact_hero_para`, `call_us`, `visit_us`, `opening_hours`, `location_opening_soon`, `our_location`, `stay_tuned`, `books_and_documents`, `people_label`, `suggested_public_trees`, `research_categories`, `welcome_back_prefix`, `research_center_title`, `viewing_mode_read_only`, `explore_public_tree_desc`, `research_guides_title`, `tree_label`, `no_description_provided`, `message_sent_success`, `message_send_failed`, `email_placeholder_example`

### Admin UI
- `live_site`, `close_sidebar`, `open_sidebar`, `suggestions_load_failed`

## Verification
- **Build:** `npm run build` succeeds.
- **Linter:** No errors in modified files.
- **ActivityLog:** Events count uses `${rows.length} ${t("events_count", "event(s)")}` so the number is correct in all locales.

## Language Selector
- **Public & Admin:** Single button (no dropdown) that cycles EN → FR → AR → ES. Uses `LanguageMenu` with `t("language")` and `t("click_to_cycle")`.

## Files Touched
- `src/utils/translations.ts` – added missing keys in en, fr, ar, es; added `owner` in all locales
- `src/pages/contactUs.tsx` – hero, contact/location, success/error messages, placeholders use `t()`
- `src/pages/Research.tsx` – research center title, viewing mode, descriptions, Owner/Public, tree_label, no_description_provided use `t()`
- `src/pages/resetpassword.tsx` – error messages and placeholders use `t()`
- `src/admin/components/AdminHeader.tsx` – welcome, sidebar labels, Loading, Live Site, suggestions error use `t()`
- `src/admin/components/AdminSidebar.tsx` – close/open sidebar aria-label and title use `t()`
- `src/admin/pages/ActivityLog.tsx` – events count and load error use `t()`
- `src/admin/pages/Dashboard.tsx` – load error and “Check API endpoints” use `t()`
- `src/admin/pages/Users.tsx` – page desc, admin_only, add_user_hint, add_user_email_hint, email placeholder use `t()`
