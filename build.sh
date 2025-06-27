#!/bin/bash

echo "🚀 Iniciando build para Render..."

echo "📦 Instalando dependências da raiz..."
npm install

echo "📦 Instalando dependências do server..."
cd server
npm install

echo "🔨 Fazendo build do server..."
npx tsc --project tsconfig.render.json

echo "✅ Build concluído com sucesso!" 