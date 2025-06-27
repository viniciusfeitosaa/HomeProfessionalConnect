#!/bin/bash

echo "🚀 Iniciando servidor..."

cd server

if [ -f "dist/index.js" ]; then
    echo "✅ Arquivo de build encontrado, iniciando servidor..."
    npm start
else
    echo "❌ Arquivo de build não encontrado!"
    echo "📁 Conteúdo da pasta server:"
    ls -la
    echo "📁 Conteúdo da pasta dist (se existir):"
    ls -la dist/ 2>/dev/null || echo "Pasta dist não existe"
    exit 1
fi 