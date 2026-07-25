param(
  [Parameter(Mandatory = $true)] [string] $InputPath,
  [Parameter(Mandatory = $true)] [string] $OutputPath,
  [int] $Padding = 4,
  [switch] $PreserveCanvas
)

Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path -LiteralPath $InputPath).Path
$destinationPath = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputPath))
$source = [System.Drawing.Bitmap]::FromFile($sourcePath)
$processed = New-Object System.Drawing.Bitmap $source.Width, $source.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

try {
  $minX = $source.Width
  $minY = $source.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $source.Height; $y++) {
    for ($x = 0; $x -lt $source.Width; $x++) {
      $pixel = $source.GetPixel($x, $y)
      $greenExcess = $pixel.G - [Math]::Max($pixel.R, $pixel.B)
      $alpha = if ($greenExcess -le 12) {
        255
      } else {
        [Math]::Max(0, [Math]::Min(255, [Math]::Round(255 * (1 - (($greenExcess - 12) / 180)))))
      }

      $green = if ($alpha -lt 255) { [Math]::Min($pixel.G, [Math]::Max($pixel.R, $pixel.B)) } else { $pixel.G }
      $processed.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $pixel.R, $green, $pixel.B))

      if ($alpha -gt 24) {
        $minX = [Math]::Min($minX, $x)
        $minY = [Math]::Min($minY, $y)
        $maxX = [Math]::Max($maxX, $x)
        $maxY = [Math]::Max($maxY, $y)
      }
    }
  }

  if ($maxX -lt 0) { throw 'No opaque subject pixels found after chroma removal.' }

  $left = if ($PreserveCanvas) { 0 } else { [Math]::Max(0, $minX - $Padding) }
  $top = if ($PreserveCanvas) { 0 } else { [Math]::Max(0, $minY - $Padding) }
  $right = if ($PreserveCanvas) { $source.Width - 1 } else { [Math]::Min($source.Width - 1, $maxX + $Padding) }
  $bottom = if ($PreserveCanvas) { $source.Height - 1 } else { [Math]::Min($source.Height - 1, $maxY + $Padding) }
  $cropRect = New-Object System.Drawing.Rectangle $left, $top, ($right - $left + 1), ($bottom - $top + 1)
  $cropped = $processed.Clone($cropRect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

  try {
    $outputDirectory = [System.IO.Path]::GetDirectoryName($destinationPath)
    [System.IO.Directory]::CreateDirectory($outputDirectory) | Out-Null
    $cropped.Save($destinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $cropped.Dispose()
  }
}
finally {
  $processed.Dispose()
  $source.Dispose()
}
