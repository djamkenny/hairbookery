
import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface AdminAuthResponse {
  success: boolean;
  message?: string;
  admin?: AdminUser;
}

export const adminAuth = {
  async login(email: string, password: string): Promise<AdminAuthResponse> {
    try {
      const { data, error } = await supabase.rpc('authenticate_admin', {
        p_email: email,
        p_password: password
      });

      if (error) {
        console.error('Admin login error:', error);
        return { success: false, message: 'Authentication failed' };
      }

      // Type assertion for the RPC response
      const response = data as AdminAuthResponse;
      return response;
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, message: 'Authentication failed' };
    }
  },

  getCurrentAdmin(): AdminUser | null {
    const adminData = localStorage.getItem('admin_user');
    return adminData ? JSON.parse(adminData) : null;
  },

  setCurrentAdmin(admin: AdminUser): void {
    localStorage.setItem('admin_user', JSON.stringify(admin));
  },

  logout(): void {
    localStorage.removeItem('admin_user');
  },

  isAuthenticated(): boolean {
    return this.getCurrentAdmin() !== null;
  }
};
