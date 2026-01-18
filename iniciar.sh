#!/bin/bash
# ======================================
# GRINGOLINDO - Script de Início Linux/Mac
# ======================================

echo ""
echo "========================================"
echo "  GRINGOLINDO - Iniciando Sistema"
echo "========================================"
echo ""

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "[ERRO] Python3 não encontrado!"
    echo "Instale Python: https://www.python.org/downloads/"
    exit 1
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "[ERRO] Node.js não encontrado!"
    echo "Instale Node.js: https://nodejs.org/"
    exit 1
fi

echo "[OK] Python e Node.js encontrados!"
echo ""

# Executar script de inicialização
python3 inicia.py "$@"
