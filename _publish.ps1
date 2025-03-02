$solutionDir = Join-Path -Path $PSScriptRoot -ChildPath "nuget";

$distDir= "$PSScriptRoot/dist"
$spaZipFile= "$solutionDir/VpnHood.AppLib.Assets.ClassicSpa/Resources/SPA.zip";

# build output
try {
 Push-Location -Path $PSScriptRoot;
 npm run build;
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
