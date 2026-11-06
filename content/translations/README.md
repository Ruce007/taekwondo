# Translations

English is the reference language. A translation is a page in another language that
mirrors an English page.

## Adding a translated page

1. Find the English page, for example `content/articles/etymology.md`.
2. Create the same file name under the language folder:
   `content/translations/ko/articles/etymology.md` (Korean), `.../es/...` (Spanish), and so on.
3. Write the front matter (`title`, `summary`, `updated`, `status`) and the body in that language.
   Keep the same sections, the same sources and the same `[^n]` citations as the English page.
   Optional: `translator: Name or "reviewed by ..."`.
4. Run `npm run build`. The page appears at `/ko/wiki/etymology/`, gets a language menu in the
   footer, links to the English version, and is added to the sitemap with hreflang tags.

Languages: `en`, `ko`, `es`, `zh-Hans`, `zh-Hant`, `ja`, `de`, `fa` (right-to-left), `pt`, `tr`.
To add another language, add it in `src/i18n/locales.mjs` and `src/i18n/ui.mjs`.

Schools are not translated (they are listed once, in their own language). Menus and labels come
from `src/i18n/ui.mjs`; a missing label falls back to English.
