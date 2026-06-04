import { ImageIcon } from 'lucide-react';
import { resolveApiImageUrl } from '@/lib/product-images';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const resolvedSrc = resolveApiImageUrl(src);

  if (!resolvedSrc) {
    return (
      <div className={`flex aspect-square w-full items-center justify-center bg-slate-100 text-slate-400 ${className}`}>
        <div className="text-center">
          <ImageIcon className="mx-auto h-8 w-8" />
          <span className="mt-2 block text-xs font-medium">Đang cập nhật ảnh</span>
        </div>
      </div>
    );
  }

  return <img src={resolvedSrc} alt={alt} className={`aspect-square w-full object-cover ${className}`} />;
}
