$ErrorActionPreference = "Stop";

$distDir= "$PSScriptRoot/dist"
$nugetSolutionDir = Join-Path -Path (Split-Path -parent $PSScriptRoot) -ChildPath "VpnHood.AppLib.Assets.ClassicSpa";
$nugetProjectDir = Join-Path -Path $nugetSolutionDir -ChildPath "VpnHood.AppLib.Assets.ClassicSpa";
$spaZipFile= "$nugetProjectDir/Resources/spa.zip";

# build output
try {
 Write-Host "Building SPA ..." -BackgroundColor Blue -ForegroundColor White;
 Push-Location -Path $PSScriptRoot;
 npm run build;
 if ($LastExitCode -ne 0) {throw "Could not build SPA Error code: $LastExitCode"; }
}
finally {
    Pop-Location;
}

#-------------------
# zip
# ------------------
Write-Host "Creating Zip ..." -BackgroundColor Blue -ForegroundColor White;
# tar.exe -C "$distDir" -a -cf "$spaZipFile" "*"
$process = Start-Process -FilePath "tar.exe" -ArgumentList "-C `"$distDir`" -a -cf `"$spaZipFile`" *" -NoNewWindow -Wait -PassThru
if ($process.ExitCode -ne 0) { throw "Could not create the zip file. ExitCode: $LASTEXITCODE " }

#-------------------
# build nuget
# ------------------
Write-Host "Building nuget ..." -BackgroundColor Blue -ForegroundColor White;
dotnet build $nugetProjectDir -c "Release"
if ($LastExitCode -gt 0) { throw "Could not create the zip file. ExitCode: $LastExitCode" }
