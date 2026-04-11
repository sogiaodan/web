'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';

export function NewsImage({ src, alt, ...props }: ImageProps & { src: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container text-foreground/40 w-full h-full z-10 border-b border-outline-variant/30">
        <ImageOff className="h-8 w-8 mb-2 stroke-[1.5]" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || 'Image'}
      onError={() => setError(true)}
      {...props}
    />
  );
}
