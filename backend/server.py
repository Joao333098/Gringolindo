from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import json
import os
import hashlib
import jwt
from datetime import datetime, timedelta, timezone
import subprocess
import uuid
import requests
import asyncio

app = FastAPI(title="Discord Bot Admin Panel")

security = HTTPBearer()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
JWT_SECRET = "2210DORRY90_SECRET_KEY_VOVO"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Models
class LoginRequest(BaseModel):
    username: str
    password: str

class BotTokenConfig(BaseModel):
    token: str

class TicketConfig(BaseModel):
    categoria_id: str
    logs_id: str
    entrega_canal_id: Optional[str] = None

class CargoConfig(BaseModel):
    cliente_id: str
    membro_id: str

class SaldoAdd(BaseModel):
    user_id: str
    valor: float
    descricao: Optional[str] = None

class SaldoRemove(BaseModel):
    user_id: str
    valor: float
    motivo: Optional[str] = None

class PaymentConfig(BaseModel):
    mp_token: Optional[str] = None
    sms_api_key: Optional[str] = None

# Authentication functions
def hash_password(password: str) -> str:
    return hashlib.sha256(f"{password}_VOVO_SALT".encode()).hexdigest()

def verify_credentials(username: str, password: str) -> bool:
    return username == "vovo" and hash_password(password) == hash_password("2210DORRY90")

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        if username != "vovo":
            raise HTTPException(status_code=401, detail="Token inválido")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# Database helpers
def read_json_file(filepath: str) -> Dict:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def write_json_file(filepath: str, data: Dict) -> None:
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

async def get_discord_user_info(user_id: str, bot_token: str) -> Dict:
    """Busca informações do usuário no Discord incluindo avatar"""
    try:
        headers = {
            'Authorization': f'Bot {bot_token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(
            f'https://discord.com/api/v10/users/{user_id}',
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            user_data = response.json()
            avatar_hash = user_data.get('avatar')
            
            # Construir URL do avatar
            if avatar_hash:
                avatar_url = f"https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png?size=128"
            else:
                # Avatar padrão
                discriminator = user_data.get('discriminator', '0000')
                default_avatar_id = int(discriminator) % 5
                avatar_url = f"https://cdn.discordapp.com/embed/avatars/{default_avatar_id}.png"
            
            return {
                'id': user_data.get('id'),
                'username': user_data.get('username', 'Unknown'),
                'discriminator': user_data.get('discriminator', '0000'),
                'global_name': user_data.get('global_name'),
                'avatar_url': avatar_url
            }
    except Exception as e:
        print(f"Erro ao buscar usuário {user_id}: {e}")
    
    return {
        'id': user_id,
        'username': 'Usuário Desconhecido',
        'discriminator': '0000',
        'global_name': None,
        'avatar_url': 'https://cdn.discordapp.com/embed/avatars/0.png'
    }

def get_bot_stats() -> Dict:
    config = read_json_file("/app/DataBaseJson/config.json")
    saldo_data = read_json_file("/app/DataBaseJson/saldo.json")
    historico = read_json_file("/app/DataBaseJson/historico.json")
    
    stats = config.get("estatisticas", {})
    
    # Contar usuários com saldo > 0
    users_with_balance = len([user for user, balance in saldo_data.items() if balance > 0])
    total_users = len(saldo_data)
    total_balance = sum(saldo_data.values())
    
    return {
        "vendas_totais": stats.get("vendas_totais", 0),
        "faturamento": stats.get("faturamento", 0.0),
        "tickets_criados": stats.get("tickets_criados", 0),
        "usuarios_total": total_users,
        "usuarios_com_saldo": users_with_balance,
        "saldo_total_sistema": total_balance,
        "sms_saldo": config.get("sms24h", {}).get("saldo", 0),
        "status": "online"
    }

async def check_discord_bot_status(token: str) -> Dict:
    """Verifica se o bot Discord está realmente online"""
    try:
        headers = {
            'Authorization': f'Bot {token}',
            'Content-Type': 'application/json'
        }
        
        # Fazer uma requisição para a API do Discord para verificar o bot
        response = requests.get(
            'https://discord.com/api/v10/users/@me',
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            bot_data = response.json()
            
            # Verificar se o bot está em servidores
            guilds_response = requests.get(
                'https://discord.com/api/v10/users/@me/guilds',
                headers=headers,
                timeout=10
            )
            
            guild_count = 0
            total_members = 0
            if guilds_response.status_code == 200:
                guilds = guilds_response.json()
                guild_count = len(guilds)
                
                # Somar membros de todos os servidores
                for guild in guilds:
                    total_members += guild.get('approximate_member_count', 0)
            
            return {
                'status': 'online',
                'bot_name': bot_data.get('username', 'Unknown'),
                'bot_id': bot_data.get('id', ''),
                'guilds': guild_count,
                'total_members': total_members,
                'lastSeen': datetime.now(timezone.utc).isoformat()
            }
        elif response.status_code == 401:
            return {
                'status': 'error',
                'message': 'Token inválido ou expirado',
                'guilds': 0,
                'total_members': 0,
                'lastSeen': None
            }
        else:
            return {
                'status': 'error',
                'message': f'Erro na API do Discord: {response.status_code}',
                'guilds': 0,
                'total_members': 0,
                'lastSeen': None
            }
            
    except requests.exceptions.Timeout:
        return {
            'status': 'error',
            'message': 'Timeout ao conectar com Discord',
            'guilds': 0,
            'total_members': 0,
            'lastSeen': None
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Erro de conexão: {str(e)}',
            'guilds': 0,
            'total_members': 0,
            'lastSeen': None
        }

def restart_discord_bot() -> bool:
    """Reinicia o processo do bot Discord"""
    try:
        # Primeiro, tentar parar o processo atual do bot (se estiver rodando)
        result = subprocess.run(['pkill', '-f', 'node.*index.js'], capture_output=True)
        
        # Aguardar um pouco
        import time
        time.sleep(2)
        
        # Iniciar o bot novamente em background
        subprocess.Popen(
            ['node', 'index.js'],
            cwd='/app',
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        return True
    except Exception as e:
        print(f"Erro ao reiniciar bot: {e}")
        return False

# Routes
@app.post("/api/auth/login")
async def login(request: LoginRequest):
    if not verify_credentials(request.username, request.password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    access_token = create_access_token(data={"sub": request.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": JWT_EXPIRATION_HOURS * 3600
    }

@app.get("/api/auth/verify")
async def verify_auth(current_user: str = Depends(verify_token)):
    return {"valid": True, "user": current_user}

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: str = Depends(verify_token)):
    stats = get_bot_stats()
    
    # Verificar status real do bot
    config = read_json_file("/app/config.json")
    token = config.get("token", "")
    
    if token:
        bot_status = await check_discord_bot_status(token)
        stats["bot_status"] = bot_status["status"]
        stats["bot_guilds"] = bot_status.get("guilds", 0)
        stats["total_members"] = bot_status.get("total_members", 0)
    else:
        stats["bot_status"] = "error"
        stats["bot_guilds"] = 0
        stats["total_members"] = 0
    
    return stats

@app.get("/api/users/with-balance")
async def get_users_with_balance(current_user: str = Depends(verify_token)):
    saldo_data = read_json_file("/app/DataBaseJson/saldo.json")
    config = read_json_file("/app/config.json")
    bot_token = config.get("token", "")
    
    users_with_balance = []
    
    # Filtrar apenas usuários com saldo > 0
    for user_id, balance in saldo_data.items():
        if balance > 0:
            # Buscar informações do usuário no Discord
            if bot_token:
                user_info = await get_discord_user_info(user_id, bot_token)
            else:
                user_info = {
                    'id': user_id,
                    'username': 'Token não configurado',
                    'discriminator': '0000',
                    'global_name': None,
                    'avatar_url': 'https://cdn.discordapp.com/embed/avatars/0.png'
                }
            
            users_with_balance.append({
                'user_id': user_id,
                'balance': balance,
                'username': user_info['username'],
                'discriminator': user_info['discriminator'],
                'global_name': user_info['global_name'],
                'avatar_url': user_info['avatar_url']
            })
    
    # Ordenar por saldo (maior primeiro)
    users_with_balance.sort(key=lambda x: x['balance'], reverse=True)
    
    return {
        'users': users_with_balance[:20],  # Últimos 20
        'total_users_with_balance': len(users_with_balance),
        'total_balance': sum([u['balance'] for u in users_with_balance])
    }

@app.get("/api/bot/status")
async def get_bot_status(current_user: str = Depends(verify_token)):
    config = read_json_file("/app/config.json")
    token = config.get("token", "")
    
    if not token:
        return {
            "status": "error",
            "message": "Token do bot não configurado",
            "lastSeen": None
        }
    
    return await check_discord_bot_status(token)

@app.get("/api/config/bot")
async def get_bot_config(current_user: str = Depends(verify_token)):
    config = read_json_file("/app/config.json")
    token = config.get("token", "")
    
    # Mostrar apenas parte do token por segurança
    display_token = ""
    if token and len(token) > 20:
        display_token = token[:20] + "..."
    
    return {"token": display_token}

@app.post("/api/config/bot")
async def update_bot_config(bot_config: BotTokenConfig, current_user: str = Depends(verify_token)):
    config = read_json_file("/app/config.json")
    
    # Validar token básico (deve começar com formato correto)
    if not bot_config.token or len(bot_config.token) < 50:
        raise HTTPException(status_code=400, detail="Token inválido")
    
    # Testar se o token funciona
    test_status = await check_discord_bot_status(bot_config.token)
    if test_status["status"] == "error" and "inválido" in test_status["message"]:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado")
    
    # Salvar o novo token
    config["token"] = bot_config.token
    write_json_file("/app/config.json", config)
    
    return {"message": "Token do bot atualizado com sucesso"}

@app.post("/api/bot/restart")
async def restart_bot(current_user: str = Depends(verify_token)):
    success = restart_discord_bot()
    
    if success:
        return {"message": "Bot reiniciado com sucesso"}
    else:
        raise HTTPException(status_code=500, detail="Erro ao reiniciar o bot")

@app.get("/api/config/ticket")
async def get_ticket_config(current_user: str = Depends(verify_token)):
    config = read_json_file("/app/DataBaseJson/config.json")
    return {
        "categoria_id": config.get("tickets", {}).get("categoria", ""),
        "logs_id": config.get("tickets", {}).get("logs", ""),
        "entrega_canal_id": config.get("entrega", {}).get("canal_id", "")
    }

@app.post("/api/config/ticket")
async def update_ticket_config(ticket_config: TicketConfig, current_user: str = Depends(verify_token)):
    config = read_json_file("/app/DataBaseJson/config.json")
    
    if "tickets" not in config:
        config["tickets"] = {}
    if "entrega" not in config:
        config["entrega"] = {}
    
    config["tickets"]["categoria"] = ticket_config.categoria_id
    config["tickets"]["logs"] = ticket_config.logs_id
    
    if ticket_config.entrega_canal_id:
        config["entrega"]["canal_id"] = ticket_config.entrega_canal_id
    
    write_json_file("/app/DataBaseJson/config.json", config)
    return {"message": "Configuração de ticket atualizada com sucesso"}

@app.get("/api/config/cargos")
async def get_cargo_config(current_user: str = Depends(verify_token)):
    config = read_json_file("/app/DataBaseJson/config.json")
    return {
        "cliente_id": config.get("cargos", {}).get("cliente", ""),
        "membro_id": config.get("cargos", {}).get("membro", "")
    }

@app.post("/api/config/cargos")
async def update_cargo_config(cargo_config: CargoConfig, current_user: str = Depends(verify_token)):
    config = read_json_file("/app/DataBaseJson/config.json")
    
    if "cargos" not in config:
        config["cargos"] = {}
    
    config["cargos"]["cliente"] = cargo_config.cliente_id
    config["cargos"]["membro"] = cargo_config.membro_id
    
    write_json_file("/app/DataBaseJson/config.json", config)
    return {"message": "Configuração de cargos atualizada com sucesso"}

@app.post("/api/saldo/add")
async def adicionar_saldo(saldo_request: SaldoAdd, current_user: str = Depends(verify_token)):
    saldo_data = read_json_file("/app/DataBaseJson/saldo.json")
    config = read_json_file("/app/DataBaseJson/config.json")
    
    user_id = saldo_request.user_id
    valor = saldo_request.valor
    
    # Atualizar saldo
    if user_id not in saldo_data:
        saldo_data[user_id] = 0.0
    
    saldo_data[user_id] += valor
    write_json_file("/app/DataBaseJson/saldo.json", saldo_data)
    
    # Registrar na entrega
    entrega_data = read_json_file("/app/DataBaseJson/entrega.json")
    if "entregas" not in entrega_data:
        entrega_data["entregas"] = []
    
    transacao_id = str(uuid.uuid4())
    entrega_record = {
        "type": 17,
        "accent_color": None,
        "spoiler": False,
        "components": [
            {
                "type": 10,
                "content": "## <:raiobranco_cristalstore:1457177790129373259> saldo adicionado"
            },
            {
                "type": 14,
                "divider": False,
                "spacing": 2
            },
            {
                "type": 10,
                "content": f"<:membros_cristalstore:1457254954283700348>  Usuário: <@{user_id}>\n<:bagdinheiro_cristalstore:1457177684688764948>  Valor Pago: R${valor:.2f}\n<:moedas:1457254694438043702>  Saldo Adicionado: R${valor:.2f}\n<:pix:1457254722481164494>  Transação: {transacao_id}"
            },
            {
                "type": 14,
                "divider": True,
                "spacing": 1
            },
            {
                "type": 10,
                "content": "<:confirm:1457255097758122058>  Status: Aprovado\n<a:953908880642043954:1457254622396809256>  Saldo adicionado automaticamente!"
            },
            {
                "type": 10,
                "content": f"<:celular:1457254465470992425> Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}"
            }
        ],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "valor": valor,
        "transacao_id": transacao_id,
        "tipo": "adicao"
    }
    
    entrega_data["entregas"].append(entrega_record)
    write_json_file("/app/DataBaseJson/entrega.json", entrega_data)
    
    return {
        "message": "Saldo adicionado com sucesso",
        "novo_saldo": saldo_data[user_id],
        "transacao_id": transacao_id
    }

@app.post("/api/saldo/remove")
async def remover_saldo(saldo_request: SaldoRemove, current_user: str = Depends(verify_token)):
    saldo_data = read_json_file("/app/DataBaseJson/saldo.json")
    config = read_json_file("/app/DataBaseJson/config.json")
    
    user_id = saldo_request.user_id
    valor = saldo_request.valor
    
    # Verificar se usuário existe
    if user_id not in saldo_data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Verificar se tem saldo suficiente
    if saldo_data[user_id] < valor:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")
    
    # Remover saldo
    saldo_data[user_id] -= valor
    if saldo_data[user_id] < 0:
        saldo_data[user_id] = 0
    
    write_json_file("/app/DataBaseJson/saldo.json", saldo_data)
    
    # Registrar na entrega
    entrega_data = read_json_file("/app/DataBaseJson/entrega.json")
    if "entregas" not in entrega_data:
        entrega_data["entregas"] = []
    
    transacao_id = str(uuid.uuid4())
    entrega_record = {
        "type": 17,
        "accent_color": None,
        "spoiler": False,
        "components": [
            {
                "type": 10,
                "content": "## ❌ saldo removido"
            },
            {
                "type": 14,
                "divider": False,
                "spacing": 2
            },
            {
                "type": 10,
                "content": f"👤  Usuário: <@{user_id}>\n💸  Valor Removido: R${valor:.2f}\n💰  Saldo Atual: R${saldo_data[user_id]:.2f}\n🔖  Transação: {transacao_id}"
            },
            {
                "type": 14,
                "divider": True,
                "spacing": 1
            },
            {
                "type": 10,
                "content": f"📋  Motivo: {saldo_request.motivo or 'Remoção manual'}\n⚠️  Saldo removido pelo administrador!"
            },
            {
                "type": 10,
                "content": f"📅 Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}"
            }
        ],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "valor": -valor,  # Negativo para indicar remoção
        "transacao_id": transacao_id,
        "tipo": "remocao",
        "motivo": saldo_request.motivo or "Remoção manual"
    }
    
    entrega_data["entregas"].append(entrega_record)
    write_json_file("/app/DataBaseJson/entrega.json", entrega_data)
    
    return {
        "message": "Saldo removido com sucesso",
        "novo_saldo": saldo_data[user_id],
        "transacao_id": transacao_id
    }

@app.get("/api/entregas")
async def get_entregas(current_user: str = Depends(verify_token)):
    entrega_data = read_json_file("/app/DataBaseJson/entrega.json")
    entregas = entrega_data.get("entregas", [])
    
    # Retornar últimas 20 entregas
    return {
        "entregas": sorted(entregas, key=lambda x: x.get("timestamp", ""), reverse=True)[:20],
        "total": len(entregas)
    }

@app.get("/api/config/payments")
async def get_payment_config(current_user: str = Depends(verify_token)):
    config = read_json_file("/app/DataBaseJson/config.json")
    return {
        "mp_token": config.get("mercadopago", {}).get("access_token", "")[:20] + "..." if config.get("mercadopago", {}).get("access_token") else "",
        "sms_api_key": config.get("sms24h", {}).get("api_key", "")[:15] + "..." if config.get("sms24h", {}).get("api_key") else ""
    }

@app.post("/api/config/payments")
async def update_payment_config(payment_config: PaymentConfig, current_user: str = Depends(verify_token)):
    config = read_json_file("/app/DataBaseJson/config.json")
    
    if payment_config.mp_token:
        if "mercadopago" not in config:
            config["mercadopago"] = {}
        config["mercadopago"]["access_token"] = payment_config.mp_token
        
    if payment_config.sms_api_key:
        if "sms24h" not in config:
            config["sms24h"] = {}
        config["sms24h"]["api_key"] = payment_config.sms_api_key
    
    write_json_file("/app/DataBaseJson/config.json", config)
    return {"message": "Configurações de pagamento atualizadas com sucesso"}

@app.get("/api/logs/bot")
async def get_bot_logs(current_user: str = Depends(verify_token)):
    try:
        # Ler logs do bot Node.js
        result = subprocess.run(['tail', '-n', '50', '/var/log/supervisor/backend.err.log'], 
                              capture_output=True, text=True)
        return {"logs": result.stdout.split('\n')}
    except:
        return {"logs": ["Logs não disponíveis"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)