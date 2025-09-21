$solutionDir = $PSScriptRoot;
$vhDir = Split-Path -parent $solutionDir;

$translatorFile= Join-Path $vhDir "VpnHood.ResourceTranslator/VpnHood.ResourceTranslator/bin/Debug/net8.0/vhtranslator.exe"
$translatorPrompt= Join-Path $solutionDir "src/locales/vh_translator/custom_prompt.txt"

#translate
if (Test-Path $translatorFile) {
    & $translatorFile --base "$solutionDir/src/locales/en.json" -x $translatorPrompt -m "gemini-2.5-pro";
}
else {
    Write-Host "Translator app not found. Skipping translation step." -ForegroundColor Yellow;
}
exit