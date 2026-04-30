# Translation Keys Audit Checklist

This document confirms that translation keys used across the app are defined in `src/utils/translations.ts` for **en**, **fr**, **ar**, and **es**.

---

## Summary

- **Locales:** EN (default), FR, AR, ES  
- **Translation file:** `frontend/src/utils/translations.ts`  
- **Usage pattern:** `t("key", "Fallback text")` — fallback is used when the key is missing for the current locale; missing keys in a locale fall back to EN, then to the inline fallback.

---

## Checklist: Keys Present in All Four Locales

### 1. Public pages

| Page / Component | Keys used | In EN | In FR | In AR | In ES |
|------------------|-----------|-------|-------|-------|-------|
| **SourcesAndArchives** | sources_and_archives, sources_archives_title, sources_archives_intro, official_archives_title, official_archives_intro, visit_website, country_* (5), official_archive_* (5), archive_types, archive_types_desc, archives_* (all section keys), primary_sources, primary_sources_desc, secondary_sources, secondary_sources_desc, access_guidelines, access_guidelines_desc, reliability_checks, reliability_checks_desc, archives_access, archives_access_desc | ✅ | ✅ | ✅ | ✅ |
| **Periods** | periods_hero_*, periods_ottoman_*, periods_transition_*, periods_colonial_*, periods_independence_*, periods_timeline_*, periods_highlight_*, periods_by_country_title, periods_by_country_intro, country_* (5), periods_dz_*, periods_ma_*, periods_tn_*, periods_ly_*, periods_mr_* | ✅ | ✅ | ✅ | ✅ |
| **Gallery** | gallery, gallery_title, search_gallery, all_content, trees, images, books, all_trees, with_gedcom, latest_*, no_*_found, loading, archive_source, document_code, not_provided, view_tree, download_gedcom, viewing_mode, close, downloads_label, download | ✅ | ✅ | ✅ | ✅ |
| **Library** | library, library_title, library_search, search_library, all_content, all_trees, all_categories, all_locations, all_years, latest_*, no_*, explore_by_category, library_category_*, archive_source, document_code, not_provided, view_tree, download_gedcom, has_file, no_file, view, file_label, downloads_label, open | ✅ | ✅ | ✅ | ✅ |
| **ContactUs** | contact_us, send_us_message, full_name, full_name_placeholder, email, your_message, message_placeholder, send_message | ✅ | ✅ | ✅ | ✅ |
| **Home** | home_hero_title, start_exploring, see_more, archives_and_sources, archive_source, etc. | ✅ | ✅ | ✅ | ✅ |
| **Login** | welcome_back, email, password, please_wait, login, forgot_password, create_account, invalid_email, password_required | ✅ | ✅ | ✅ | ✅ |
| **Research** | search_research_materials, tree_builder_error, tree_builder_try_again, retry | ✅ | ✅ | ✅ | ✅ |
| **genealogy-gallery** | genealogy_gallery, genealogy_gallery_title, search_gallery, search_trees, all_trees, with_gedcom, latest_tree, unknown, no_description, no_trees_found, trees_unavailable, trees, public, private, archive_source, document_code, not_provided, has_file, no_file, view_tree, download_gedcom, viewing_mode, close, loading | ✅ | ✅ | ✅ | ✅ |

### 2. Layout & shared components

| Component | Keys used | In EN | In FR | In AR | In ES |
|-----------|-----------|-------|-------|-------|-------|
| **Navbar** | home, gallery, periods, sources_and_archives, library, contact, menu, admin, dashboard, search, loading, no_results, trees, logout, login, settings, dark_mode, light_mode | ✅ | ✅ | ✅ | ✅ |
| **Footer** | home, gallery, periods, sources_and_archives, links, resources, contact, newsletter, email, subscribe, subscribing, newsletter_email_required, newsletter_failed | ✅ | ✅ | ✅ | ✅ |
| **LanguageMenu** | language | ✅ | ✅ | ✅ | ✅ |
| **Breadcrumb (admin)** | home | ✅ | ✅ | ✅ | ✅ |

### 3. Admin panel

| Page / Component | Keys used | In EN | In FR | In AR | In ES |
|------------------|-----------|-------|-------|-------|-------|
| **TreesBuilder** | unknown, parent_relationship, parents_connected, parent_to_child, descendant_relationship, parent_children, parent_descendant, gender, born, birth_place, died, death_place, profession, spouse, father, mother, archive_source, tree_render_failed, file_too_large, gedcom_empty, gedcom_no_people, gedcom_imported, import_gedcom_failed, name_required, parents_conflict, person_not_found, gedcom_build_failed, zoom_in, zoom_out, center, import_gedcom, export_gedcom, tree_empty, tree_builder_read_only, person_updated, person_added, person_deleted, archive_source_placeholder | ✅ | ✅ | ✅ | ✅ |
| **Trees (admin)** | archive_source, optional, etc. | ✅ | ✅ | ✅ | ✅ |
| **AdminHeader** | search_placeholder | ✅ | ✅ | ✅ | ✅ |

### 4. Lists verified (no missing keys)

- **Official archives section:** All labels (official_archives_title, official_archives_intro, official_archives_quick_jump, visit_official_site, visit_website, country_*, official_archive_*, **archive_desc_***) are present in en, fr, ar, es. Countries: Algeria, Morocco, Tunisia, Libya, Mauritania, Western Sahara. Each archive has a translated description (archive_desc_algeria, archive_desc_morocco, etc.).
- **Periods by country:** All period labels and **descriptions** per country are present in en, fr, ar, es: periods_dz_*, periods_ma_*, periods_tn_*, periods_ly_*, periods_mr_*, periods_ws_* (labels + *_desc). Country intros: periods_country_intro_dz, _ma, _tn, _ly, _mr, _ws. periods_click_to_expand for accordion hint.
- **Archive types / Sources / Access / Reliability:** All section keys and bullets are present in all four locales.
- **Gallery / Library filters and labels:** All keys used in dropdowns and cards are present in all four locales.
- **Auth (login/signup/contact):** All form labels and messages are present in all four locales.
- **Tree builder (admin):** All tooltips, buttons, and messages are present in all four locales.

---

## Verification method

1. **Keys in code:** All `t("key", …)` usages in `frontend/src` (pages, components, admin) were collected.
2. **Keys in translations:** All keys in the `en` block of `translations.ts` were treated as the master set.
3. **Sync:** The same set of keys was added to `fr`, `ar`, and `es` with appropriate translations (and filled where they were missing).
4. **New content:** Keys for “Official Archives of North Africa” and “Periods by North African Country” were added in en, then translated into fr, ar, and es.

---

## Result

- **Every list and section** that uses `t(...)` now has the corresponding key defined in **en**, **fr**, **ar**, and **es**.
- **No missing translation keys** remain for the pages and components audited above; any key missing in a locale falls back to EN, then to the inline fallback.

---

## How to re-check in the future

1. Search for `t("` in `frontend/src` and collect the first argument of each `t("key", ...)`.
2. For each key, confirm it exists in all four locale blocks in `frontend/src/utils/translations.ts`.
3. Add any new keys to all four locales (en, fr, ar, es) to keep the checklist valid.

---

---

## Interactive enhancements (Periods & Sources & Archives)

- **Periods by country:** Accordion per country; click to expand/collapse. Each country has an intro line and each period has a short description (all translated). Timeline-style layout with calendar icons when expanded.
- **Official archives:** Quick-jump links to each country card; each card shows archive name + short “what you’ll find” description; prominent “Visit official site” button; hover/focus states on cards; section id `#official-archives` and per-country ids for deep links.
- **Archive types / Primary & secondary sources:** Hover border and shadow on cards for a more interactive feel.

---

*Last audit: after adding Official Archives section, Periods by Country section, Western Sahara, interactive accordions and archive descriptions, and filling all missing keys in fr, ar, es (including TreesBuilder and shared components). All new keys (periods_click_to_expand, periods_country_intro_*, periods_*_desc, official_archives_quick_jump, visit_official_site, archive_desc_*) verified in en, fr, ar, es.*
