$ErrorActionPreference = 'Stop'
$portfolioRoot = $PSScriptRoot
$nodeRuntime = Get-Command node -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source
if (-not $nodeRuntime) {
    $primaryRuntime = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    if (Test-Path -LiteralPath $primaryRuntime) { $nodeRuntime = $primaryRuntime }
}
if (-not $nodeRuntime) {
    $runtimeRoot = Join-Path $env:LOCALAPPDATA 'OpenAI\Codex\runtimes\cua_node'
    if (Test-Path -LiteralPath $runtimeRoot) {
        $nodeRuntime = Get-ChildItem -LiteralPath $runtimeRoot -Filter node.exe -Recurse -File | Select-Object -First 1 -ExpandProperty FullName
    }
}
if (-not $nodeRuntime) { throw 'Node.js is required to serve this portfolio.' }
& $nodeRuntime (Join-Path $portfolioRoot 'serve.mjs') (Join-Path $portfolioRoot 'dist')
