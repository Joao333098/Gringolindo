#!/usr/bin/env python3
"""
Gringolindo - Discord Bot Admin Panel
Arquivo principal para deploy em hosting (Gratian.pro)

Este arquivo inicia o backend FastAPI na porta configurada.
Para desenvolvimento local, use: python3 inicia.py
"""

import os
import sys
import uvicorn
from pathlib import Path

# Adicionar diretório backend ao path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Importar app do servidor
from server import app

# Configurações
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 27687))

if __name__ == "__main__":
    print(f"🚀 Iniciando Gringolindo Admin Panel")
    print(f"📡 Host: {HOST}")
    print(f"🔌 Porta: {PORT}")
    print(f"📚 Documentação: http://{HOST}:{PORT}/docs")
    print(f"❤️  Health Check: http://{HOST}:{PORT}/health")
    print("-" * 50)
    
    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        log_level="info"
    )
