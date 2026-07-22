# Builds the SPA in this repo and zips it into the nuget project's Resources/spa.zip — the payload
# of the VpnHood.AppLib.Assets.ClassicSpa package.
#
# Since the SPA and the nuget now live in ONE repo, there is no cross-repo clone: this just builds
# src/ and zips dist/ into the sibling nuget/ folder. Runs both in CI (before the pack) and from
# _build-local.ps1 (for use-local-spa mode), so local and published bundles are produced the same
# way. The zip is gitignored — it is a build artifact, never committed.

param(
	# Skip `npm ci` (deps already installed) — CI installs once and can pass this on repeated builds.
	[switch]$noInstall
);

$ErrorActionPreference = "Stop";

$repoDir = Split-Path -Parent $PSScriptRoot;
$distDir = Join-Path $repoDir "dist";
$spaZipFile = Join-Path $repoDir "nuget/VpnHood.AppLib.Assets.ClassicSpa/Resources/spa.zip";

if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
	throw "Build-Spa: 'npm' is not on PATH. Install Node.js (CI: actions/setup-node) before building the SPA.";
}
$modulesDir = Join-Path $repoDir "node_modules";

Push-Location $repoDir;
try {
	if ($noInstall) {
		# -noInstall trusts an existing install; a missing one would fail later as a cryptic
		# "run-p: not found" (exit 127), so catch it here with a message that names the cause.
		if (!(Test-Path $modulesDir)) {
			throw "Build-Spa: -noInstall was set but $modulesDir does not exist. Drop -noInstall (or run 'npm ci') so build tools like run-p are present.";
		}
	}
	else {
		npm ci;
		if ($LASTEXITCODE -ne 0) { throw "Build-Spa: 'npm ci' failed (exit $LASTEXITCODE) in $repoDir."; }
	}
	# `npm run build` = type-check + vite build. A type error must fail the publish, not ship.
	npm run build;
	if ($LASTEXITCODE -ne 0) {
		$hint = if ($LASTEXITCODE -eq 127) { " (exit 127 = a build tool was not found — node_modules is likely missing or incomplete)" } else { "" };
		throw "Build-Spa: 'npm run build' failed (exit $LASTEXITCODE) in $repoDir$hint.";
	}
}
finally {
	Pop-Location;
}

$indexHtml = Join-Path $distDir "index.html";
if (!(Test-Path $indexHtml)) {
	throw "Build-Spa: the build reported success but $indexHtml is missing — vite produced no usable output.";
}

New-Item -ItemType Directory -Path (Split-Path -Parent $spaZipFile) -Force | Out-Null;
# NoCompression: the app extracts this on every version change; the assets are already compressed.
Compress-Archive -Path "$distDir/*" -DestinationPath $spaZipFile -CompressionLevel NoCompression -Force;

$sizeMb = [math]::Round((Get-Item $spaZipFile).Length / 1MB, 1);
Write-Host "SPA bundle written: $spaZipFile ($sizeMb MB)" -ForegroundColor Green;
