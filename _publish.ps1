$ErrorActionPreference = "Stop";
$LastExitCode = 0;

$solutionDir = $PSScriptRoot;
$vhDir = Split-Path -parent $solutionDir;

$distDir= "$PSScriptRoot/dist"
$nugetSolutionDir = Join-Path -Path (Split-Path -parent $PSScriptRoot) -ChildPath "VpnHood.AppLib.Assets.ClassicSpa";
$nugetProjectDir = Join-Path -Path $nugetSolutionDir -ChildPath "VpnHood.AppLib.Assets.ClassicSpa";
$spaZipFile= "$nugetProjectDir/Resources/spa.zip";
$translatorFile= "" #Join-Path $vhDir "VpnHood.ResourceTranslator/VpnHood.ResourceTranslator/bin/Debug/net8
# .0/vhtranslator.exe"
$translatorPrompt= Join-Path $solutionDir "src/locales/vh_translator/custom_prompt.txt"

#translate
Write-Host "Translating the new locales string ..." -ForegroundColor Magenta;
if (Test-Path $translatorFile) {
    & $translatorFile --base "$solutionDir/src/locales/en.json" -x $translatorPrompt -m "gemini-2.5-pro";
}
else {
    Write-Host "Translator app not found. Skipping translation step." -ForegroundColor Yellow;
}

# build output
try {
 Write-Host "Building SPA ..." -ForegroundColor Magenta;
 Push-Location -Path $PSScriptRoot;
 npm run build;
 if ($LastExitCode -ne 0) {throw "Could not build SPA Error code: $_"; }
}
finally {
    Pop-Location;
}

#-------------------
# zip
# ------------------
Write-Host "Creating Zip ..." -ForegroundColor Magenta;
Compress-Archive -Path "$distDir\*" -DestinationPath "$spaZipFile" -CompressionLevel NoCompression -Force
if ($LastExitCode -ne 0) { throw "Could not create the zip file. Error: $_" }

#-------------------
# build nuget
# ------------------
Write-Host "Building nuget ..." -ForegroundColor Magenta;
dotnet clean $nugetProjectDir -c "Release";
dotnet build $nugetProjectDir -c "Release" --no-incremental;
if ($LastExitCode -gt 0) { throw "Could not create the zip file. ExitCode: $_" }
