# Publishes the SPA: bump -> push -> (stable only) fast-forward main -> dispatch the ClassicSpa CI.
#
# Publishing is an explicit act by a developer — there is no push trigger anywhere. That is also why
# no PAT is involved: `gh` runs as you, and your credentials already carry the `workflow` scope. CI
# never writes back to this repo, so the version bump happens here, locally, before the push.
#
# Flow:
#   1. Refuse a dirty tree, and refuse to publish from anywhere but develop.
#   2. Pull develop (picks up anything published from another machine).
#   3. Bump the SPA version via pub/Bump-SpaVersion.ps1 — adopt the monorepo version when it is
#      ahead, otherwise self-bump the build number — and commit it.
#   4. Push develop. On a STABLE publish also fast-forward main; never --force, so a rejection means
#      a real divergence to reconcile by hand.
#   5. Dispatch vpnhood/VpnHood.AppLib.Assets.ClassicSpa publish_nugets.yml, which clones this repo
#      at the published ref, builds the SPA, packs it and pushes the NuGet.
#
# Usage:
#   ./_publish.ps1               # stable:     develop -> main, NuGet X.Y.Z
#   ./_publish.ps1 -prerelease   # prerelease: develop only,    NuGet X.Y.Z-prerelease
#
# To run the app against an UNPUBLISHED local SPA, use ./_build-local-spa.ps1 instead — it builds
# into the sibling ClassicSpa project and never bumps, pushes or publishes anything.
#
# Requires the GitHub CLI (gh) authenticated for the vpnhood org.

param(
	# Publish X.Y.Z-prerelease from develop and leave main untouched. Without it, develop is
	# fast-forwarded onto main and a stable X.Y.Z is published from main.
	[switch]$prerelease
);

$ErrorActionPreference = "Stop";
$classicSpaRepo = "vpnhood/VpnHood.AppLib.Assets.ClassicSpa";

Push-Location $PSScriptRoot;
try {
	$branch = git branch --show-current;
	if ($branch -ne "develop") { throw "_publish: publish from 'develop' (currently on '$branch')."; }

	# CI publishes what is on GitHub, not what is on this machine; git pull below needs a clean tree.
	$dirty = git status --porcelain;
	if ($dirty) { throw "_publish: working tree has uncommitted changes; commit or stash them first.`n$($dirty -join "`n")"; }

	git pull origin develop --no-rebase;
	if ($LASTEXITCODE -ne 0) { throw "_publish: git pull failed (exit $LASTEXITCODE) — resolve and retry."; }

	& "$PSScriptRoot/pub/Bump-SpaVersion.ps1";
	$version = (Get-Content "$PSScriptRoot/package.json" -Raw | ConvertFrom-Json).version;

	git add package.json package-lock.json;
	git commit -m "Publish SPA $version";
	if ($LASTEXITCODE -ne 0) { throw "_publish: git commit failed (exit $LASTEXITCODE)."; }

	git push origin develop;
	if ($LASTEXITCODE -ne 0) { throw "_publish: git push to develop failed (exit $LASTEXITCODE)."; }

	# main only ever fast-forwards from develop (same rule as the monorepo's Invoke-VersionBump): a
	# prerelease leaves it alone, and a rejected stable push signals a divergence to fix by hand.
	$publishRef = "develop";
	if (-not $prerelease) {
		git push origin develop:main;
		if ($LASTEXITCODE -ne 0) { throw "_publish: fast-forward of main failed (exit $LASTEXITCODE) — reconcile by hand, do not force."; }
		$publishRef = "main";
	}

	$prereleaseParam = if ($prerelease) { "true" } else { "false" };
	gh workflow run publish_nugets.yml --repo $classicSpaRepo --ref develop `
		-f webui_ref=$publishRef -f prerelease=$prereleaseParam;
	if ($LASTEXITCODE -ne 0) { throw "_publish: gh workflow run failed (exit $LASTEXITCODE)."; }

	Write-Host "Publishing SPA $version from '$publishRef' (prerelease=$prereleaseParam). CI builds the SPA, bumps the package version and pushes the NuGet." -ForegroundColor Green;
	Start-Sleep -Seconds 5;
	gh run list --repo $classicSpaRepo --workflow publish_nugets.yml --limit 1;
}
finally {
	Pop-Location;
}
