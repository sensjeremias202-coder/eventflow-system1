# Start development environment script for EventFlow
# - Verifica se node/npm existem
# - Instala dependências (npm install)
# - Inicia http-server (npm start)
# - Inicia Electron apontando para a URL do servidor (npm run start:electron)

param(
    [string]$Port = '8080'
)

function Check-Command {
    param(
        [string]$cmd
    )
    $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

Write-Host "Starting EventFlow dev environment..." -ForegroundColor Cyan

if (-not (Check-Command node)) {
    Write-Warning "Node.js não foi encontrado no PATH. Por favor, instale Node.js (https://nodejs.org) ou execute 'choco install nodejs' se tiver Chocolatey. Script encerrado.";
    exit 1
}

if (-not (Check-Command npm)) {
    Write-Warning "npm não foi encontrado no PATH. Node.js inclui npm. Instale Node.js e reexecute o script.";
    exit 1
}

## Diretório raiz do repositório (pai do diretório scripts)
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot



























Write-Host "Instalando dependências (npm install)..." -NoNewline
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Warning "npm install falhou. Verifique erros acima.";
    exit $LASTEXITCODE
}
Write-Host " OK" -ForegroundColor Green

# Iniciar http-server em nova janela do PowerShell
Write-Host "Iniciando servidor local (npm start) na porta $Port..." -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command cd \"$repoRoot\"; npm start" -WindowStyle Normal

# Aguardar um pouco para garantir que o servidor subiu antes de abrir o Electron (timeout 3s)
Start-Sleep -Seconds 3

# Setar a variável de ambiente para apontar o Electron para a URL do servidor de desenvolvimento
$env:ELECTRON_START_URL = "http://localhost:$Port"

Write-Host "Iniciando Electron apontando para http://localhost:$Port" -ForegroundColor Cyan
npm run start:electron

Write-Host "Electron finalizado (ou iniciou em primeiro plano)." -ForegroundColor Green

# Fim do script
