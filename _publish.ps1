# Publishes the SPA nuget by dispatching this repo's publish_nugets.yml. CI does the real work —
# bump, translate, commit back, build, pack, push — so this is only a trigger.
#
# No PAT: `gh` runs as you (its `workflow` scope is enough), and CI writes back to this repo with the
# default GITHUB_TOKEN. CI bumps and commits the version, so `git pull` after publishing to pick up
# the "Publish SPA x.y.z" commit before your next work.
#
# Flow:
#   1. Refuse a dirty tree; publish only from develop.
#   2. Build the SPA locally as a pre-flight gate — nothing is dispatched if it fails.
#   3. Pull, then push develop — CI publishes what is on GitHub, so your committed work must be there.
#   4. Dispatch publish_nugets.yml on develop. A stable run also fast-forwards main (in CI).
#
# Usage:
#   ./_publish.ps1               # prompts for Prerelease / Stable
#   ./_publish.ps1 -prerelease   # prerelease: commit X.Y.Z on develop,        NuGet X.Y.Z-prerelease
#   ./_publish.ps1 -prerelease:$false  # stable:  commit X.Y.Z on develop, ff main, NuGet X.Y.Z
#
# To run the app against an UNPUBLISHED local SPA, use ./_build-local.ps1 instead — it translates and
# builds the in-repo nuget project locally and never bumps, pushes or publishes anything.
#
# Requires the GitHub CLI (gh) authenticated for the vpnhood org.

param(
	# Publish X.Y.Z-prerelease and leave main untouched; -prerelease:$false publishes a stable X.Y.Z
	# and fast-forwards main. Omit it entirely to be prompted (a publish is public — no silent default).
	[switch]$prerelease
);

$ErrorActionPreference = "Stop";

Push-Location $PSScriptRoot;
try {
	$branch = git branch --show-current;
	if ($branch -ne "develop") { throw "_publish: publish from 'develop' (currently on '$branch')."; }

	$dirty = git status --porcelain;
	if ($dirty) { throw "_publish: working tree has uncommitted changes; commit or stash them first.`n$($dirty -join "`n")"; }

	# Prompt for the release type unless it was passed explicitly (so automation can still be silent).
	# Enter defaults to stable (N); prerelease requires an explicit y.
	if (-not $PSBoundParameters.ContainsKey('prerelease')) {
		$answer = Read-Host "Publish as a prerelease? [y/N]";
		$prerelease = ($answer -match '^\s*[yY]');
	}

	# Pre-flight gate: the same Build-Spa.ps1 CI runs, so a type error or a broken bundle stops the
	# publish HERE — before anything is pushed or dispatched. Without it the failure lands in CI after
	# it has already bumped and committed "Publish SPA x.y.z", leaving a burnt version behind.
	# `npm ci` is deliberately not skipped: CI installs from the lockfile, and a gate that builds
	# against a drifted node_modules can pass where CI fails.
	#
	# This is a build ONLY — no translation, no bump. It leaves dist/ and nuget/.../Resources/spa.zip
	# (both gitignored, so the clean-tree check above still holds) and steps the untracked
	# .local-build-number. The bundle CI publishes is built by CI, not this one; to run the app against
	# a local SPA use ./_build-local.ps1, which also translates.
	Write-Host "Pre-flight: building the SPA locally ..." -ForegroundColor Magenta;
	& (Join-Path $PSScriptRoot "pub/Build-Spa.ps1");
	if ($LASTEXITCODE -ne 0) { throw "_publish: local SPA build failed (exit $LASTEXITCODE) — nothing was published."; }

	git pull origin develop --no-rebase;
	if ($LASTEXITCODE -ne 0) { throw "_publish: git pull failed (exit $LASTEXITCODE) — resolve and retry."; }

	git push origin develop;
	if ($LASTEXITCODE -ne 0) { throw "_publish: git push failed (exit $LASTEXITCODE)."; }

	$prereleaseParam = if ($prerelease) { "true" } else { "false" };
	# Same repo — gh infers it from the remote.
	gh workflow run publish_nugets.yml --ref develop -f prerelease=$prereleaseParam;
	if ($LASTEXITCODE -ne 0) { throw "_publish: gh workflow run failed (exit $LASTEXITCODE)."; }

	Write-Host "Publish dispatched on develop (prerelease=$prereleaseParam). CI bumps, translates, commits back, builds and pushes the NuGet — 'git pull' before your next work." -ForegroundColor Green;
	Start-Sleep -Seconds 5;
	gh run list --workflow publish_nugets.yml --limit 1;
}
finally {
	Pop-Location;
}
