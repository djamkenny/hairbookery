/**
 * Format price to display as GHS currency
 */
export const formatPrice = (price: number): string => {
  if (isNaN(price)) return "₵0";
  return (
    "₵" +
    new Intl.NumberFormat("en-GH", {
      minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(price)
  );
};

/**
 * Format duration to display as hours and minutes
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes 
    ? `${hours} hr ${remainingMinutes} min` 
    : `${hours} hr`;
};
