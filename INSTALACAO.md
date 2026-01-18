# 🚀 Guia de Instalação Rápida - Gringolindo

Sistema completo de Discord Bot Admin Panel com instalação automatizada.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **Git** (opcional) - [Download](https://git-scm.com/)

---

## ⚡ Instalação Rápida (1 Comando)

### 1️⃣ Clone ou baixe o projeto

```bash
git clone https://github.com/Joao333098/Gringolindo.git
cd Gringolindo
```

### 2️⃣ Execute o instalador automático

```bash
python3 inicia.py
```

**Pronto!** O script vai:
- ✅ Instalar todas as dependências automaticamente
- ✅ Iniciar o backend (FastAPI)
- ✅ Iniciar o frontend (React)
- ✅ Iniciar o bot Discord

---

## 🎯 Modos de Uso

### Modo Padrão (Instalar + Iniciar Tudo)
```bash
python3 inicia.py
```

### Apenas Instalar Dependências
```bash
python3 inicia.py --install-only
```

### Customizar Host e Porta
```bash
python3 inicia.py --host 0.0.0.0 --port 8080
```

### Sem Frontend (Apenas Backend + Bot)
```bash
python3 inicia.py --no-frontend
```

### Sem Bot Discord (Apenas Backend + Frontend)
```bash
python3 inicia.py --no-bot
```

### Deploy em Servidor/VPS
```bash
python3 inicia.py --host 0.0.0.0 --port 80
```

---

## 🔧 Configuração do Bot Discord

### 1. Criar Bot no Discord

1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em **"New Application"**
3. Dê um nome ao seu bot
4. Vá em **"Bot"** → **"Add Bot"**
5. Copie o **Token** do bot

### 2. Configurar Token

Edite o arquivo `config.json` na raiz do projeto:

```json
{
  "token": "SEU_TOKEN_AQUI",
  "clientId": "SEU_CLIENT_ID_AQUI",
  "guildId": "SEU_GUILD_ID_AQUI"
}
```

### 3. Adicionar Bot ao Servidor

1. No Developer Portal, vá em **"OAuth2"** → **"URL Generator"**
2. Selecione os scopes:
   - `bot`
   - `applications.commands`
3. Selecione as permissões:
   - Administrator (ou permissões específicas)
4. Copie a URL gerada e abra no navegador
5. Selecione seu servidor e autorize

---

## 📱 Acessando o Sistema

Após iniciar com `python3 inicia.py`, você terá acesso a:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | Painel administrativo web |
| **Backend API** | http://localhost:8001 | API REST (FastAPI) |
| **Documentação API** | http://localhost:8001/docs | Swagger UI interativo |
| **Bot Discord** | - | Ativo no servidor Discord |

### Login Padrão
- **Usuário:** `vovo`
- **Senha:** `2210DORRY90`

⚠️ **Importante:** Altere as credenciais em produção!

---

## 🌐 Deploy em Servidor/Host

### VPS/Servidor Linux

```bash
# 1. Instalar dependências do sistema
sudo apt update
sudo apt install -y python3 python3-pip nodejs npm git

# 2. Clonar projeto
git clone https://github.com/Joao333098/Gringolindo.git
cd Gringolindo

# 3. Configurar token do Discord
nano config.json  # Edite e salve

# 4. Iniciar sistema
python3 inicia.py --host 0.0.0.0 --port 80
```

### Heroku

```bash
# 1. Criar Procfile
echo "web: python3 inicia.py --host 0.0.0.0 --port \$PORT --no-frontend" > Procfile

# 2. Deploy
git add .
git commit -m "Deploy to Heroku"
heroku create seu-app-name
git push heroku main
```

### Railway

1. Conecte seu repositório GitHub
2. Configure variáveis de ambiente (se necessário)
3. Railway detectará automaticamente o projeto
4. Use o comando: `python3 inicia.py --host 0.0.0.0 --port $PORT`

### Replit

1. Importe o repositório
2. Execute: `python3 inicia.py`
3. Configure o token do Discord
4. Mantenha o Repl ativo com UptimeRobot

---

## 🛠️ Comandos Úteis

### Instalar apenas dependências
```bash
python3 inicia.py --install-only
```

### Iniciar apenas backend
```bash
python3 inicia.py --no-frontend --no-bot
```

### Iniciar em modo desenvolvimento
```bash
# Terminal 1 - Backend
cd backend
python3 server.py

# Terminal 2 - Frontend
cd frontend
yarn start

# Terminal 3 - Bot
node index.js
```

### Atualizar dependências
```bash
# Backend
cd backend
pip3 install -r requirements.txt --upgrade

# Frontend
cd frontend
yarn upgrade

# Bot
npm update
```

---

## 📊 Estrutura do Projeto

```
Gringolindo/
├── backend/              # API FastAPI (Python)
│   ├── server.py        # Servidor principal
│   ├── requirements.txt # Dependências Python
│   └── DataBaseJson/    # Banco de dados JSON
├── frontend/            # Painel Web (React)
│   ├── src/            # Código fonte React
│   ├── public/         # Arquivos públicos
│   └── package.json    # Dependências Node
├── ComandosSlash/      # Comandos do bot Discord
├── Eventos/            # Eventos do bot Discord
├── Handler/            # Handlers do bot
├── index.js            # Bot Discord principal
├── config.json         # Configurações do bot
├── inicia.py          # 🚀 Script de instalação automática
└── package.json        # Dependências do bot
```

---

## ❓ Solução de Problemas

### Erro: "Python não encontrado"
```bash
# Linux/Mac
sudo apt install python3 python3-pip

# Windows
# Baixe e instale: https://www.python.org/downloads/
```

### Erro: "Node não encontrado"
```bash
# Linux
sudo apt install nodejs npm

# Mac
brew install node

# Windows
# Baixe e instale: https://nodejs.org/
```

### Erro: "Porta já em uso"
```bash
# Use outra porta
python3 inicia.py --port 8080
```

### Bot não conecta
1. Verifique se o token está correto em `config.json`
2. Certifique-se de que o bot foi adicionado ao servidor
3. Verifique as permissões do bot no servidor

### Frontend não carrega
1. Verifique se a porta 3000 está livre
2. Tente limpar cache: `cd frontend && rm -rf node_modules && yarn install`
3. Verifique logs no terminal

---

## 🔒 Segurança

### Produção
- ✅ Altere as credenciais padrão (`vovo` / `2210DORRY90`)
- ✅ Use HTTPS (configure reverse proxy com Nginx/Caddy)
- ✅ Configure firewall adequadamente
- ✅ Mantenha dependências atualizadas
- ✅ Não exponha tokens/secrets em repositórios públicos

### Variáveis de Ambiente (Recomendado)
Crie arquivo `.env` na raiz:
```env
DISCORD_TOKEN=seu_token_aqui
JWT_SECRET=seu_secret_aqui
BACKEND_PORT=8001
```

---

## 📞 Suporte

- **GitHub Issues:** [Reportar Bug](https://github.com/Joao333098/Gringolindo/issues)
- **Documentação API:** http://localhost:8001/docs (após iniciar)
- **Discord:** Configure seu próprio servidor de suporte

---

## 📄 Licença

Desenvolvido por **E1 Agent - Emergent Labs**

---

## 🎉 Pronto para Usar!

Execute agora:
```bash
python3 inicia.py
```

E acesse: **http://localhost:3000**

**Bom uso! 🚀**
