
/**
 * Format a given number or numeric string as GHS currency (Ghana Cedis).
 * Shows ₵ and no decimals for whole numbers.
 */
export function formatGHS(price: string | number): string {
  const amount = typeof price === "string" ? parseFloat(price) : price;
  // Use 'GHS' for symbol (Intl places "GHS" but we prefix with ₵ for clarity)
  // Remove decimals for whole numbers
  if (isNaN(amount)) return "₵0";
  return (
    "₵" +
    new Intl.NumberFormat("en-GH", {
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount)
  );
}
