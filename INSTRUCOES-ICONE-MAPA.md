# Instruções para Alterar o Ícone do Serviço no Mapa

## Passo 1: Verificar se a imagem está no local correto
A imagem `service-icon.png` já foi copiada para `client/public/service-icon.png`

## Passo 2: Alterar o código do marcador
No arquivo `client/src/pages/provider-dashboard.tsx`, localize o trecho do `<Marker>` (por volta da linha 1208) e substitua o código do ícone:

### CÓDIGO ATUAL (linha ~1210):
```tsx
icon={L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: ${isSelected ? '#ef4444' : isEditing ? '#f59e0b' : '#eab308'}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); ${isSelected ? 'animation: pulse 2s infinite;' : ''}"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
})}
```

### CÓDIGO NOVO (substitua pelo código acima):
```tsx
icon={L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); background-image: url('/service-icon.png'); background-size: cover; background-position: center; background-repeat: no-repeat; ${isSelected ? 'animation: pulse 2s infinite;' : ''}"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
})}
```

## Passo 3: Salvar e reiniciar
1. Salve o arquivo `provider-dashboard.tsx`
2. Reinicie o servidor frontend (`npm run dev` ou `vite`)
3. Limpe o cache do navegador (Ctrl+Shift+R)

## Passo 4: Testar
1. Acesse a página do dashboard do profissional
2. Verifique se os pins do mapa agora mostram a imagem `service-icon.png`
3. Se não aparecer, teste acessando diretamente: `http://localhost:5173/service-icon.png`

## Solução Alternativa (se não funcionar):
Se o caminho `/service-icon.png` não funcionar, tente:
- `background-image: url('service-icon.png');` (sem a barra inicial)
- Ou `background-image: url('./service-icon.png');` (com ./)

## Verificação:
- A imagem deve aparecer como um círculo com a imagem dentro
- O tamanho deve ser 32x32 pixels
- Deve ter uma borda branca e sombra
- Se selecionado, deve ter animação de pulse