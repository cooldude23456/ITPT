# ==============================================================================
# Hostinger Deployment Packaging Automation Script
# Packages dist/ folder with .htaccess & PHP API into hostinger_public_html.zip
# Uses standard Linux/Hostinger compatible forward-slash (/) zip entries
# ==============================================================================

$ErrorActionPreference = "Stop"
$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$DistPath = Join-Path $WorkspaceRoot "dist"
$ZipOutput = Join-Path $WorkspaceRoot "hostinger_public_html.zip"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  ITPracticeTests Hostinger Packaging Engine             " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Build Production Frontend
Write-Host "[1/4] Running Vite production build..." -ForegroundColor Yellow
$ViteBin = Join-Path $WorkspaceRoot "node_modules\vite\bin\vite.js"
node $ViteBin build

# 2. Sync Hostinger Web Server Configs & PHP API
Write-Host "[2/4] Verifying Hostinger configuration files in dist/..." -ForegroundColor Yellow
$PublicHtaccess = Join-Path $WorkspaceRoot "public\.htaccess"
$DistHtaccess = Join-Path $DistPath ".htaccess"
if (Test-Path $PublicHtaccess) {
    Copy-Item -Path $PublicHtaccess -Destination $DistHtaccess -Force
    Write-Host "  -> Synced .htaccess to dist/" -ForegroundColor Green
}

$PublicApi = Join-Path $WorkspaceRoot "public\api"
$DistApi = Join-Path $DistPath "api"
if (Test-Path $PublicApi) {
    if (-not (Test-Path $DistApi)) {
        New-Item -ItemType Directory -Path $DistApi -Force | Out-Null
    }
    Copy-Item -Path "$PublicApi\*" -Destination $DistApi -Recurse -Force
    Write-Host "  -> Synced native PHP API to dist/api/" -ForegroundColor Green
}

# 3. Create Hostinger-Compliant ZIP Package (Strict Linux forward slashes)
Write-Host "[3/4] Creating Linux/Hostinger compatible zip archive..." -ForegroundColor Yellow
if (Test-Path $ZipOutput) {
    Remove-Item $ZipOutput -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipStream = [System.IO.File]::Create($ZipOutput)
$archive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)

$files = Get-ChildItem -Path $DistPath -Recurse -File -Force
foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($DistPath.Length + 1).Replace("\", "/")
    $entry = $archive.CreateEntry($relativePath, [System.IO.Compression.CompressionLevel]::Optimal)
    $entryStream = $entry.Open()
    $fileStream = [System.IO.File]::OpenRead($file.FullName)
    $fileStream.CopyTo($entryStream)
    $fileStream.Dispose()
    $entryStream.Dispose()
    Write-Host "  + $relativePath" -ForegroundColor DarkGray
}

$archive.Dispose()
$zipStream.Dispose()

$zipItem = Get-Item $ZipOutput
$zipSizeMB = [math]::Round($zipItem.Length / 1MB, 2)

Write-Host "[4/4] Package created successfully!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Deployment Archive: $ZipOutput" -ForegroundColor White
Write-Host "  Archive Size:       $zipSizeMB MB" -ForegroundColor White
Write-Host "  Total Files:        $($files.Count)" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Instructions for Hostinger File Manager:" -ForegroundColor Yellow
Write-Host "  1. Log into your Hostinger hPanel -> File Manager" -ForegroundColor White
Write-Host "  2. Open the 'public_html' folder of your domain" -ForegroundColor White
Write-Host "  3. Upload 'hostinger_public_html.zip'" -ForegroundColor White
Write-Host "  4. Right-click the zip file -> Click 'Extract' -> Choose 'public_html'" -ForegroundColor White
Write-Host "  5. Done! Your website, quiz engine, checkout, and admin panel are 100% active!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
