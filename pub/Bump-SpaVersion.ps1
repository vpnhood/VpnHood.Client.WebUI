# Bumps this SPA's version using the SAME rule as vpnhood module repos — see vpnhood/VpnHood
# pub/MODULE-REPOS.md ("The version rule"):
#
#   monorepo develop ahead of us -> ADOPT it verbatim (keeps the family aligned)
#   otherwise                    -> self-bump our own build number
#
# Major/Minor therefore never move on their own; they only arrive by adopting the monorepo. That is
# what keeps the 4th segment shown in the UI (app.major.minor.build + SPA build) comparable across
# products instead of being an unrelated counter.
#
# package.json IS the SPA's version file — there is no separate pub/PubVersion.json here.
#
# CI-only. Local builds never bump: nothing increments locally, so a local bundle is identified by
# its build time instead (see vite.config.ts / NavigationDrawer.vue).

param(
	# Monorepo version source. The raw develop URL keeps "always read develop" true wherever this
	# runs (develop always carries the highest version); a local file path also works for testing.
	[string]$vhVersionSource = "https://raw.githubusercontent.com/vpnhood/VpnHood/develop/pub/PubVersion.json",
	# Compute and print the next version without writing package.json.
	[switch]$whatIf
);

$ErrorActionPreference = "Stop";

$projectDir = Split-Path -Parent $PSScriptRoot;
$packageFile = Join-Path $projectDir "package.json";
if (!(Test-Path $packageFile)) { throw "Bump-SpaVersion: $packageFile not found."; }

$spaVersion = [version](Get-Content $packageFile -Raw | ConvertFrom-Json).version;

$vhVersionJson = if (Test-Path $vhVersionSource) { Get-Content $vhVersionSource | ConvertFrom-Json } else { Invoke-RestMethod $vhVersionSource };
$vhVersion = [version]$vhVersionJson.Version;

$version = if ($vhVersion -gt $spaVersion) { $vhVersion } else { [version]::new($spaVersion.Major, $spaVersion.Minor, $spaVersion.Build + 1) };
$newVersion = $version.ToString(3);
$reason = if ($vhVersion -gt $spaVersion) { "adopted monorepo $vhVersion" } else { "self-bump; monorepo develop is $vhVersion" };
Write-Host "SPA version: $spaVersion -> $newVersion ($reason)" -ForegroundColor Blue;

if ($whatIf) {
	Write-Host "whatIf set: package.json not written." -ForegroundColor Yellow;
	return;
}

# npm owns the write so package-lock.json stays in sync with package.json.
Push-Location $projectDir;
try {
	npm version $newVersion --no-git-tag-version --allow-same-version | Out-Null;
	if ($LASTEXITCODE -gt 0) { throw "Bump-SpaVersion: npm version failed (exit $LASTEXITCODE)."; }
}
finally {
	Pop-Location;
}

if ($env:GITHUB_OUTPUT) { "version=$newVersion" | Out-File $env:GITHUB_OUTPUT -Append -Encoding utf8; }
