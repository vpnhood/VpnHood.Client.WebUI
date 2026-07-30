# LOCAL development build — no version bump, no NuGet, nothing pushed.
#
# Builds this SPA into the in-repo nuget/ project and compiles that project in Release, which is
# exactly what `VpnHood.App.Client.csproj` picks up when the switch file `<Vh>/.user/use-local-spa.txt`
# exists. Create that file to run the app against this build; delete it to go back to the published
# NuGet.
#
# The real publish is done by _publish.ps1 (bump + push + dispatch publish_nugets.yml). Nothing in
# this script affects a published version.
#
# Because the published version never increments locally, the app reports this build by a LOCAL BUILD
# NUMBER instead (shown under the version in the navigation drawer as "local · build #N"). Every run
# of this script steps it by one, and it is kept in the untracked <WebUI>/.local-build-number file —
# per machine, never committed. If the number the app shows is not the one this script just printed,
# you are looking at a stale bundle — not a fresh one.

$ErrorActionPreference = "Stop";

# The translator prints UTF-8 (e.g. '✓'); without this, PowerShell decodes captured native output
# with the OEM codepage and shows mojibake like 'Γ£ô'.
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8;

$solutionDir = $PSScriptRoot;
$vhDir = Split-Path -parent $solutionDir;
$buildSpaScript = Join-Path $solutionDir "pub/Build-Spa.ps1";

# Run the translator from SOURCE, not from a published package or a stale bin folder, so any local
# change to the translator applies to the very next run of this script with no publish round-trip.
# `dotnet run` rebuilds it first.
$translatorProjectCandidates = @(
    (Join-Path $vhDir "VpnHood.Tools.ResourceTranslator/src/VpnHood.Tools.ResourceTranslator/VpnHood.Tools.ResourceTranslator.csproj"),
    (Join-Path $vhDir "VpnHood.ResourceTranslator/src/VpnHood.Tools.ResourceTranslator/VpnHood.Tools.ResourceTranslator.csproj")
);
$translatorProject = $translatorProjectCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1;

if (!(Test-Path $buildSpaScript)) {
    throw "Could not find $buildSpaScript.";
}

if (!$translatorProject) {
    throw "Could not find the translator project — is the VpnHood.Tools.ResourceTranslator repo checked out beside this one?";
}

# The Gemini key lives in the private OmegaHood.Secrets checkout (<Vh>/.user), never in this repo.
# Per-repo location first, then the older repo-root spellings.
$geminiKeyCandidates = @(
    (Join-Path $vhDir ".user/VpnHood.Client.WebUI/google_gemini_api_key.txt"),
    (Join-Path $vhDir ".user/google_gemini_api_key.txt"),
    (Join-Path $vhDir ".user/goolge_gemini_api_key.txt")
);
$geminiKeyFile = $geminiKeyCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1;

if (!$geminiKeyFile) {
    throw "Could not find google_gemini_api_key.txt — expected it in $vhDir/.user/VpnHood.Client.WebUI.";
}

# Passed by environment rather than --api-key so the secret never appears in a command line.
$env:GEMINI_API_KEY = (Get-Content $geminiKeyFile -Raw).Trim();
if ([string]::IsNullOrWhiteSpace($env:GEMINI_API_KEY)) {
    throw "The Gemini API key file $geminiKeyFile is empty.";
}

# translate — a silent skip here produces a bundle with stale locales, so this fails loudly instead.
# --no-launch-profile keeps a developer's launchSettings.json (base path, model) from overriding
# the arguments below.
Write-Host "Translating the new locales string ..." -ForegroundColor Magenta;
dotnet run --project $translatorProject --no-launch-profile -- --base "$solutionDir/src/locales/en.json" -m "gemini-flash-lite-latest";
if ($LASTEXITCODE -gt 0) { throw "Translation failed. ExitCode: $LASTEXITCODE"; }

# Commit the results (locale files AND vh_translator/watches/en.watch.json). The watch file records
# the source text behind every key; if it is not committed, the next machine to run this retranslates
# everything from scratch. The pathspec keeps this commit to src/locales, so anything else you
# have staged is left untouched.
#
# The watch file used to sit directly in vh_translator/; newer translator versions keep it in the
# watches/ subfolder and migrate the old file on their first save (read from the old path, written
# to the new one, old one deleted). `git add -A` below stages both sides of that move, so the
# incremental state survives — do NOT move the file by hand, or an older translator build would
# stop finding it and retranslate every language.
$localesPath = "src/locales";
if (git -C $solutionDir status --porcelain -- $localesPath) {
    Write-Host "Committing updated locales ..." -ForegroundColor Magenta;
    git -C $solutionDir add -A -- $localesPath;
    git -C $solutionDir commit -m "Update translated locales" -- $localesPath;
    if ($LASTEXITCODE -gt 0) { throw "Could not commit locales. ExitCode: $LASTEXITCODE"; }
}
else {
    Write-Host "Locales unchanged — nothing to commit." -ForegroundColor DarkGray;
}

# build + zip — the same script CI runs, so local and published bundles are produced identically.
# This writes nuget/.../Resources/spa.zip. The use-local-spa switch embeds THAT zip straight into
# VpnHood.App.Client (see its csproj) — there is no asset DLL to build anymore; the package is
# zip-only and its build targets do the embedding in production.
Write-Host "Building SPA ..." -ForegroundColor Magenta;
& $buildSpaScript;
if ($LASTEXITCODE -gt 0) { throw "Could not build the SPA. ExitCode: $LASTEXITCODE"; }

# Echo the number vite just consumed, so the "local · build #N" line in the app can be compared
# against the build that was actually produced here.
$localBuildNumberFile = Join-Path $solutionDir ".local-build-number";
if (Test-Path $localBuildNumberFile) {
    Write-Host "Local build #$((Get-Content $localBuildNumberFile -Raw).Trim())" -ForegroundColor Green;
}

Write-Host "Done. Create <Vh>/.user/use-local-spa.txt to run the app against this build." -ForegroundColor Green;
