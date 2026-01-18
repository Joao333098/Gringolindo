# 🚀 Deploy no Gratian.pro - Gringolindo

Guia completo para fazer deploy do Gringolindo Admin Panel no Gratian.pro.

---

## 📋 Configurações Necessárias

### 1. **Versão da Imagem**
```
python_3.12
```

### 2. **Arquivo Principal (PY_FILE)**
```
main.py
```

### 3. **Porta**
```
27687
```

### 4. **Requirements File**
```
backend/requirements.txt
```

---

## 🔧 Configuração Passo a Passo

### Passo 1: Criar Nova Aplicação

1. Acesse: https://dashboard.gratian.pro
2. Clique em **"Nova Aplicação"** ou **"Create App"**
3. Faça upload do projeto (ZIP ou conecte ao GitHub)

---

### Passo 2: Configurar Variáveis da Imagem

Na seção **"Variáveis da Imagem"**, configure:

| Campo | Valor |
|-------|-------|
| **Versão da Imagem** | `python_3.12` |
| **Arquivo Principal (PY_FILE)** | `main.py` |
| **Porta** | `27687` |
| **Requirements file** | `backend/requirements.txt` |

---

### Passo 3: Pacotes Python Adicionais (Opcional)

Se necessário, adicione pacotes extras no campo **"Additional Python packages"**:

```
uvicorn fastapi pyjwt cryptography python-multipart
```

**Nota:** Esses pacotes já estão no `requirements.txt`, então não é necessário adicionar manualmente.

---

### Passo 4: Variáveis de Ambiente (Opcional)

Se quiser customizar, adicione:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `PORT` | `27687` | Porta do servidor |
| `HOST` | `0.0.0.0` | Host (padrão já configurado) |

---

## 📁 Estrutura do Projeto

```
Gringolindo/
├── main.py                    # 🆕 Arquivo principal para Gratian.pro
├── backend/
│   ├── server.py              # Backend FastAPI
│   ├── requirements.txt       # Dependências Python
│   └── ...
├── frontend/                  # React frontend (build estático)
├── config.json                # Config bot Discord (opcional)
└── ...
```

---

## 🌐 Acesso ao Site

Após o deploy, seu site estará disponível em:

```
https://sms-test.gratianweb.site
```

Ou o domínio fornecido pelo Gratian.pro.

---

## 📚 Endpoints Disponíveis

| Endpoint | Descrição |
|----------|-----------|
| `/` | Página inicial |
| `/health` | Health check |
| `/docs` | Documentação Swagger |
| `/api/auth/login` | Login |
| `/api/dashboard/stats` | Estatísticas |

---

## ✅ Checklist de Deploy

- [ ] Arquivo `main.py` criado na raiz
- [ ] Versão da imagem: `python_3.12`
- [ ] Arquivo principal: `main.py`
- [ ] Porta: `27687`
- [ ] Requirements: `backend/requirements.txt`
- [ ] Upload do projeto feito
- [ ] Aplicação iniciada
- [ ] Site acessível

---

## 🔍 Verificação

### Health Check:
```bash
curl https://sms-test.gratianweb.site/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "service": "Discord Bot Admin Panel",
  "version": "1.0.0",
  "timestamp": "2026-01-18T12:00:00Z"
}
```

### Documentação:
```
https://sms-test.gratianweb.site/docs
```

---

## 🛠️ Troubleshooting

### Erro: "Module not found"
- Verifique se `backend/requirements.txt` está sendo usado
- Adicione pacotes manualmente em "Additional Python packages"

### Erro: "Port already in use"
- Verifique se a porta 27687 está disponível
- Altere a variável de ambiente `PORT`

### Erro: "Cannot import server"
- Verifique se `main.py` está na raiz do projeto
- Verifique se a pasta `backend/` existe

---

## 📦 Dependências (requirements.txt)

```txt
fastapi==0.115.6
uvicorn[standard]==0.34.0
pydantic==2.10.5
python-multipart==0.0.20
PyJWT==2.10.1
cryptography==44.0.0
requests==2.32.3
```

---

## 🎯 Diferenças do Deploy Local

| Aspecto | Local (inicia.py) | Gratian.pro (main.py) |
|---------|-------------------|----------------------|
| **Porta** | 8001 (padrão) | 27687 |
| **Frontend** | Servidor React separado | Build estático servido pelo backend |
| **Bot Discord** | Iniciado automaticamente | Não incluído (apenas web) |
| **Instalação** | Automática (inicia.py) | Gerenciada pelo Gratian.pro |

---

## 📞 Suporte

- **Dashboard Gratian.pro:** https://dashboard.gratian.pro
- **Documentação:** https://docs.gratian.pro
- **Seu Site:** https://sms-test.gratianweb.site

---

## 🎉 Pronto!

Seu Gringolindo Admin Panel está configurado e pronto para deploy no Gratian.pro!

**Comando de teste local:**
```bash
python3 main.py
```

**Acesso local:**
```
http://localhost:27687
```
