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

def get_bot_stats() -> Dict:
    config = read_json_file("/app/DataBaseJson/config.json")
    saldo_data = read_json_file("/app/DataBaseJson/saldo.json")
    historico = read_json_file("/app/DataBaseJson/historico.json")
    
    stats = config.get("estatisticas", {})
    total_users = len(saldo_data)
    
    return {
        "vendas_totais": stats.get("vendas_totais", 0),
        "faturamento": stats.get("faturamento", 0.0),
        "tickets_criados": stats.get("tickets_criados", 0),
        "usuarios_total": total_users,
        "sms_saldo": config.get("sms24h", {}).get("saldo", 0),
        "status": "online"
    }

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
    return get_bot_stats()

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
        "transacao_id": transacao_id
    }
    
    entrega_data["entregas"].append(entrega_record)
    write_json_file("/app/DataBaseJson/entrega.json", entrega_data)
    
    return {
        "message": "Saldo adicionado com sucesso",
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
        # Ler logs do supervisor ou arquivo de log do bot
        result = subprocess.run(['tail', '-n', '50', '/var/log/supervisor/backend.err.log'], 
                              capture_output=True, text=True)
        return {"logs": result.stdout.split('\n')}
    except:
        return {"logs": ["Logs não disponíveis"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)