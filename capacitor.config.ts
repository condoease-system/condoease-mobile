import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.condoease.tenant',
  appName: 'CondoEase',
  webDir: 'out',
  server: {
    hostname: 'condoease.vercel.app',
    androidScheme: 'https',
  },
};

export default config;
