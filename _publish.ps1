$solutionDir = Join-Path -Path (Split-Path -parent $PSScriptRoot) -ChildPath "VpnHood";

$distDir= "$PSScriptRoot\dist"
$spaZipFile= "$solutionDir\VpnHood.Client.App.Resources\Resources\SPA.zip";

# build output
try {
 Push-Location -Path $PSScriptRoot;
 vue build;
}
finally {
    Pop-Location;
}

if ($LASTEXITCODE -gt 0) { Write-Host ("Error code: " + $lastexitcode) -ForegroundColor Red; pause;}

# zip
Write-Output "Creating $spaZipFile ...";
tar.exe -C "$distDir" -a -cf "$spaZipFile" "*"
Write-Output "Done";


if ($LASTEXITCODE -gt 0) { Write-Host ("Error code: " + $lastexitcode) -ForegroundColor Red; pause;}
