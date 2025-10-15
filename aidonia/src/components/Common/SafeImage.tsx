"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { placeholderImage } from '@/utils/image-helper';

interface SafeImageProps {
  src?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
}

export default function SafeImage({ src, alt = '', width = 48, height = 48, className, fill = false }: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(placeholderImage);

  useEffect(() => {
    if (!src) {
      setCurrentSrc(placeholderImage);
      return;
    }

    // If absolute URL, keep it. Otherwise ensure leading slash for relative paths.
    if (/^https?:\/\//i.test(src)) {
      setCurrentSrc(src);
    } else {
      setCurrentSrc(src.startsWith('/') ? src : '/' + src);
    }
  }, [src]);

  // Render with fill when requested (parent must be position:relative)
  if (fill) {
    return (
      <Image
        src={currentSrc}
        alt={alt}
        fill
        className={className}
        onError={() => {
          if (currentSrc !== placeholderImage) setCurrentSrc(placeholderImage);
        }}
      />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => {
        if (currentSrc !== placeholderImage) setCurrentSrc(placeholderImage);
      }}
    />
  );
}
