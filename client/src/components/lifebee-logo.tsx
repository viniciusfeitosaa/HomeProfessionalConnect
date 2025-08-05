import beeLogo from '../assets/new-logo.png';

export function LifeBeeLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={beeLogo}
      alt="Logo LifeBee"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  );
}