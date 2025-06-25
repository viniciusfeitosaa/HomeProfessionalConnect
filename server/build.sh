#!/bin/bash

echo "🚀 Iniciando build do LifeBee Backend..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se o TypeScript está instalado
if ! command -v tsc &> /dev/null; then
    echo "❌ TypeScript não encontrado. Instalando..."
    npm install -g typescript
fi

# Compilar TypeScript com configuração específica para Render
echo "🔨 Compilando TypeScript..."
if [ -f "tsconfig.render.json" ]; then
    npx tsc --project tsconfig.render.json
else
    npm run build
fi

# Verificar se a compilação foi bem-sucedida
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📁 Arquivos compilados em: dist/"
    ls -la dist/
else
    echo "❌ Erro na compilação!"
    exit 1
fi 