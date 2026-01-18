#!/usr/bin/env python3
"""
Gringolindo - Discord Bot Admin Panel
Arquivo principal para deploy em hosting (Gratian.pro)

Este arquivo inicia o backend FastAPI e o bot Discord simultaneamente.
Para desenvolvimento local, use: python3 inicia.py
"""

import os
import sys
import subprocess
import signal
import time
import uvicorn
from pathlib import Path
import threading

# Adicionar diretório backend ao path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Importar app do servidor
from server import app

# Configurações
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 27687))
PROJECT_DIR = Path(__file__).parent

# Processo do bot Discord
bot_process = None

def start_discord_bot():
    """Inicia o bot Discord em um processo separado"""
    global bot_process
    
    print("🤖 Iniciando Bot Discord...")
    
    try:
        # Verificar se node_modules existe
        node_modules = PROJECT_DIR / "node_modules"
        if not node_modules.exists():
            print("📦 Instalando dependências do bot...")
            subprocess.run(["npm", "install"], cwd=str(PROJECT_DIR), check=True)
        
        # Iniciar bot Discord
        bot_process = subprocess.Popen(
            ["node", "index.js"],
            cwd=str(PROJECT_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        print(f"✅ Bot Discord iniciado (PID: {bot_process.pid})")
        
        # Thread para monitorar saída do bot
        def monitor_bot():
            for line in bot_process.stdout:
                print(f"[BOT] {line.strip()}")
        
        bot_thread = threading.Thread(target=monitor_bot, daemon=True)
        bot_thread.start()
        
    except Exception as e:
        print(f"❌ Erro ao iniciar bot Discord: {e}")
        print("⚠️  O backend continuará funcionando sem o bot")

def stop_discord_bot():
    """Para o bot Discord"""
    global bot_process
    if bot_process:
        print("🛑 Parando Bot Discord...")
        bot_process.terminate()
        try:
            bot_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            bot_process.kill()
        print("✅ Bot Discord parado")

def signal_handler(sig, frame):
    """Handler para sinais de término"""
    print("\n🛑 Recebido sinal de término...")
    stop_discord_bot()
    sys.exit(0)

# Registrar handlers de sinal
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 GRINGOLINDO ADMIN PANEL")
    print("=" * 60)
    print(f"📡 Host: {HOST}")
    print(f"🔌 Porta: {PORT}")
    print(f"📚 Documentação: http://{HOST}:{PORT}/docs")
    print(f"❤️  Health Check: http://{HOST}:{PORT}/health")
    print("=" * 60)
    
    # Iniciar bot Discord em thread separada
    bot_thread = threading.Thread(target=start_discord_bot, daemon=True)
    bot_thread.start()
    
    # Aguardar um pouco para o bot iniciar
    time.sleep(2)
    
    print("🌐 Iniciando Backend FastAPI...")
    print("-" * 60)
    
    try:
        # Iniciar servidor FastAPI
        uvicorn.run(
            app,
            host=HOST,
            port=PORT,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 Encerrando...")
    finally:
        stop_discord_bot()
