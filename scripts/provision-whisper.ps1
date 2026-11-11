param([string]$WhisperCliDirectory)

$ErrorActionPreference = 'Stop'
$destination = Join-Path $PSScriptRoot '../resources/whisper'
New-Item -ItemType Directory -Force -Path $destination | Out-Null

if ($WhisperCliDirectory) {
  $source = (Resolve-Path -LiteralPath $WhisperCliDirectory).Path
  if (!(Test-Path -LiteralPath (Join-Path $source 'whisper-cli.exe') -PathType Leaf)) {
    throw 'Informe a pasta que contém whisper-cli.exe e suas DLLs.'
  }
  Get-ChildItem -LiteralPath $source -File |
    Where-Object { $_.Name -eq 'whisper-cli.exe' -or $_.Extension -eq '.dll' } |
    ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $destination -Force }
} else {
  $archivePath = Join-Path $destination ("runtime-" + [guid]::NewGuid() + ".zip")
  try {
    $runtimeUrl = 'https://github.com/ggml-org/whisper.cpp/releases/download/v1.8.4/whisper-bin-x64.zip'
    $runtimeHash = '74f973345cb52ef5ba3ec9e7e7af8e48cc8c71722d1528603b80588a11f82e3e'
    Invoke-WebRequest -Uri $runtimeUrl -OutFile $archivePath -TimeoutSec 180
    if ((Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash -ne $runtimeHash) {
      throw 'O hash do runtime Whisper não corresponde ao publicado.'
    }

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [IO.Compression.ZipFile]::OpenRead($archivePath)
    try {
      $cli = $archive.Entries | Where-Object { $_.Name -eq 'whisper-cli.exe' } | Select-Object -First 1
      if (!$cli) { throw 'O runtime Whisper não contém whisper-cli.exe.' }
      $folder = [IO.Path]::GetDirectoryName($cli.FullName)
      $archive.Entries |
        Where-Object {
          [IO.Path]::GetDirectoryName($_.FullName) -eq $folder -and
          ($_.Name -eq 'whisper-cli.exe' -or $_.Name -like '*.dll')
        } |
        ForEach-Object {
          [IO.Compression.ZipFileExtensions]::ExtractToFile($_, (Join-Path $destination $_.Name), $true)
        }
    } finally {
      $archive.Dispose()
    }
  } finally {
    if (Test-Path -LiteralPath $archivePath) { Remove-Item -LiteralPath $archivePath }
  }
}
$model = Join-Path $destination 'ggml-tiny.bin'
$expectedHash = 'be07e048e1e599ad46341c8d2a135645097a538221678b7acdd1b1919c6e1b21'
if (!(Test-Path -LiteralPath $model -PathType Leaf) -or
    (Get-FileHash -LiteralPath $model -Algorithm SHA256).Hash -ne $expectedHash) {
  $pending = Join-Path $destination ("model-" + [guid]::NewGuid() + ".part")
  try {
    $modelUrl = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/80da2d8bfee42b0e836fc3a9890373e5defc00a6/ggml-tiny.bin'
    Invoke-WebRequest -Uri $modelUrl -OutFile $pending -TimeoutSec 180
    if ((Get-FileHash -LiteralPath $pending -Algorithm SHA256).Hash -ne $expectedHash) {
      throw 'O hash do modelo Whisper Tiny não corresponde ao publicado.'
    }
    Move-Item -LiteralPath $pending -Destination $model -Force
  } finally {
    if (Test-Path -LiteralPath $pending) { Remove-Item -LiteralPath $pending }
  }
}


