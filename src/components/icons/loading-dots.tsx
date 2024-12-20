import { cn } from '@/lib/utils';
import { IconProps } from '../components';

export const LoadingDots = ({
  size = 24, // Default size
  className,
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width={size}
      height={size}
      {...props}
    >
      <circle
        cx='3'
        cy='12'
        r='3'
        fill='currentColor'
        className={cn('animate-bounce-delay-1', className)}
      ></circle>
      <circle
        cx='11'
        cy='12'
        r='3'
        fill='currentColor'
        className={cn('animate-bounce-delay-2', className)}
      ></circle>
      <circle
        cx='19'
        cy='12'
        r='3'
        fill='currentColor'
        className={cn('animate-bounce-delay-3', className)}
      ></circle>
    </svg>
  );
};
