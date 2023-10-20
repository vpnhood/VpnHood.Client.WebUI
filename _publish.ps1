$solutionDir = Join-Path -Path (Split-Path -parent $PSScriptRoot) -ChildPath "VpnHood";

. "$solutionDir\pub\Common.ps1";

$distDir= "$PSScriptRoot\dist";
$spaZipFile= "$solutionDir\VpnHood.Client.App.Win\Resources\SPA.zip";

# build output
# ./_publish.bat
try {
 Push-Location -Path $PSScriptRoot;
 vue build;
}
finally {
    Pop-Location;
}

if ($LASTEXITCODE -gt 0) { Write-Host ("Error code: " + $lastexitcode) -ForegroundColor Red; pause;}

# zip
ZipFiles -Path $distDir -DestinationPath $spaZipFile;
if ($LASTEXITCODE -gt 0) { Write-Host ("Error code: " + $lastexitcode) -ForegroundColor Red; pause;}
