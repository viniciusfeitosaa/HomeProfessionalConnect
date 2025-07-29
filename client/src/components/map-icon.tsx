import L from 'leaflet';

export const createServiceIcon = (imageUrl?: string, isSelected: boolean = false, isEditing: boolean = false) => {
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

  let backgroundStyle = '';
  let content = '';

  if (imageUrl) {
    // Usar imagem personalizada
    backgroundStyle = `
      background-image: url('${imageUrl}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    `;
  } else {
    // Usar cor baseada no estado
    const color = isSelected ? '#ef4444' : isEditing ? '#f59e0b' : '#eab308';
    backgroundStyle = `background-color: ${color};`;
  }

  const html = `<div style="${baseStyle} ${backgroundStyle}">${content}</div>`;

  return L.divIcon({
    className: 'custom-div-icon',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};