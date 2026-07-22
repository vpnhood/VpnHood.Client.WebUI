# LOCAL development build — no version bump, no NuGet, nothing pushed.
#
# Builds this SPA into the sibling VpnHood.AppLib.Assets.ClassicSpa project and compiles that project
# in Release, which is exactly what `VpnHood.App.Client.csproj` picks up when the switch file
# `<Vh>/.user/use-local-spa.txt` exists. Create that file to run the app against this build; delete it
# to go back to the published NuGet.
#
# The real publish is CI-only: push to develop/main here and .github/workflows/publish_spa.yml
# dispatches the ClassicSpa repo, which rebuilds the SPA and publishes the package. Nothing in this
# script affects a published version.
#
# Because nothing increments locally, the app reports this build by its BUILD TIME (shown under the
# version in the navigation drawer as "local · built ..."). If that timestamp is not the moment you
# ran this script, you are looking at a stale bundle — not a fresh one.

$ErrorActionPreference = "Stop";

$solutionDir = $PSScriptRoot;
$vhDir = Split-Path -parent $solutionDir;
$nugetSolutionDir = Join-Path $vhDir "VpnHood.AppLib.Assets.ClassicSpa";
$nugetProjectDir = Join-Path $nugetSolutionDir "VpnHood.AppLib.Assets.ClassicSpa";
$buildSpaScript = Join-Path $nugetSolutionDir "pub/Build-Spa.ps1";
$translatorFile = Join-Path $vhDir "VpnHood.ResourceTranslator/VpnHood.ResourceTranslator/bin/Debug/net10.0/vhtranslator.exe";

if (!(Test-Path $buildSpaScript)) {
    throw "Could not find $buildSpaScript — is the VpnHood.AppLib.Assets.ClassicSpa repo checked out beside this one?";
}

# translate
Write-Host "Translating the new locales string ..." -ForegroundColor Magenta;
if (Test-Path $translatorFile) {
    & $translatorFile --base "$solutionDir/src/locales/en.json" -m "gemini-flash-lite-latest";
}
else {
    Write-Host "Translator app not found. Skipping translation step." -ForegroundColor Yellow;
}

# build + zip — the same script CI runs, pointed at this checkout, so local and published bundles
# are produced identically.
Write-Host "Building SPA ..." -ForegroundColor Magenta;
& $buildSpaScript -webUiDir $solutionDir;
if ($LASTEXITCODE -gt 0) { throw "Could not build the SPA. ExitCode: $LASTEXITCODE"; }

# build the asset assembly so the use-local-spa switch has a Release DLL to reference
Write-Host "Building local ClassicSpa assembly ..." -ForegroundColor Magenta;
dotnet clean $nugetProjectDir -c "Release";
dotnet build $nugetProjectDir -c "Release" --no-incremental;
if ($LASTEXITCODE -gt 0) { throw "Could not build the ClassicSpa project. ExitCode: $LASTEXITCODE"; }

Write-Host "Done. Create <Vh>/.user/use-local-spa.txt to run the app against this build." -ForegroundColor Green;
