Add-Type -AssemblyName System.Drawing
$basePath = Join-Path $PWD 'public/assets/begitxo-poses-6-green.png'
$clothesPath = Join-Path $PWD 'public/assets/begitxo-poses-6-green-hawaiian.png'
$outPath = Join-Path $PWD 'public/assets/begitxo-poses-6-green-hawaiian-exact.png'
$base = [System.Drawing.Bitmap]::new($basePath)
$clothes = [System.Drawing.Bitmap]::new($clothesPath)
$result = [System.Drawing.Bitmap]::new($base)
$regions = @(
  @(195,245,385,385), @(640,245,865,390), @(1115,245,1355,400),
  @(180,695,390,875), @(635,690,875,850), @(1190,730,1355,900)
)
$selected = New-Object 'bool[,]' $base.Width,$base.Height
foreach ($box in $regions) {
  for ($y=$box[1]; $y -lt $box[3]; $y++) { for ($x=$box[0]; $x -lt $box[2]; $x++) {
    $w=$clothes.GetPixel($x,$y); $b=$base.GetPixel($x,$y)
    $delta=[math]::Abs($w.R-$b.R)+[math]::Abs($w.G-$b.G)+[math]::Abs($w.B-$b.B)
    if ($w.B -gt 95 -and $w.B -gt ($w.R*1.18) -and $delta -gt 70) { $selected[$x,$y]=$true }
  }}
}
# Expand four pixels to retain garment outlines and floral motifs.
$mask = New-Object 'bool[,]' $base.Width,$base.Height
foreach ($box in $regions) {
  for ($y=$box[1]; $y -lt $box[3]; $y++) { for ($x=$box[0]; $x -lt $box[2]; $x++) {
    $hit=$false
    for ($dy=-4; $dy -le 4 -and -not $hit; $dy++) { for ($dx=-4; $dx -le 4; $dx++) {
      $xx=$x+$dx; $yy=$y+$dy
      if ($xx -ge 0 -and $yy -ge 0 -and $xx -lt $base.Width -and $yy -lt $base.Height -and $selected[$xx,$yy]) { $hit=$true; break }
    }}
    if ($hit) { $mask[$x,$y]=$true; $result.SetPixel($x,$y,$clothes.GetPixel($x,$y)) }
  }}
}
$result.Save($outPath,[System.Drawing.Imaging.ImageFormat]::Png)
$base.Dispose(); $clothes.Dispose(); $result.Dispose()
Write-Output $outPath
