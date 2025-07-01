
import { supabase } from "@/integrations/supabase/client";

export interface AdminSession {
  id: string;
  email: string;
  full_name: string;
  role: string;
  expires_at: number;
  session_token: string;
}

export interface AdminAuthResponse {
  success: boolean;
  message?: string;
  admin?: AdminSession;
}

class AdminAuthService {
  private readonly SESSION_KEY = 'admin_session';
  private readonly SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
  private loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  private isRateLimited(email: string): boolean {
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return false;

    const now = Date.now();
    if (now - attempts.lastAttempt > this.LOCKOUT_DURATION) {
      this.loginAttempts.delete(email);
      return false;
    }

    return attempts.count >= this.MAX_LOGIN_ATTEMPTS;
  }

  private recordLoginAttempt(email: string, success: boolean): void {
    if (success) {
      this.loginAttempts.delete(email);
      return;
    }

    const now = Date.now();
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    
    this.loginAttempts.set(email, {
      count: attempts.count + 1,
      lastAttempt: now
    });
  }

  private generateSessionToken(): string {
    return crypto.randomUUID() + '-' + Date.now().toString(36);
  }

  async login(email: string, password: string): Promise<AdminAuthResponse> {
    try {
      // Rate limiting check
      if (this.isRateLimited(email)) {
        return { 
          success: false, 
          message: 'Too many failed attempts. Please try again later.' 
        };
      }

      // Input validation
      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      if (email.length > 255 || password.length > 255) {
        return { success: false, message: 'Invalid input length' };
      }

      const { data, error } = await supabase.rpc('authenticate_admin', {
        p_email: email.toLowerCase().trim(),
        p_password: password
      });

      if (error) {
        console.error('Admin login error:', error);
        this.recordLoginAttempt(email, false);
        return { success: false, message: 'Authentication failed' };
      }

      const response = data as unknown as AdminAuthResponse;
      
      if (!response.success) {
        this.recordLoginAttempt(email, false);
        return { success: false, message: 'Invalid credentials' };
      }

      // Create secure session
      const sessionToken = this.generateSessionToken();
      const expiresAt = Date.now() + this.SESSION_DURATION;
      
      const adminSession: AdminSession = {
        ...response.admin!,
        expires_at: expiresAt,
        session_token: sessionToken
      };

      // Store session securely
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(adminSession));
      
      this.recordLoginAttempt(email, true);
      
      // Log security event
      this.logSecurityEvent('admin_login_success', response.admin!.id);
      
      return { success: true, admin: adminSession };
    } catch (error) {
      console.error('Admin login error:', error);
      this.recordLoginAttempt(email, false);
      return { success: false, message: 'Authentication failed' };
    }
  }

  getCurrentAdmin(): AdminSession | null {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      const session: AdminSession = JSON.parse(sessionData);
      
      // Check if session has expired
      if (Date.now() > session.expires_at) {
        this.logout();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error getting current admin:', error);
      this.logout();
      return null;
    }
  }

  logout(): void {
    const session = this.getCurrentAdmin();
    if (session) {
      this.logSecurityEvent('admin_logout', session.id);
    }
    
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  isAuthenticated(): boolean {
    return this.getCurrentAdmin() !== null;
  }

  refreshSession(): boolean {
    const session = this.getCurrentAdmin();
    if (!session) return false;

    // Extend session by 8 hours
    session.expires_at = Date.now() + this.SESSION_DURATION;
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    
    return true;
  }

  private async logSecurityEvent(eventType: string, userId: string): Promise<void> {
    try {
      await supabase.rpc('log_security_event', {
        event_type: eventType,
        user_id: userId,
        details: {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ip_address: 'client-side' // Would need server-side logging for real IP
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

export const secureAdminAuth = new AdminAuthService();
