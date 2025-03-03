$ErrorActionPreference = "Stop";
$LastExitCode = 0;

$distDir= "$PSScriptRoot/dist"
$nugetSolutionDir = Join-Path -Path (Split-Path -parent $PSScriptRoot) -ChildPath "VpnHood.AppLib.Assets.ClassicSpa";
$nugetProjectDir = Join-Path -Path $nugetSolutionDir -ChildPath "VpnHood.AppLib.Assets.ClassicSpa";
$spaZipFile= "$nugetProjectDir/Resources/spa.zip";

# build output
try {
 Write-Host "Building SPA ..." -BackgroundColor Blue -ForegroundColor White;
 Push-Location -Path $PSScriptRoot;
# npm run build;
 if ($LastExitCode -ne 0) {throw "Could not build SPA Error code: $_"; }
}
finally {
    Pop-Location;
}

#-------------------
# zip
# ------------------
Write-Host "Creating Zip ..." -BackgroundColor Blue -ForegroundColor White;
Compress-Archive -Path "$distDir\*" -DestinationPath "$spaZipFile" -CompressionLevel NoCompression -Force
if ($LastExitCode -ne 0) { throw "Could not create the zip file. Error: $_" }

#-------------------
# build nuget
# ------------------
Write-Host "Building nuget ..." -BackgroundColor Blue -ForegroundColor White;
dotnet build $nugetProjectDir -c "Release"
if ($LastExitCode -gt 0) { throw "Could not create the zip file. ExitCode: $_" }
