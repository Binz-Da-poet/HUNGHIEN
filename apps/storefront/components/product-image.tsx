import { ImageIcon } from 'lucide-react';
import { resolveApiImageUrl } from '@/lib/product-images';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  brand?: string;
  categoryName?: string | null;
}

function getVisualKind(name: string, categoryName?: string | null) {
  const text = `${name} ${categoryName ?? ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (text.includes('macbook') || text.includes('laptop') || text.includes('vivobook') || text.includes('may tinh')) {
    return 'laptop';
  }

  if (text.includes('tai nghe') || text.includes('airpods') || text.includes('audio')) {
    return 'audio';
  }

  if (text.includes('sac') || text.includes('charger') || text.includes('usb-c')) {
    return 'charger';
  }

  if (text.includes('op') || text.includes('case')) {
    return 'case';
  }

  return 'phone';
}

function isDemoImage(src?: string | null) {
  return !src || src.includes('picsum.photos') || src.includes('placeholder');
}

function ProductVisual({ alt, brand, categoryName }: Pick<ProductImageProps, 'alt' | 'brand' | 'categoryName'>) {
  const kind = getVisualKind(alt, categoryName);
  const label = brand || alt.split(' ')[0] || 'HH';

  return (
    <div
      role="img"
      aria-label={alt}
      className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#dbeafe_0,#eff6ff_32%,#f8fafc_68%)]"
    >
      <div className="absolute left-4 top-4 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-sm">
        {label}
      </div>

      {kind === 'laptop' && (
        <div className="relative w-4/5">
          <div className="aspect-[16/10] rounded-md border-[6px] border-slate-800 bg-gradient-to-br from-sky-200 via-white to-emerald-100 shadow-xl">
            <div className="m-4 h-2 rounded-full bg-white/70" />
            <div className="mx-4 mt-3 h-10 rounded-md bg-white/45" />
          </div>
          <div className="mx-auto h-3 w-11/12 rounded-b-xl bg-slate-700 shadow-lg" />
        </div>
      )}

      {kind === 'audio' && (
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-xl">
          <div className="absolute h-24 w-24 rounded-full border-[10px] border-slate-100" />
          <div className="z-10 grid grid-cols-2 gap-4">
            <div className="h-24 w-10 rounded-full bg-slate-50 shadow-md">
              <div className="mx-auto mt-2 h-4 w-4 rounded-full bg-slate-300" />
            </div>
            <div className="h-24 w-10 rounded-full bg-slate-50 shadow-md">
              <div className="mx-auto mt-2 h-4 w-4 rounded-full bg-slate-300" />
            </div>
          </div>
        </div>
      )}

      {kind === 'charger' && (
        <div className="relative flex h-40 w-36 flex-col items-center justify-center rounded-2xl bg-white shadow-xl">
          <div className="mb-4 flex gap-3">
            <span className="h-9 w-3 rounded-full bg-slate-700" />
            <span className="h-9 w-3 rounded-full bg-slate-700" />
          </div>
          <div className="h-16 w-20 rounded-xl bg-slate-100 shadow-inner">
            <div className="mx-auto mt-6 h-3 w-8 rounded-full bg-slate-400" />
          </div>
        </div>
      )}

      {kind === 'case' && (
        <div className="relative h-44 w-28 rounded-[1.7rem] border-[10px] border-orange-500 bg-orange-100 shadow-xl">
          <div className="absolute left-4 top-5 h-8 w-8 rounded-full border-4 border-orange-400 bg-white" />
          <div className="absolute inset-x-4 bottom-5 h-2 rounded-full bg-orange-300" />
        </div>
      )}

      {kind === 'phone' && (
        <div className="relative h-48 w-28 rounded-[1.7rem] border-[8px] border-slate-900 bg-gradient-to-br from-slate-900 via-sky-700 to-emerald-500 shadow-xl">
          <div className="absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-slate-700" />
          <div className="absolute inset-x-4 top-10 h-14 rounded-lg bg-white/20" />
          <div className="absolute inset-x-5 bottom-6 grid grid-cols-2 gap-2">
            <span className="h-3 rounded-full bg-white/40" />
            <span className="h-3 rounded-full bg-white/30" />
            <span className="h-3 rounded-full bg-white/25" />
            <span className="h-3 rounded-full bg-white/35" />
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductImage({ src, alt, className = '', brand, categoryName }: ProductImageProps) {
  const resolvedSrc = resolveApiImageUrl(src);

  if (!resolvedSrc || isDemoImage(resolvedSrc)) {
    return (
      <div className={`aspect-square w-full overflow-hidden bg-slate-100 ${className}`}>
        {alt ? (
          <ProductVisual alt={alt} brand={brand} categoryName={categoryName} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-slate-400">
            <div>
              <ImageIcon className="mx-auto h-8 w-8" />
              <span className="mt-2 block text-xs font-medium">Đang cập nhật ảnh</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <img src={resolvedSrc} alt={alt} className={`aspect-square w-full object-cover ${className}`} />;
}
