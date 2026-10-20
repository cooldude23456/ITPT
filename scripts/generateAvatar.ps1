Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 200, 200
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

# Blue gradient circle
$rect = New-Object System.Drawing.Rectangle 0, 0, 200, 200
$c1 = [System.Drawing.Color]::FromArgb(29, 78, 216)
$c2 = [System.Drawing.Color]::FromArgb(2, 132, 199)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, 45.0
$g.FillEllipse($brush, 4, 4, 192, 192)

# Border
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), 6
$g.DrawEllipse($pen, 7, 7, 186, 186)

# Text "YD"
$font = New-Object System.Drawing.Font ('Segoe UI', 64, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$textBrush = [System.Drawing.Brushes]::White
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center

$g.DrawString('YD', $font, $textBrush, (New-Object System.Drawing.RectangleF 0, 8, 200, 200), $sf)

$targetPathPng = Join-Path $PSScriptRoot '..\public\yd-avatar.png'
$targetPathWebp = Join-Path $PSScriptRoot '..\public\6577847_169c.webp'

$bmp.Save($targetPathPng, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($targetPathWebp, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()

Write-Output "YD avatar PNG and WebP generated successfully at $targetPathPng and $targetPathWebp"
