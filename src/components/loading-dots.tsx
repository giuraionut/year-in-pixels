import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: number; // Optional size prop
  className?: string; // Tailwind-compatible classes
}

export const LoadingDots = ({
  size = 24, // Default size
  className,
  ...props
}: LoadingSpinnerProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width={size}
      height={size}
      //   className={cn('animate-bounce', className)} // Adds Tailwind animations
      {...props}
    >
      <circle
        cx='4'
        cy='12'
        r='3'
        fill='currentColor'
        className={cn('animate-bounce-delay-1', className)}
      ></circle>
      <circle
        cx='10'
        cy='12'
        r='3'
        fill='currentColor'
        className={cn('animate-bounce-delay-2', className)}
      ></circle>
      <circle
        cx='16'
        cy='12'
        r='3'
        fill='currentColor'
        className={cn('animate-bounce-delay-3', className)}
      ></circle>
    </svg>
  );
};
