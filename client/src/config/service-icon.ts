import L from 'leaflet';

export const createServiceIcon = (isSelected: boolean = false, isEditing: boolean = false) => {
  const html = `<div style="width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); background-image: url('/service-icon.png'); background-size: cover; background-position: center; background-repeat: no-repeat; ${isSelected ? 'animation: pulse 2s infinite;' : ''}"></div>`;

  return L.divIcon({
    className: 'custom-div-icon',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};