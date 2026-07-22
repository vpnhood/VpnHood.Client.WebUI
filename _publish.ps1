# Publishes the SPA nuget by dispatching this repo's publish_nugets.yml. CI does the real work —
# bump, translate, commit back, build, pack, push — so this is only a trigger.
#
# No PAT: `gh` runs as you (its `workflow` scope is enough), and CI writes back to this repo with the
# default GITHUB_TOKEN. CI bumps and commits the version, so `git pull` after publishing to pick up
# the "Publish SPA x.y.z" commit before your next work.
#
# Flow:
#   1. Refuse a dirty tree; publish only from develop.
#   2. Pull, then push develop — CI publishes what is on GitHub, so your committed work must be there.
#   3. Dispatch publish_nugets.yml on develop. A stable run also fast-forwards main (in CI).
#
# Usage:
#   ./_publish.ps1               # stable:     commit X.Y.Z on develop, ff main, NuGet X.Y.Z
#   ./_publish.ps1 -prerelease   # prerelease: commit X.Y.Z on develop,        NuGet X.Y.Z-prerelease
#
# To run the app against an UNPUBLISHED local SPA, use ./_build-local.ps1 instead — it translates and
# builds the in-repo nuget project locally and never bumps, pushes or publishes anything.
#
# Requires the GitHub CLI (gh) authenticated for the vpnhood org.

param(
	# Publish X.Y.Z-prerelease and leave main untouched. Without it, a stable X.Y.Z is published and
	# develop is fast-forwarded onto main (in CI).
	[switch]$prerelease
);

$ErrorActionPreference = "Stop";

Push-Location $PSScriptRoot;
try {
	$branch = git branch --show-current;
	if ($branch -ne "develop") { throw "_publish: publish from 'develop' (currently on '$branch')."; }

	$dirty = git status --porcelain;
	if ($dirty) { throw "_publish: working tree has uncommitted changes; commit or stash them first.`n$($dirty -join "`n")"; }

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
