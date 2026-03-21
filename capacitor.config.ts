import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.faithcoop.app',
  appName: 'FaithCoop',
  // Change webDir to 'public' to avoid the 'out' folder error during sync
  // while we are using the 'Live URL' method.
  webDir: 'public',
  server: {
    // IMPORTANT: Replace '192.168.x.x' with your actual computer IP for testing
    // Example: url: 'http://192.168.1.15:3000'
    url: 'http://192.168.x.x:3000',
    cleartext: true
  }
};

export default config;
