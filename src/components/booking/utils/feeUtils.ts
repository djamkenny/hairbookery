
// Utility to calculate fee and total for bookings

/**
 * Calculate the booking (platform) fee and total.
 * @param price Base service price in GHS
 * @param feePercent Booking fee as percentage (default 20)
 */
export function calculateBookingFee(price: number, feePercent: number = 20) {
  const fee = Math.round(price * (feePercent / 100) * 100) / 100; // two decimals
  return {
    fee,
    total: Math.round((price + fee) * 100) / 100
  };
}
