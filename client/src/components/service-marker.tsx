import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';

interface ServiceMarkerProps {
  service: any;
  position: [number, number];
  isSelected: boolean;
  isEditing: boolean;
  onMapServiceClick: (service: any) => void;
  onEditLocation: (serviceId: number) => void;
  onDragEnd: (e: any) => void;
  userLocation: [number, number];
  serviceLocations: {[key: number]: [number, number]};
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

export const ServiceMarker: React.FC<ServiceMarkerProps> = ({
  service,
  position,
  isSelected,
  isEditing,
  onMapServiceClick,
  onEditLocation,
  onDragEnd,
  userLocation,
  serviceLocations,
  calculateDistance
}) => {
  const createIcon = () => {
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

    const backgroundStyle = `
      background-image: url('/src/assets/service-icon.png');
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
  };

  return (
    <Marker 
      key={service.id} 
      position={position}
      draggable={isEditing}
      icon={createIcon()}
      eventHandlers={{
        click: () => {
          if (isEditing) {
            // Finalizar edição
            onEditLocation(0); // 0 para cancelar
          } else {
            // Abrir modal com detalhes do serviço
            onMapServiceClick(service);
          }
        },
        dragend: onDragEnd
      }}
    >
      <Popup>
        <div className="min-w-[250px]">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${isEditing ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <strong>Solicitação #{service.id}</strong>
            {isEditing && <span className="text-xs text-red-600 font-medium">(Arraste para ajustar)</span>}
          </div>
          
          <div className="mb-3">
            <p className="font-medium text-sm mb-1 text-blue-600">{service.serviceType}</p>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{service.description}</p>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-medium">📍 {service.address}</p>
              <p>📅 {new Date(service.scheduledDate).toLocaleDateString('pt-BR')} às {service.scheduledTime}</p>
              {service.budget && (
                <p className="font-semibold text-green-600">R$ {parseFloat(service.budget).toFixed(2)}</p>
              )}
              {serviceLocations[service.id] && (
                <p className="text-gray-400">
                  📏 {calculateDistance(
                    userLocation[0], 
                    userLocation[1], 
                    serviceLocations[service.id][0], 
                    serviceLocations[service.id][1]
                  ).toFixed(1)} km de distância
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onMapServiceClick(service)}
            >
              Ver Detalhes
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onEditLocation(service.id)}
              title="Ajustar posição no mapa"
            >
              📍
            </Button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};