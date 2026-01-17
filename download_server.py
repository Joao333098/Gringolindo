#!/usr/bin/env python3
import http.server
import socketserver
import os
import signal
import sys
from pathlib import Path

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_GET(self):
        if self.path == '/':
            self.path = '/download.html'
        return super().do_GET()

def signal_handler(sig, frame):
    print('\n🛑 Servidor encerrado pelo usuário')
    sys.exit(0)

if __name__ == "__main__":
    PORT = 8080
    
    # Verificar se os arquivos existem
    if not os.path.exists('gradianet-completo.zip'):
        print("❌ Arquivo gradianet-completo.zip não encontrado!")
        sys.exit(1)
    
    if not os.path.exists('download.html'):
        print("❌ Arquivo download.html não encontrado!")
        sys.exit(1)
    
    # Configurar handler de sinal para encerrar graciosamente
    signal.signal(signal.SIGINT, signal_handler)
    
    # Iniciar servidor
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"🌐 Servidor de download iniciado!")
        print(f"📍 Acesse: http://localhost:{PORT}")
        print(f"💾 Download direto: http://localhost:{PORT}/gradianet-completo.zip")
        print(f"⚡ Pressione Ctrl+C para parar")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n🛑 Servidor encerrado!')