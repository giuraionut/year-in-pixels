import Link from 'next/link';
import React from 'react';

export default function Footer() {
  return (
    <footer
      className='border-t border-border/40 py-6  md:px-8 md:py-0 sticky bottom-0
    bg-background/95 backdrop-blur 
    supports-backdrop-filter:bg-background/60 dark:border-border
    '
    >
      <div className='container flex flex-col items-center justify-between gap-4 md:h-12 md:flex-row'>
        <p className='text-balance text-center text-sm leading-loose text-muted-foreground md:text-left'>
          Built by{' '}
          <Link
            href=''
            target='_blank'
            rel='noreferrer'
            className='font-medium underline underline-offset-4'
          >
            Ionut
          </Link>
          . The source code is available on{' '}
          <Link
            href=''
            target='_blank'
            rel='noreferrer'
            className='font-medium underline underline-offset-4'
          >
            GitHub
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
