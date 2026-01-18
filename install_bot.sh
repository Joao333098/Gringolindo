#!/bin/bash
# Script para instalar dependências do bot Discord
# Executado automaticamente pelo main.py

echo "📦 Instalando dependências do Bot Discord..."

# Verificar se npm está disponível
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado! Instale Node.js primeiro."
    exit 1
fi

# Instalar dependências
npm install --production

echo "✅ Dependências instaladas com sucesso!"
