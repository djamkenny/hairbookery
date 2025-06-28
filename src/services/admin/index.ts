
export { userAnalyticsService, type UserAnalytics } from './userAnalytics';
export { bookingAnalyticsService, type BookingAnalytics } from './bookingAnalytics';
export { stylistAnalyticsService, type StylistAnalytics } from './stylistAnalytics';
export { serviceAnalyticsService, type ServiceAnalytics } from './serviceAnalytics';

// Combined analytics service for backwards compatibility
export const adminAnalytics = {
  getUserAnalytics: userAnalyticsService.getUserAnalytics,
  getBookingAnalytics: bookingAnalyticsService.getBookingAnalytics,
  getStylistAnalytics: stylistAnalyticsService.getStylistAnalytics,
  getServiceAnalytics: serviceAnalyticsService.getServiceAnalytics
};
