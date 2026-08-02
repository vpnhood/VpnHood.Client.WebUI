# Store pipeline — maintainer's map

This document is the entry point for maintaining the store screenshot/listing pipeline. It is
written for a maintainer with **zero context** — human or AI — because the code was built and is
maintained without line-by-line review. Read this before changing anything; update it when the
shape of the system changes. Detailed *why* lives as comments at the top of each file named below —
this file tells you which file owns what, which invariants must hold, and how to verify a change
without trusting anyone's memory.

## The system in one paragraph

The **WebUI repo** (this repo) owns every tool. The **store-asset repos**
(`vpnhood/Vpnhood.App.Client`, `vpnhood/Vpnhood.App.Connect`) own the *content*: translatable
source texts, generated screenshots, compiled fastlane trees — no app source. The **main repo**
(`vpnhood/VpnHood`) owns every *publish action*: binaries, GitHub releases, and the shared listing
workflow that the store repos call. Nothing ever writes across repo boundaries, which is what keeps
the whole pipeline free of PATs: a reusable workflow runs in its **caller's** context, so when a
store repo calls main's workflow, checkouts and commits land on the store repo with its own token.

## Data flow

```
store-i18n/en-US/store.json     hand-written EN source texts   (store repo)
        │ vhtranslator (Gemini) → 12 sibling locales
        ▼
store-metadata.mjs              compiles texts → fastlane/metadata/{android,ios}/<locale>/*.txt
store-screenshots.mjs           renders SPA against fixture.json → fastlane screenshots/images
        │  both run in update-screenshots.yml (store repo), which commits the results
        ▼
publish_listing.yml (stub, store repo) → publish_listing.yml (main, reusable)
        ├─ gate: store-publish-state.mjs   fingerprint vs fastlane/publish-state.json
        ├─ _publish_listing_appstore.yml   deliver (text) + store-asc-screenshots.mjs (images)
        ├─ _publish_listing_play.yml       fastlane supply (text + checksum-synced images)
        └─ record: commits updated fingerprints back to the store repo
```

Binaries are a separate, parallel path: `publish_client.yml` / `connect_publish.yml` →
`publish_app.yml` → build modules → TestFlight / Play / GitHub release. A release uploads the
binary and its changelog and **never** the listing (see the `playstore` lane comments).

## The tools (all in `e2e/`)

| file | contract |
|---|---|
| `store/project.mjs` | All per-app config: locales (+ per-store code overrides), platforms, devices, shots, install dirs. Data only — change *what* is generated here, never in the engine. |
| `store/fixture.json` | The mocked `/api/app` state screenshots render against. Never real keys/IPs/IDs. |
| `store-screenshots.mjs` | Renders, frames, and installs screenshots. Deterministic: same inputs → same bytes. |
| `store-metadata.mjs` | Compiles `store-i18n` texts into fastlane trees. Fails loud on limits/missing keys/platform names in iOS copy (Guideline 2.3.10). `--check` validates without writing. |
| `store-publish-state.mjs` | Fingerprints what a publish would send; compares with `fastlane/publish-state.json` in the store repo. Text hashed as LF (CRLF checkouts must fingerprint identically to CI). Record only after a **verified** publish. |
| `store-asc-screenshots.mjs` | Checksum-sync of App Store screenshots (the Play `sync_image_upload` equivalent). Replaces deliver's delete-all mode. Phased against Apple's ghost-delete 500s — the file header documents the observed evidence. `--check` reports drift. |
| `store-icon.mjs` | Strips alpha from iOS appiconsets (ITMS-90717). Refuses genuinely translucent pixels. |

## Invariants — do not break these

1. **Generated files are never hand-edited**: fastlane trees come from the compiler/engine;
   `store-i18n/<non-en>/` comes from vhtranslator; only `store-i18n/en-US/store.json` is written
   by hand. Hand-edits are silently overwritten by the next generation run.
2. **No repo writes to another repo.** If a change seems to need that, the design is wrong or a
   deliberate credential decision is being made (see main's `.github/DEPLOYMENT.md`).
3. **`publish-state.json` records only verified publishes.** A cancelled or failed store leg must
   not be recorded — otherwise the gate skips a store that never got the content. The workflow's
   `record` job enforces this via each module's `published` output.
4. **Fail loud.** Every tool throws on missing files, unknown locales, limit overflows. Never add
   a silent fallback; VpnHood is fail-closed by policy.
5. **Missing credential = warn + skip + green; present-but-failing = red.** The fork-friendliness
   convention, documented per-secret in main's `.github/DEPLOYMENT.md`.
6. **iOS copy never names other platforms** (Android/Google Play/Windows/Linux) — App Store
   Guideline 2.3.10. The compiler lints texts; screenshots must respect it too (the Servers page
   promo was removed on iOS for this — don't reintroduce it).

## Apple lore (hard-won, with evidence)

- **Screenshot replace = delete + create of the same fileName.** Apple's deletes are eventually
  consistent; a create that reuses a just-deleted name can 500 **and keeps 500ing while retried**
  (observed >15 min), yet succeeds when tried once later. Hence the phased sync. Never reintroduce
  a delete-everything re-upload (deliver's `overwrite_screenshots`) into CI.
- **A cancelled screenshot push scrambles display order** (uploads land in completion order; the
  ordering PATCH runs last). `store-asc-screenshots.mjs` restores order even on failed runs.
- **First-version quirks**: v1 has no "What's New" (`release_notes.txt` must not exist for it);
  deliver's first-version text push raises a benign "No data" (rescued in each store repo's
  Fastfile `upload_metadata` lane — removable once 1.0 is live).
- **ASC API**: JWT ES256, `exp` ≤ 20 min (Apple rejects at the cap; use 15). Subtitle and privacy
  URL live on `appInfoLocalizations`; description/keywords/promo/URLs on
  `appStoreVersionLocalizations`. `sourceFileChecksum` is the MD5 of the uploaded file — the basis
  of the sync diff.
- **App icons must have no alpha channel** (ITMS-90717) — rejected on channel presence, not
  transparency. Applies to every size in the appiconset, app and extension both.

## How to verify (never trust, always run)

```bash
# texts compile clean and within store limits
node e2e/store-metadata.mjs --check --root ../Vpnhood.App.Client

# what would a publish send vs. what was last published?
node e2e/store-publish-state.mjs --root ../Vpnhood.App.Client

# is the LIVE App Store listing exactly the repo content? (counts, checksums, order)
node e2e/store-asc-screenshots.mjs --bundle-id com.vpnhood.client.ios \
  --root ../Vpnhood.App.Client --keys-dir ../.user --check

# full pipeline, CI: dispatch and watch
gh workflow run publish_listing.yml -R vpnhood/Vpnhood.App.Client
gh workflow run update-screenshots.yml -R vpnhood/Vpnhood.App.Client -f webui-ref=develop
```

An unchanged listing must yield: gate green, both store jobs **skipped**, no record commit. A
forced run (`-f force=true`) must yield all jobs green with the App Store leg ~1 minute.

## Recipes

- **Add a locale**: add to `LOCALES` in `store/project.mjs` (with per-store overrides if the ASC
  code differs; `null` = store lacks it) and to `store-i18n/locales.json` + vhtranslator config in
  each store repo. Run update-screenshots.yml; vhtranslator fills the texts.
- **Change a screenshot page/order**: edit the `shots` arrays in `store/project.mjs` (array order
  IS store order). Regenerate; the listing publish syncs the delta.
- **Change store texts**: edit `store-i18n/en-US/store.json` in the store repo only; CI
  translates, compiles, commits; the gate picks up the change on the next listing publish.
- **Add a store (e.g. Microsoft)**: new `_publish_listing_<store>.yml` module in main following
  the appstore/play pattern (optional credential → warn+skip; `published` output), a `STORES`
  entry in `store-publish-state.mjs`, a compiler section in `store-metadata.mjs`. fastlane has no
  MS support — use msstore CLI/StoreBroker; note MS couples packages+listing in one submission.

## Debugging a wedged App Store push

Do **not** blind-rerun or cancel first. `deliver`'s "Waiting for screenshots to appear …
error=Server error got 500" means the *post-upload verification poll* is failing — the uploads
themselves usually landed. Query the truth via the ASC API (see `--check` above): find sets with a
missing/stuck file, fix surgically (the sync tool does this), restore order, and only record the
publish after verification passes.
