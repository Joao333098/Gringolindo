# 🤖 Configuração do Bot Discord

## ✅ O Que Foi Feito

O sistema agora inicia **automaticamente** o bot Discord junto com o backend!

### Como Funciona:
1. `main.py` inicia o backend FastAPI (Python)
2. `main.py` também inicia `index.js` (Bot Discord em Node.js) como subprocesso
3. Ambos rodam simultaneamente no mesmo container

---

## 🔧 Configuração Necessária

### 1. Obter Token do Bot Discord

1. Acesse: https://discord.com/developers/applications
2. Crie uma nova aplicação ou use uma existente
3. Vá em **Bot** → **Reset Token** → Copie o token
4. **Importante:** Ative as **Privileged Gateway Intents**:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### 2. Configurar Token no Sistema

#### Opção A: Via Interface Web (Recomendado)
1. Acesse: https://sms-test.gratianweb.site
2. Faça login
3. Vá em **Config Bot**
4. Cole o token
5. Clique em **Salvar Token e Reiniciar Bot**

#### Opção B: Via Arquivo (Manual)
Edite `config.json` na raiz do projeto:
```json
{
  "token": "SEU_TOKEN_AQUI",
  ...
}
```

### 3. Convidar Bot para o Servidor

Use este link (substitua CLIENT_ID pelo ID da sua aplicação):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

---

## 🚀 Como o Bot Inicia

### No Gratian.pro:
```bash
python3 main.py
```

O `main.py` automaticamente:
1. ✅ Instala dependências do Node.js (se necessário)
2. ✅ Inicia o bot Discord
3. ✅ Inicia o backend FastAPI
4. ✅ Monitora ambos os processos

### Logs Esperados:
```
============================================================
🚀 GRINGOLINDO ADMIN PANEL
============================================================
📡 Host: 0.0.0.0
🔌 Porta: 27687
🤖 Iniciando Bot Discord...
✅ Bot Discord iniciado (PID: 12345)
[BOT] ✅ Comando menu carregado!
[BOT] ✅ Comando painel carregado!
[BOT] 🤖 Bot online como: SeuBot#1234
🌐 Iniciando Backend FastAPI...
INFO: Uvicorn running on http://0.0.0.0:27687
```

---

## ⚠️ Requisitos do Hosting

Para o bot funcionar no Gratian.pro, o ambiente precisa ter:
- ✅ Python 3.12+ (já tem)
- ✅ Node.js 18+ (precisa verificar)
- ✅ npm (precisa verificar)

### Se Node.js não estiver disponível:
O sistema vai mostrar:
```
❌ Erro ao iniciar bot Discord: [Errno 2] No such file or directory: 'node'
⚠️  O backend continuará funcionando sem o bot
```

Nesse caso, você precisará:
1. Rodar o bot em outro servidor (Heroku, Railway, Render)
2. Ou pedir ao Gratian.pro para instalar Node.js

---

## 🧪 Testar Localmente

```bash
# Instalar dependências
npm install
pip3 install -r backend/requirements.txt

# Configurar token
nano config.json

# Iniciar sistema
python3 main.py
```

---

## 📊 Status do Bot

Você pode verificar o status do bot em:
- **Interface Web:** https://sms-test.gratianweb.site/bot
- **API:** https://sms-test.gratianweb.site/api/bot/status

---

## 🔧 Solução de Problemas

### Bot não conecta
- ✅ Verifique se o token está correto
- ✅ Verifique se as Intents estão ativadas
- ✅ Veja os logs do bot no console

### Bot offline no dashboard
- Normal se o token não estiver configurado
- Configure o token na página Config Bot

### Node.js não encontrado
- O Gratian.pro precisa ter Node.js instalado
- Alternativa: rodar bot em outro servidor

---

## ✅ Pronto!

Depois de configurar o token, o bot deve aparecer online no Discord e todas as funcionalidades devem funcionar! 🎉
