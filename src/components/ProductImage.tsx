'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  category?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  category = 'Groceries',
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 p-3 select-none ${className}`}
      >
        <Package className="w-8 h-8 text-slate-400 mb-1" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 line-clamp-1 text-center">
          {category}
        </span>
        <span className="text-[10px] text-slate-400 text-center line-clamp-1">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={`object-cover object-center transition-transform duration-300 hover:scale-105 ${className}`}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
};
