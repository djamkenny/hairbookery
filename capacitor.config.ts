import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.de68457213a44e16b5678501d5a7ddea',
  appName: 'knlbookery',
  webDir: 'dist',
  server: {
    url: "https://de684572-13a4-4e16-b567-8501d5a7ddea.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    Share: {
      enabled: true
    },
    AppLauncher: {
      enabled: true
    }
  }
};

export default config;