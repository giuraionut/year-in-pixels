import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number; // Optional size prop
  className?: string; // Tailwind-compatible classes
}