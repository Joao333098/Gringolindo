from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Dict, List, Any, Union
import json
import os
import hashlib
import jwt
from datetime import datetime, timedelta, timezone
import uuid
import requests
import asyncio
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from services_api import SMS24HClient, MercadoPagoClient

app = FastAPI(title="KS System - Kaeli System API")

security = HTTPBearer()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files configuration (Frontend React)
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_BUILD_DIR = BASE_DIR / "frontend" / "build"

if FRONTEND_BUILD_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_BUILD_DIR / "static")), name="static")

# JWT Configuration
JWT_SECRET = "KS_SYSTEM_SECRET_KEY_2025_GLITCH"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 1 week login

# --- Models ---

class DiscordLoginRequest(BaseModel):
    code: str
    redirect_uri: str

class Product(BaseModel):
    id: str
    nome: str
    preco_final: float
    qtd_disp: int
    categoria: Optional[str] = "Geral"

class PurchaseRequest(BaseModel):
    service_id: str
    country: int = 73

class DepositRequest(BaseModel):
    amount: float

class ConfigUpdate(BaseModel):
    key: str
    value: Any
    file: str  # 'config', 'system', 'services', etc.

# --- Helpers ---

def read_json(filename: str) -> Dict:
    path = f"./DataBaseJson/{filename}.json"
    if not os.path.exists(path):
        return {}
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {}

def write_json(filename: str, data: Dict):
    os.makedirs("./DataBaseJson", exist_ok=True)
    with open(f"./DataBaseJson/{filename}.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def read_services() -> List[Dict]:
    # Try reading from services.json first (root)
    if os.path.exists("./services.json"):
        with open("./services.json", 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get("servicos", [])
    return []

def get_db_user(user_id: str) -> Dict:
    users = read_json("users")
    user_list = users.get("users", [])
    for u in user_list:
        if u["id"] == user_id:
            return u
    # If not found, check saldo.json for legacy data
    saldo = read_json("saldo")
    if user_id in saldo:
        # Create user entry
        new_user = {
            "id": user_id,
            "username": "Unknown",
            "saldo": float(saldo[user_id]),
            "avatar": None,
            "created_at": datetime.now().isoformat()
        }
        if "users" not in users:
            users["users"] = []
        users["users"].append(new_user)
        write_json("users", users)
        return new_user
    return None

def update_user_balance(user_id: str, amount: float, operation: str = "add"):
    # Update saldo.json (Legacy but used by bot)
    saldo_data = read_json("saldo")
    current_saldo = float(saldo_data.get(user_id, 0.0))

    if operation == "add":
        new_saldo = current_saldo + amount
    elif operation == "subtract":
        if current_saldo < amount:
            raise HTTPException(status_code=400, detail="Saldo insuficiente")
        new_saldo = current_saldo - amount
    else:
        new_saldo = amount

    saldo_data[user_id] = new_saldo
    write_json("saldo", saldo_data)

    # Update users.json
    users = read_json("users")
    found = False
    if "users" in users:
        for u in users["users"]:
            if u["id"] == user_id:
                u["saldo"] = new_saldo
                found = True
                break
    if not found:
        if "users" not in users: users["users"] = []
        users["users"].append({"id": user_id, "saldo": new_saldo})
    write_json("users", users)

    return new_saldo

def add_history(user_id: str, entry: Dict):
    hist = read_json("historico")
    if user_id not in hist:
        hist[user_id] = []
    # Ensure it's a list
    if not isinstance(hist[user_id], list):
        hist[user_id] = []

    entry["timestamp"] = datetime.now().timestamp() * 1000
    entry["date_iso"] = datetime.now().isoformat()
    hist[user_id].append(entry)
    write_json("historico", hist)

# --- Auth ---

def create_token(user_id: str, username: str, avatar: str, is_admin: bool) -> str:
    payload = {
        "sub": user_id,
        "username": username,
        "avatar": avatar,
        "role": "admin" if is_admin else "user",
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_admin_user(user: Dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# --- Endpoints ---

@app.get("/api/health")
def health():
    return {"status": "online", "system": "KS System", "theme": "Red/Black Glitch"}

@app.get("/api/config/public")
def get_public_config():
    config = read_json("config")
    # Return ONLY safe public config
    return {
        "discord_client_id": config.get("discord_client_id"),
        "theme": "red_black",
        "maintenance": config.get("maintenance", False)
    }

# Auth
@app.post("/api/auth/discord")
async def discord_auth(data: DiscordLoginRequest):
    config = read_json("config")
    client_id = config.get("discord_client_id")
    client_secret = config.get("discord_client_secret")
    
    # Mock for development flow if no keys (allows bootstrapping admin)
    if not client_id and data.code == "MOCK_DEV_CODE":
         mock_id = "999999999"
         mock_user = "Admin (Setup)"
         return {
             "token": create_token(mock_id, mock_user, "", True),
             "user": {"id": mock_id, "username": mock_user, "role": "admin", "avatar": ""},
             "warning": "MOCK LOGIN - PLEASE CONFIGURE KEYS"
         }

    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="Discord Auth not configured in Admin")

    # Exchange code for token
    token_url = 'https://discord.com/api/oauth2/token'
    payload = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'authorization_code',
        'code': data.code,
        'redirect_uri': data.redirect_uri
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    try:
        r = requests.post(token_url, data=payload, headers=headers)
        r.raise_for_status()
        oauth_data = r.json()
        access_token = oauth_data.get('access_token')
        
        # Get User Info
        user_r = requests.get('https://discord.com/api/users/@me', headers={'Authorization': f'Bearer {access_token}'})
        user_r.raise_for_status()
        user_info = user_r.json()
        
        user_id = user_info['id']
        username = user_info['username']
        avatar = f"https://cdn.discordapp.com/avatars/{user_id}/{user_info['avatar']}.png"
        
        # Check if admin
        perms = read_json("perms")
        is_admin = str(user_id) in perms or user_id == "123456789" # Fallback admin
        
        # Save/Update user in DB
        users = read_json("users")
        user_list = users.get("users", [])
        existing = next((u for u in user_list if u["id"] == user_id), None)
        
        if existing:
            existing["username"] = username
            existing["avatar"] = avatar
        else:
            # Sync balance if exists in legacy saldo.json
            saldo = read_json("saldo")
            balance = float(saldo.get(user_id, 0.0))
            
            new_user = {
                "id": user_id,
                "username": username,
                "saldo": balance,
                "avatar": avatar,
                "created_at": datetime.now().isoformat()
            }
            if "users" not in users: users["users"] = []
            users["users"].append(new_user)
        
        write_json("users", users)
        
        jwt_token = create_token(user_id, username, avatar, is_admin)
        
        return {"token": jwt_token, "user": {"id": user_id, "username": username, "avatar": avatar, "role": "admin" if is_admin else "user"}}
        
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=400, detail="Authentication failed")

@app.get("/api/user/me")
async def get_me(user: Dict = Depends(get_current_user)):
    user_id = user["sub"]
    db_user = get_db_user(user_id)
    if not db_user:
        return user # Return token info if DB sync issue

    # Get History
    hist = read_json("historico")
    user_hist = hist.get(user_id, [])
    
    return {
        "user": db_user,
        "history": user_hist
    }

# Products
@app.get("/api/products")
async def get_products():
    services = read_services()
    return {"products": services}

# Purchase
@app.post("/api/purchase")
async def purchase_service(req: PurchaseRequest, user: Dict = Depends(get_current_user)):
    user_id = user["sub"]
    
    # Check Balance
    services = read_services()
    product = next((s for s in services if s["id"] == req.service_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    price = product.get("preco_final", 0.0)
    
    # Get Wallet
    saldo_data = read_json("saldo")
    current_balance = float(saldo_data.get(user_id, 0.0))
    
    if current_balance < price:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")
        
    # Call SMS24H
    config = read_json("config")
    api_key = config.get("sms_api_key") or read_json("DataBaseJson/config").get("sms24h", {}).get("api_key") # Try legacy location too
    
    # Try finding in general config/General store
    if not api_key:
         # Try loading General/painel.json or config.json structures
         pass

    if not api_key:
        raise HTTPException(status_code=500, detail="SMS API Key not configured")

    client = SMS24HClient(api_key)
    
    try:
        # Subtract Balance FIRST (Optimistic)
        update_user_balance(user_id, price, "subtract")
        
        number_data = client.get_number(req.service_id, req.country)
        
        # Save Transaction
        tx_id = number_data['id']
        tx = {
            "id": tx_id,
            "product_id": req.service_id,
            "product_name": product["nome"],
            "number": number_data['numero'],
            "price": price,
            "status": "WAITING_SMS",
            "type": "purchase"
        }
        add_history(user_id, tx)

        return tx

    except Exception as e:
        # Refund if error
        # update_user_balance(user_id, price, "add") # Only refund if balance was deducted
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/purchase/{tx_id}/status")
async def check_sms_status(tx_id: str, user: Dict = Depends(get_current_user)):
    config = read_json("config")
    api_key = config.get("sms_api_key")
    client = SMS24HClient(api_key)
    
    status = client.get_status(tx_id)
    
    # Update History if changed
    if status['status'] == 'RECEBIDO':
        user_id = user["sub"]
        hist = read_json("historico")
        user_hist = hist.get(user_id, [])
        for h in user_hist:
            if h.get("id") == tx_id:
                h["status"] = "COMPLETED"
                h["code"] = status['codigo']
                h["content"] = status['codigo']
                break
        write_json("historico", hist)

    return status

@app.post("/api/purchase/{tx_id}/cancel")
async def cancel_sms(tx_id: str, user: Dict = Depends(get_current_user)):
    config = read_json("config")
    api_key = config.get("sms_api_key")
    client = SMS24HClient(api_key)
    
    # Check if cancellable
    status = client.get_status(tx_id)
    if status['status'] == 'RECEBIDO':
        raise HTTPException(status_code=400, detail="Cannot cancel received SMS")
        
    result = client.set_status(tx_id, 8) # 8 = Cancel

    if "CANCEL" in result or "ACCESS_CANCEL" in result:
        # Refund
        user_id = user["sub"]
        hist = read_json("historico")
        user_hist = hist.get(user_id, [])
        price = 0
        for h in user_hist:
            if h.get("id") == tx_id:
                price = h.get("price", 0)
                h["status"] = "CANCELLED"
                break
        write_json("historico", hist)
        
        update_user_balance(user_id, price, "add")
        return {"status": "cancelled", "refunded": price}
        
    raise HTTPException(status_code=400, detail="Failed to cancel")

# Deposit (Pix)
@app.post("/api/deposit")
async def create_deposit(req: DepositRequest, user: Dict = Depends(get_current_user)):
    config = read_json("config")
    token = config.get("mp_token")
    if not token:
        raise HTTPException(status_code=500, detail="Payment provider not configured")
        
    mp = MercadoPagoClient(token)
    user_id = user["sub"]
    user_name = user["username"]

    try:
        payment = mp.create_pix_payment(req.amount, f"Add Funds KS System - {user_name}")
        
        # Save Pending Deposit
        tx = {
            "id": str(payment["id"]),
            "type": "deposit",
            "amount": req.amount,
            "status": "pending",
            "qr_code": payment["qr_code"],
            "qr_code_base64": payment["qr_code_base64"]
        }
        add_history(user_id, tx)
        
        return tx
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/deposit/{payment_id}/status")
async def check_deposit(payment_id: str, user: Dict = Depends(get_current_user)):
    config = read_json("config")
    token = config.get("mp_token")
    mp = MercadoPagoClient(token)
    
    status_data = mp.get_payment_status(payment_id)
    status = status_data.get("status")
    
    if status == "approved":
        # Check if already processed locally
        user_id = user["sub"]
        hist = read_json("historico")
        user_hist = hist.get(user_id, [])
        
        tx = next((h for h in user_hist if str(h.get("id")) == payment_id), None)
        
        if tx and tx["status"] != "approved":
            tx["status"] = "approved"
            write_json("historico", hist)

            # Add Balance
            update_user_balance(user_id, float(tx["amount"]), "add")

    return status_data

# Admin
@app.post("/api/admin/config")
async def update_config(data: ConfigUpdate, admin: Dict = Depends(get_admin_user)):
    # Dynamic config update
    filename = data.file if data.file in ["config", "system_config", "mensagens", "perms"] else "config"
    current = read_json(filename)
    
    # Support nested keys dot notation (e.g. "sms24h.api_key")
    keys = data.key.split('.')
    ref = current
    for k in keys[:-1]:
        if k not in ref: ref[k] = {}
        ref = ref[k]
    
    ref[keys[-1]] = data.value
    write_json(filename, current)
    return {"status": "updated", "file": filename, "key": data.key}

@app.get("/api/admin/files")
async def list_config_files(admin: Dict = Depends(get_admin_user)):
    # List all JSONs in DataBaseJson for editing
    files = []
    if os.path.exists("./DataBaseJson"):
        for f in os.listdir("./DataBaseJson"):
            if f.endswith(".json"):
                files.append(f.replace(".json", ""))
    return files

@app.get("/api/admin/file/{filename}")
async def get_config_file(filename: str, admin: Dict = Depends(get_admin_user)):
    return read_json(filename)

# Serve Frontend (SPA)
@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    if full_path.startswith("api"):
        raise HTTPException(status_code=404)

    index_file = FRONTEND_BUILD_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file, media_type="text/html")
    return {"status": "Backend Only Mode", "message": "Frontend build not found"}

from fastapi.responses import FileResponse
