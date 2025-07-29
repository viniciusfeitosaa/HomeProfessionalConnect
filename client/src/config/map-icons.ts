import L from 'leaflet';

// Configuração dos ícones do mapa
export const MAP_ICONS = {
  // Ícone padrão para serviços
  service: (isSelected: boolean = false, isEditing: boolean = false) => {
    const baseStyle = `
      width: 32px; 
      height: 32px; 
      border-radius: 50%; 
      border: 3px solid white; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      ${isSelected ? 'animation: pulse 2s infinite;' : ''}
    `;

    // Usar imagem personalizada
    const backgroundStyle = `
      background-image: url('C:\LifeBee\HomeProfessionalConnect\attached_assets\iconeservico.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    `;

    const html = `<div style="${baseStyle} ${backgroundStyle}"></div>`;

    return L.divIcon({
      className: 'custom-div-icon',
      html,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  },

  // Ícone com cor (fallback)
  serviceColor: (isSelected: boolean = false, isEditing: boolean = false) => {
    const color = isSelected ? '#ef4444' : isEditing ? '#f59e0b' : '#eab308';
    
    const html = `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); ${isSelected ? 'animation: pulse 2s infinite;' : ''}"></div>`;

    return L.divIcon({
      className: 'custom-div-icon',
      html,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }
};