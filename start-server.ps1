# ============================================
# SERVIDOR HTTP LOCAL PARA EVENTFLOW SYSTEM
# ============================================
# Este script inicia um servidor HTTP local na porta 8000
# para evitar problemas de CORS ao abrir o projeto

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   EventFlow System - Servidor Local" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Iniciando servidor HTTP na porta 8000..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Acesse: http://localhost:8000/index.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Para parar o servidor, pressione Ctrl+C" -ForegroundColor Red
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Python está instalado
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
}

if ($pythonCmd) {
    Write-Host "✅ Python encontrado!" -ForegroundColor Green
    Write-Host ""
    
    # Iniciar servidor HTTP Python
    & $pythonCmd -m http.server 8000
} else {
    Write-Host "❌ Python não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instale Python em: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternativas:" -ForegroundColor Cyan
    Write-Host "1. Instale a extensão 'Live Server' no VS Code" -ForegroundColor White
    Write-Host "2. Use Node.js: npm install -g http-server && http-server" -ForegroundColor White
    Write-Host ""
    pause
}
