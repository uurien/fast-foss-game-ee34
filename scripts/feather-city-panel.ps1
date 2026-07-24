param(
  [Parameter(Mandatory = $true)] [string] $InputPath,
  [Parameter(Mandatory = $true)] [string] $OutputPath,
  [int] $FeatherWidth = 128
)

Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path -LiteralPath $InputPath).Path
$destinationPath = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputPath))
$source = [System.Drawing.Bitmap]::FromFile($sourcePath)
$result = New-Object System.Drawing.Bitmap $source.Width, $source.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$feather = [Math]::Max(1, [Math]::Min($FeatherWidth, [Math]::Floor($source.Width / 4)))

try {
  for ($y = 0; $y -lt $source.Height; $y++) {
    for ($x = 0; $x -lt $source.Width; $x++) {
      $pixel = $source.GetPixel($x, $y)
      $leftFactor = [Math]::Min(1, $x / $feather)
      $rightFactor = [Math]::Min(1, ($source.Width - 1 - $x) / $feather)
      $edgeFactor = [Math]::Min($leftFactor, $rightFactor)
      $alpha = [Math]::Round($pixel.A * $edgeFactor)
      $result.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $pixel.R, $pixel.G, $pixel.B))
    }
  }

  $result.Save($destinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
  $result.Dispose()
  $source.Dispose()
}
