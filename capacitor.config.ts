import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.faithcoop.app',
  appName: 'FaithCoop',
  webDir: 'public',
  server: {
    // Replace with your actual Vercel URL
    url: 'https://household-of-faith-cooperative-app.vercel.app',
    cleartext: true
  }
};

export default config;
