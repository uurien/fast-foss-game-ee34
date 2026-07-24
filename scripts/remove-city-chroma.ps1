param(
  [Parameter(Mandatory = $true)] [string] $InputPath,
  [Parameter(Mandatory = $true)] [string] $OutputPath
)

Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path -LiteralPath $InputPath).Path
$destinationPath = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputPath))
$source = [System.Drawing.Bitmap]::FromFile($sourcePath)
$result = New-Object System.Drawing.Bitmap $source.Width, $source.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

try {
  for ($y = 0; $y -lt $source.Height; $y++) {
    for ($x = 0; $x -lt $source.Width; $x++) {
      $pixel = $source.GetPixel($x, $y)
      $greenExcess = $pixel.G - [Math]::Max($pixel.R, $pixel.B)

      if ($greenExcess -le 12) {
        $result.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $pixel.R, $pixel.G, $pixel.B))
        continue
      }

      $alpha = [Math]::Max(0, [Math]::Min(255, [Math]::Round(255 * (1 - (($greenExcess - 12) / 180)))))
      $despilledGreen = [Math]::Min($pixel.G, [Math]::Max($pixel.R, $pixel.B))
      $result.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $pixel.R, $despilledGreen, $pixel.B))
    }
  }

  $result.Save($destinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
  $result.Dispose()
  $source.Dispose()
}
