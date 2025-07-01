import { secureAdminAuth } from "./security/adminAuth";

// Re-export the secure admin auth service
export const adminAuth = secureAdminAuth;

// Keep the interfaces for backward compatibility
export type { AdminSession as AdminUser, AdminAuthResponse } from "./security/adminAuth";
