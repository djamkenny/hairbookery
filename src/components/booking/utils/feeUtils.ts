
// Utility to calculate fee and total for bookings

/**
 * Calculate the booking (platform) fee and total.
 * @param price Base service price in GHS
 */
export function calculateBookingFee(price: number) {
  // If service cost is ₵100 or more, booking fee is ₵10
  // Otherwise, booking fee is 20% of service cost
  const fee = price >= 100 ? 10 : Math.round(price * 0.20 * 100) / 100;
  
  return {
    fee,
    serviceTotal: Math.round(price * 100) / 100, // Original service cost (pay at appointment)
    total: Math.round((price + fee) * 100) / 100 // Total including booking fee
  };
}
