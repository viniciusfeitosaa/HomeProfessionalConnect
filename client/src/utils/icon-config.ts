import L from 'leaflet';

// Configuração do ícone do serviço com imagem
export const SERVICE_ICON_CONFIG = {
  html: `<div style="width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); background-image: url('/service-icon.png'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
};

export const createServiceIcon = (isSelected: boolean = false) => {
  let html = SERVICE_ICON_CONFIG.html;
  
  if (isSelected) {
    html = html.replace('"></div>', '; animation: pulse 2s infinite;"></div>');
  }
  
  return L.divIcon({
    className: 'custom-div-icon',
    html,
    iconSize: SERVICE_ICON_CONFIG.iconSize as [number, number],
    iconAnchor: SERVICE_ICON_CONFIG.iconAnchor as [number, number]
  });
};