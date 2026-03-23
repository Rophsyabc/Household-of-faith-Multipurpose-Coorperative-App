import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.faithcoop.app',
  appName: 'FaithCoop',
  webDir: 'public',
  server: {
    // Updated with your new Vercel deployment URL
    url: 'https://household-of-faith-multipurpose-coo-pi.vercel.app/',
    cleartext: true
  }
};

export default config;
