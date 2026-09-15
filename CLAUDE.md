- Don't use inline styles.
- Follow the existing code style.
- Localize all user-facing strings in en.json (i18n).
- Don't add any item in i18n files except en.json.
- Never run the translator (vh_translator); it is run at publish time.
- Let global error handler handle errors (vhApp.processError).
- Do not use [id].vue filename for dynamic routes and customize route param name instead.
- Do not update the VpnHood.Client.Api.ts file manually, it is auto-generated from the API project.
- Assets loaded by name at run time are authored in `src/assets` (plus `src/locales`, `src/content`),
  copied verbatim into the bundle's `assets` folder and shared with the app's native (Avalonia) UI,
  which reads the same files — see "The assets folder" in README.md before renaming, moving or
  importing one.
