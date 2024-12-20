import { cn } from '@/lib/utils';
import React from 'react';
import { IconProps } from '../components';

export const AddRowAfter = ({
  size = 18, // Default size
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
      <path
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M180 1800h1560c33 0 60-26.88 60-60V720H120v1020c0 33.12 27 60 60 60ZM120 180v420h480V120H180c-33 0-60 26.88-60 60Zm600-60v480h480V120H720Zm1080 60c0-33.12-27-60-60-60h-420v480h480V180Zm120 1560c0 99.24-80.76 180-180 180H180c-99.24 0-180-80.76-180-180V180C0 80.76 80.76 0 180 0h1560c99.24 0 180 80.76 180 180v1560Zm-510-596.484v240h-330v330H840v-330H510v-240h330v-330h240v330h330Z'
        color='currentColor'
        className={cn('', className)}
      />
    </svg>
  );
};
