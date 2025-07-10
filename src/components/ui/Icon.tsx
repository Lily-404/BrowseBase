import React from 'react';
import {
  Globe,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  ExternalLink,
  Link,
  Info,
  HelpCircle,
  // Add other icons you need here
} from 'lucide-react';

// Map of icon names to their components
const iconMap = {
  Globe,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  ExternalLink,
  Link,
  Info,
  HelpCircle,
  // Add other icons you need here
} as const;

type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, className = '', fallback }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon ${name} not found, using fallback`);
    return <>{fallback}</>;
  }

  return (
    <IconComponent
      size={size}
      className={className}
    />
  );
};

export default Icon; 