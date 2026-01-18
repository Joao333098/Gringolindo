#!/usr/bin/env python3
"""
🚀 GRINGOLINDO - Sistema de Inicialização Automática
Discord Bot Admin Panel - Instalação e Deploy Simplificado

Este script automatiza:
1. Instalação de dependências Python (backend)
2. Instalação de dependências Node.js (bot Discord + frontend)
3. Inicialização de todos os serviços com configurações personalizáveis

Uso:
    python3 inicia.py                    # Modo padrão (localhost)
    python3 inicia.py --host 0.0.0.0     # Expor para rede
    python3 inicia.py --port 8080        # Porta customizada
    python3 inicia.py --install-only     # Apenas instalar dependências
    python3 inicia.py --no-frontend      # Sem frontend (apenas backend + bot)
    python3 inicia.py --no-bot           # Sem bot Discord (apenas backend + frontend)

Desenvolvido por: E1 Agent - Emergent Labs
"""

import subprocess
import sys
import os
import json
import argparse
import time
import signal
from pathlib import Path
from typing import Optional, List

# Cores para terminal
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_banner():
    """Exibe banner do sistema"""
    banner = f"""
{Colors.HEADER}{Colors.BOLD}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 GRINGOLINDO - Discord Bot Admin Panel              ║
║                                                           ║
║   Sistema de Deploy Automático                           ║
║   Versão 2.0 - Completo e Otimizado                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
{Colors.ENDC}
"""
    print(banner)

def log_info(message: str):
    """Log de informação"""
    print(f"{Colors.OKBLUE}ℹ️  {message}{Colors.ENDC}")

def log_success(message: str):
    """Log de sucesso"""
    print(f"{Colors.OKGREEN}✅ {message}{Colors.ENDC}")

def log_warning(message: str):
    """Log de aviso"""
    print(f"{Colors.WARNING}⚠️  {message}{Colors.ENDC}")

def log_error(message: str):
    """Log de erro"""
    print(f"{Colors.FAIL}❌ {message}{Colors.ENDC}")

def log_step(step: int, total: int, message: str):
    """Log de etapa"""
    print(f"\n{Colors.OKCYAN}{Colors.BOLD}[{step}/{total}] {message}{Colors.ENDC}")

def run_command(command: str, cwd: Optional[str] = None, shell: bool = True) -> bool:
    """
    Executa comando no shell e retorna sucesso/falha
    
    Args:
        command: Comando a ser executado
        cwd: Diretório de trabalho
        shell: Se deve usar shell
        
    Returns:
        True se sucesso, False se falha
    """
    try:
        log_info(f"Executando: {command}")
        result = subprocess.run(
            command,
            shell=shell,
            cwd=cwd,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return True
    except subprocess.CalledProcessError as e:
        log_error(f"Erro ao executar comando: {e.stderr}")
        return False

def check_python():
    """Verifica se Python está instalado"""
    log_step(1, 7, "Verificando Python...")
    try:
        version = subprocess.check_output([sys.executable, "--version"], text=True)
        log_success(f"Python encontrado: {version.strip()}")
        return True
    except Exception as e:
        log_error(f"Python não encontrado: {e}")
        return False

def check_node():
    """Verifica se Node.js está instalado"""
    log_step(2, 7, "Verificando Node.js...")
    try:
        version = subprocess.check_output(["node", "--version"], text=True)
        log_success(f"Node.js encontrado: {version.strip()}")
        return True
    except Exception as e:
        log_error(f"Node.js não encontrado: {e}")
        log_warning("Instale Node.js: https://nodejs.org/")
        return False

def install_backend_dependencies():
    """Instala dependências do backend Python"""
    log_step(3, 7, "Instalando dependências do Backend (Python)...")
    
    backend_path = Path("backend")
    requirements_file = backend_path / "requirements.txt"
    
    if not requirements_file.exists():
        log_error(f"Arquivo {requirements_file} não encontrado!")
        return False
    
    # Tentar pip3 primeiro, depois pip
    pip_commands = ["pip3", "pip"]
    
    for pip_cmd in pip_commands:
        try:
            subprocess.check_output([pip_cmd, "--version"], stderr=subprocess.STDOUT)
            log_info(f"Usando {pip_cmd}...")
            
            if run_command(
                f"{pip_cmd} install -r requirements.txt",
                cwd=str(backend_path)
            ):
                log_success("Dependências do backend instaladas com sucesso!")
                return True
        except:
            continue
    
    log_error("Não foi possível instalar dependências do backend")
    return False

def install_bot_dependencies():
    """Instala dependências do bot Discord (Node.js)"""
    log_step(4, 7, "Instalando dependências do Bot Discord (Node.js)...")
    
    package_file = Path("package.json")
    
    if not package_file.exists():
        log_error("package.json não encontrado na raiz!")
        return False
    
    # Tentar npm primeiro, depois yarn
    if run_command("npm install"):
        log_success("Dependências do bot instaladas com sucesso!")
        return True
    elif run_command("yarn install"):
        log_success("Dependências do bot instaladas com sucesso!")
        return True
    else:
        log_error("Não foi possível instalar dependências do bot")
        return False

def install_frontend_dependencies():
    """Instala dependências do frontend React"""
    log_step(5, 7, "Instalando dependências do Frontend (React)...")
    
    frontend_path = Path("frontend")
    package_file = frontend_path / "package.json"
    
    if not package_file.exists():
        log_error(f"Arquivo {package_file} não encontrado!")
        return False
    
    # Tentar yarn primeiro (recomendado), depois npm
    if run_command("yarn install", cwd=str(frontend_path)):
        log_success("Dependências do frontend instaladas com sucesso!")
        return True
    elif run_command("npm install", cwd=str(frontend_path)):
        log_success("Dependências do frontend instaladas com sucesso!")
        return True
    else:
        log_error("Não foi possível instalar dependências do frontend")
        return False

def create_config_if_needed():
    """Cria config.json se não existir"""
    config_file = Path("config.json")
    
    if not config_file.exists():
        log_warning("config.json não encontrado, criando arquivo padrão...")
        
        default_config = {
            "token": "SEU_TOKEN_DISCORD_AQUI",
            "clientId": "SEU_CLIENT_ID_AQUI",
            "guildId": "SEU_GUILD_ID_AQUI"
        }
        
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(default_config, f, indent=2, ensure_ascii=False)
        
        log_success("config.json criado! Configure o token do Discord antes de iniciar o bot.")

def start_backend(host: str = "0.0.0.0", port: int = 8001):
    """Inicia o backend FastAPI"""
    log_step(6, 7, f"Iniciando Backend (FastAPI) em {host}:{port}...")
    
    backend_path = Path("backend")
    server_file = backend_path / "server.py"
    
    if not server_file.exists():
        log_error(f"Arquivo {server_file} não encontrado!")
        return None
    
    try:
        # Modificar temporariamente o server.py para usar host/port customizados
        process = subprocess.Popen(
            [sys.executable, "-c", f"""
import sys
sys.path.insert(0, '{backend_path.absolute()}')
import uvicorn
from server import app
uvicorn.run(app, host='{host}', port={port})
"""],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        time.sleep(2)  # Aguardar inicialização
        
        if process.poll() is None:
            log_success(f"Backend rodando em http://{host}:{port}")
            log_info(f"Documentação API: http://{host}:{port}/docs")
            return process
        else:
            log_error("Backend falhou ao iniciar")
            return None
            
    except Exception as e:
        log_error(f"Erro ao iniciar backend: {e}")
        return None

def start_bot():
    """Inicia o bot Discord"""
    log_info("Iniciando Bot Discord...")
    
    index_file = Path("index.js")
    
    if not index_file.exists():
        log_error("index.js não encontrado!")
        return None
    
    # Verificar se token está configurado
    config_file = Path("config.json")
    if config_file.exists():
        with open(config_file, 'r') as f:
            config = json.load(f)
            if config.get('token') == 'SEU_TOKEN_DISCORD_AQUI':
                log_warning("Token do Discord não configurado em config.json!")
                log_warning("O bot não será iniciado. Configure o token e reinicie.")
                return None
    
    try:
        process = subprocess.Popen(
            ["node", "index.js"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        time.sleep(2)  # Aguardar inicialização
        
        if process.poll() is None:
            log_success("Bot Discord iniciado com sucesso!")
            return process
        else:
            log_error("Bot Discord falhou ao iniciar")
            return None
            
    except Exception as e:
        log_error(f"Erro ao iniciar bot: {e}")
        return None

def start_frontend():
    """Inicia o frontend React"""
    log_step(7, 7, "Iniciando Frontend (React)...")
    
    frontend_path = Path("frontend")
    
    try:
        # Tentar yarn primeiro, depois npm
        commands = [
            ["yarn", "start"],
            ["npm", "start"]
        ]
        
        for cmd in commands:
            try:
                process = subprocess.Popen(
                    cmd,
                    cwd=str(frontend_path),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                
                time.sleep(3)  # Aguardar inicialização
                
                if process.poll() is None:
                    log_success("Frontend rodando em http://localhost:3000")
                    return process
            except:
                continue
        
        log_error("Frontend falhou ao iniciar")
        return None
        
    except Exception as e:
        log_error(f"Erro ao iniciar frontend: {e}")
        return None

def handle_shutdown(processes: List):
    """Encerra todos os processos graciosamente"""
    log_info("\nEncerrando serviços...")
    
    for process in processes:
        if process and process.poll() is None:
            try:
                process.terminate()
                process.wait(timeout=5)
            except:
                process.kill()
    
    log_success("Todos os serviços foram encerrados.")
    sys.exit(0)

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description="🚀 Gringolindo - Sistema de Deploy Automático"
    )
    parser.add_argument(
        "--host",
        default="0.0.0.0",
        help="Host do backend (padrão: 0.0.0.0)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8001,
        help="Porta do backend (padrão: 8001)"
    )
    parser.add_argument(
        "--install-only",
        action="store_true",
        help="Apenas instalar dependências, sem iniciar serviços"
    )
    parser.add_argument(
        "--no-frontend",
        action="store_true",
        help="Não iniciar o frontend"
    )
    parser.add_argument(
        "--no-bot",
        action="store_true",
        help="Não iniciar o bot Discord"
    )
    
    args = parser.parse_args()
    
    print_banner()
    
    # Lista de processos ativos
    processes = []
    
    # Verificações iniciais
    if not check_python():
        sys.exit(1)
    
    if not check_node():
        sys.exit(1)
    
    # Instalação de dependências
    if not install_backend_dependencies():
        log_error("Falha ao instalar dependências do backend")
        sys.exit(1)
    
    if not args.no_bot:
        if not install_bot_dependencies():
            log_warning("Continuando sem bot Discord...")
    
    if not args.no_frontend:
        if not install_frontend_dependencies():
            log_warning("Continuando sem frontend...")
    
    # Criar config se necessário
    create_config_if_needed()
    
    log_success("\n✨ Todas as dependências foram instaladas com sucesso!\n")
    
    # Se for apenas instalação, parar aqui
    if args.install_only:
        log_info("Modo --install-only ativado. Dependências instaladas.")
        log_info("\nPara iniciar os serviços, execute:")
        log_info(f"  python3 inicia.py --host {args.host} --port {args.port}")
        return
    
    # Iniciar serviços
    print(f"\n{Colors.BOLD}{Colors.HEADER}Iniciando serviços...{Colors.ENDC}\n")
    
    # Backend (sempre necessário)
    backend_process = start_backend(args.host, args.port)
    if backend_process:
        processes.append(backend_process)
    else:
        log_error("Backend é essencial. Encerrando...")
        sys.exit(1)
    
    # Bot Discord (opcional)
    if not args.no_bot:
        bot_process = start_bot()
        if bot_process:
            processes.append(bot_process)
    
    # Frontend (opcional)
    if not args.no_frontend:
        frontend_process = start_frontend()
        if frontend_process:
            processes.append(frontend_process)
    
    # Resumo
    print(f"\n{Colors.BOLD}{Colors.OKGREEN}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.OKGREEN}🎉 Sistema iniciado com sucesso!{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.OKGREEN}{'='*60}{Colors.ENDC}\n")
    
    print(f"{Colors.BOLD}📊 Serviços ativos:{Colors.ENDC}")
    print(f"  • Backend API: http://{args.host}:{args.port}")
    print(f"  • Documentação: http://{args.host}:{args.port}/docs")
    
    if not args.no_frontend:
        print(f"  • Frontend: http://localhost:3000")
    
    if not args.no_bot:
        print(f"  • Bot Discord: Ativo")
    
    print(f"\n{Colors.WARNING}Pressione Ctrl+C para encerrar todos os serviços{Colors.ENDC}\n")
    
    # Configurar handler para Ctrl+C
    signal.signal(signal.SIGINT, lambda s, f: handle_shutdown(processes))
    signal.signal(signal.SIGTERM, lambda s, f: handle_shutdown(processes))
    
    # Manter script rodando
    try:
        while True:
            time.sleep(1)
            # Verificar se algum processo morreu
            for process in processes:
                if process.poll() is not None:
                    log_error("Um dos serviços foi encerrado inesperadamente!")
                    handle_shutdown(processes)
    except KeyboardInterrupt:
        handle_shutdown(processes)

if __name__ == "__main__":
    main()
