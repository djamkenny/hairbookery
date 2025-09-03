import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Bell, 
  Shield, 
  Settings as SettingsIcon,
  Briefcase,
  User
} from "lucide-react";

interface SettingsStatus {
  profile: {
    complete: boolean;
    fullName: string;
    specialty: string;
    location: string;
  };
  serviceType: {
    selected: boolean;
    type: 'beauty' | 'laundry' | null;
  };
  availability: {
    enabled: boolean;
    dailyLimit: number;
  };
  notifications: {
    email: boolean;
    sms: boolean;
  };
  security: {
    profileVisible: boolean;
    hasPassword: boolean;
  };
}

interface SettingsOverviewProps {
  onNavigateToSection: (sectionId: string) => void;
}

const SettingsOverview: React.FC<SettingsOverviewProps> = ({ onNavigateToSection }) => {
  const [settingsStatus, setSettingsStatus] = useState<SettingsStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettingsStatus = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          // Fetch profile data
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          const metadata = user.user_metadata || {};

          const status: SettingsStatus = {
            profile: {
              complete: !!(profile?.full_name && profile?.specialty && profile?.location),
              fullName: profile?.full_name || "",
              specialty: profile?.specialty || "",
              location: profile?.location || "",
            },
            serviceType: {
              selected: !!(profile?.is_stylist || profile?.is_laundry_specialist),
              type: profile?.is_laundry_specialist ? 'laundry' : profile?.is_stylist ? 'beauty' : null,
            },
            availability: {
              enabled: profile?.availability !== false,
              dailyLimit: profile?.daily_appointment_limit || 10,
            },
            notifications: {
              email: metadata.email_notifications !== false,
              sms: metadata.sms_notifications === true,
            },
            security: {
              profileVisible: metadata.profile_visible !== false,
              hasPassword: true, // Assume true since user exists
            },
          };

          setSettingsStatus(status);
        }
      } catch (error) {
        console.error("Error fetching settings status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettingsStatus();
  }, []);

  if (loading || !settingsStatus) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCompletionPercentage = () => {
    const checks = [
      settingsStatus.profile.complete,
      settingsStatus.serviceType.selected,
      settingsStatus.availability.enabled,
      settingsStatus.notifications.email || settingsStatus.notifications.sms,
      settingsStatus.security.profileVisible,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Settings Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">Profile Completion</h3>
              <p className="text-sm text-muted-foreground">
                Complete your settings to optimize your specialist profile
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
              <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                {completionPercentage === 100 ? "Complete" : "In Progress"}
              </Badge>
            </div>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Profile Information */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigateToSection('profile')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Profile Info</span>
              </div>
              {settingsStatus.profile.complete ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {settingsStatus.profile.complete 
                ? "Profile information complete" 
                : "Complete your profile information"
              }
            </p>
          </CardContent>
        </Card>

        {/* Service Type */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigateToSection('service-type')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Service Type</span>
              </div>
              {settingsStatus.serviceType.selected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {settingsStatus.serviceType.selected 
                ? `Selected: ${settingsStatus.serviceType.type === 'beauty' ? 'Beauty Services' : 'Laundry Services'}`
                : "Choose your service type"
              }
            </p>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigateToSection('availability')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Availability</span>
              </div>
              {settingsStatus.availability.enabled ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {settingsStatus.availability.enabled 
                ? `${settingsStatus.availability.dailyLimit} appointments/day`
                : "Availability disabled"
              }
            </p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigateToSection('notifications')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Notifications</span>
              </div>
              {(settingsStatus.notifications.email || settingsStatus.notifications.sms) ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {settingsStatus.notifications.email && settingsStatus.notifications.sms ? "Email & SMS enabled" :
               settingsStatus.notifications.email ? "Email enabled" :
               settingsStatus.notifications.sms ? "SMS enabled" :
               "No notifications enabled"}
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigateToSection('security')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Security</span>
              </div>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground">
              Profile {settingsStatus.security.profileVisible ? "public" : "private"}
            </p>
          </CardContent>
        </Card>
      </div>

      {completionPercentage < 100 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                <SettingsIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-orange-900 dark:text-orange-100">
                  Complete Your Setup
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Finish configuring your settings to maximize your profile visibility and bookings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsOverview;