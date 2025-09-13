import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';
import { cn, formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ProductCardProps {
  id: string;
  title: string;
  price: number; // Price in kobo
  location: string;
  imageUrl: string;
  imageAlt?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
  className?: string;
}

export function ProductCard({
  id,
  title,
  price,
  location,
  imageUrl,
  imageAlt,
  isFavorite = false,
  onFavoriteToggle,
  className,
}: ProductCardProps): React.ReactElement {
  const handleFavoriteClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(id);
  };

  return (
    <Link href={`/listings/${id}`} className="block">
      <div className={cn('product-card group cursor-pointer', className)}>
        <div className="relative">
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            width={300}
            height={200}
            className="product-card-image"
            loading="lazy"
          />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white',
              isFavorite ? 'text-red-500' : 'text-neutral-gray'
            )}
            onClick={handleFavoriteClick}
          >
            <Heart
              className="h-4 w-4"
              fill={isFavorite ? 'currentColor' : 'none'}
            />
          </Button>
        </div>

        <div className="p-3">
          <h3 className="product-card-title mb-1 line-clamp-2">
            {title}
          </h3>
          
          <p className="product-card-price naira-symbol mb-2">
            {formatNaira(price)}
          </p>
          
          <div className="flex items-center text-neutral-gray">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="product-card-location">
              {location}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;