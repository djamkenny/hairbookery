
// Utility to calculate fee and total for bookings

/**
 * Calculate the booking (platform) fee and total.
 * @param price Base service price in GHS
 */
export function calculateBookingFee(price: number) {
  // Fixed booking fee of ₵10
  const fee = 10;
  
  return {
    fee,
    serviceTotal: Math.round(price * 100) / 100, // Original service cost (pay at appointment)
    total: Math.round((price + fee) * 100) / 100 // Total including booking fee
  };
}
