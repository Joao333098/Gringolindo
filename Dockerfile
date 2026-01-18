# ======================================
# GRINGOLINDO - Dockerfile Multi-Stage
# ======================================
# Build otimizado para produção

FROM node:18-alpine AS frontend-builder

# Build do Frontend
WORKDIR /app/frontend
COPY frontend/package*.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY frontend/ ./
RUN yarn build

# ======================================
# Imagem Final
# ======================================
FROM python:3.11-slim

# Metadados
LABEL maintainer="E1 Agent - Emergent Labs"
LABEL description="Gringolindo - Discord Bot Admin Panel"
LABEL version="2.0"

# Instalar Node.js para o bot Discord
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos do projeto
COPY . .

# Copiar build do frontend
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Instalar dependências Python
RUN pip install --no-cache-dir -r backend/requirements.txt

# Instalar dependências do bot Discord
RUN npm install --production

# Criar diretórios necessários
RUN mkdir -p backend/DataBaseJson logs

# Expor portas
EXPOSE 8001 3000

# Variáveis de ambiente padrão
ENV BACKEND_HOST=0.0.0.0
ENV BACKEND_PORT=8001
ENV NODE_ENV=production

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Script de inicialização
CMD ["python3", "inicia.py", "--host", "0.0.0.0", "--port", "8001"]
