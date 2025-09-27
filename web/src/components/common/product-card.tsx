import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';
import { cn, formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ProductCardProps {
  id: string;
  title: string;
  price: number | null; // Price in kobo, null for swap-only
  location: string;
  imageUrl: string;
  imageAlt?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
  className?: string;
  isSwapOnly?: boolean;
  acceptsCash?: boolean;
  acceptsSwap?: boolean;
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
  isSwapOnly = false,
  acceptsCash = true,
  acceptsSwap = true,
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
          
          <div className="product-card-price mb-2">
            {isSwapOnly || (!acceptsCash && acceptsSwap) ? (
              <span className="text-secondary font-medium">Swap</span>
            ) : acceptsCash && !acceptsSwap ? (
              price && price > 0 ? (
                <span className="naira-symbol font-semibold">{formatNaira(price)}</span>
              ) : (
                <span className="text-neutral-gray">No price set</span>
              )
            ) : acceptsCash && acceptsSwap ? (
              <div className="flex items-center gap-2">
                {price && price > 0 ? (
                  <>
                    <span className="naira-symbol font-semibold">{formatNaira(price)}</span>
                    <span className="text-secondary text-sm">+ Swap</span>
                  </>
                ) : (
                  <span className="text-secondary font-medium">Swap + Cash</span>
                )}
              </div>
            ) : (
              <span className="text-secondary font-medium">Swap</span>
            )}
          </div>
          
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