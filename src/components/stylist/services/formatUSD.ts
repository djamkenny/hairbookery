
/**
 * Format a given number or numeric string as USD currency.
 * Shows $ and no decimals for whole numbers.
 */
export function formatUSD(price: string | number): string {
  const amount = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(isNaN(amount) ? 0 : amount);
}
