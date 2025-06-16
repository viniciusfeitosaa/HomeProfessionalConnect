interface LifeBeeLogo {
  size?: number;
  className?: string;
}

export function LifeBeeLogo({ size = 40, className = "" }: LifeBeeLogo) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="95" fill="#1a1a1a" stroke="#333" strokeWidth="2"/>
      
      {/* Tool handles */}
      <path d="M20 60 Q30 50, 50 60 L50 80 Q30 90, 20 80 Z" fill="#FFA500"/>
      <path d="M180 60 Q170 50, 150 60 L150 80 Q170 90, 180 80 Z" fill="#FFA500"/>
      <path d="M20 140 Q30 150, 50 140 L50 120 Q30 110, 20 120 Z" fill="#FFA500"/>
      <path d="M180 140 Q170 150, 150 140 L150 120 Q170 110, 180 120 Z" fill="#FFA500"/>
      
      {/* Construction helmet */}
      <ellipse cx="100" cy="85" rx="45" ry="35" fill="#FFD700"/>
      <ellipse cx="100" cy="85" rx="42" ry="32" fill="#FFA500"/>
      <rect x="95" y="50" width="10" height="15" rx="5" fill="#FFD700"/>
      <circle cx="100" cy="58" r="3" fill="#FFF"/>
      
      {/* Helmet stripe */}
      <ellipse cx="100" cy="95" rx="45" ry="8" fill="#1a1a1a"/>
      <ellipse cx="100" cy="95" rx="42" ry="6" fill="#333"/>
      
      {/* Bee body */}
      <ellipse cx="100" cy="130" rx="35" ry="45" fill="#FFD700"/>
      
      {/* Bee stripes */}
      <ellipse cx="100" cy="115" rx="35" ry="8" fill="#1a1a1a"/>
      <ellipse cx="100" cy="135" rx="35" ry="8" fill="#1a1a1a"/>
      <ellipse cx="100" cy="155" rx="35" ry="8" fill="#1a1a1a"/>
      
      {/* Wings */}
      <ellipse cx="75" cy="110" rx="15" ry="25" fill="#E6F3FF" fillOpacity="0.8" transform="rotate(-20 75 110)"/>
      <ellipse cx="125" cy="110" rx="15" ry="25" fill="#E6F3FF" fillOpacity="0.8" transform="rotate(20 125 110)"/>
      <ellipse cx="70" cy="125" rx="12" ry="20" fill="#E6F3FF" fillOpacity="0.7" transform="rotate(-25 70 125)"/>
      <ellipse cx="130" cy="125" rx="12" ry="20" fill="#E6F3FF" fillOpacity="0.7" transform="rotate(25 130 125)"/>
      
      {/* Face */}
      <circle cx="85" cy="75" r="8" fill="#1a1a1a"/>
      <circle cx="115" cy="75" r="8" fill="#1a1a1a"/>
      <circle cx="87" cy="73" r="3" fill="#FFF"/>
      <circle cx="117" cy="73" r="3" fill="#FFF"/>
      
      {/* Antennae */}
      <line x1="90" y1="60" x2="85" y2="45" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
      <line x1="110" y1="60" x2="115" y2="45" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="85" cy="42" r="5" fill="#FFD700"/>
      <circle cx="115" cy="42" r="5" fill="#FFD700"/>
    </svg>
  );
}