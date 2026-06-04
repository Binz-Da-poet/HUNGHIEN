export function formatVnd(value: number | string | null | undefined): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return '0₫';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  })
    .format(numericValue)
    .replace(/\s/g, '');
}
