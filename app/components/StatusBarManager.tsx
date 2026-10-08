'use client';

import { useEffect } from 'react';

export default function StatusBarManager() {
    useEffect(() => {
        // Dynamically import Capacitor modules only on native platforms.
        // Static imports cause a client-side exception in the web browser bundle.
        import('@capacitor/core').then(({ Capacitor }) => {
            if (Capacitor.isNativePlatform()) {
                Promise.all([
                    import('@capacitor/status-bar'),
                ]).then(([{ StatusBar, Style }]) => {
                    StatusBar.setBackgroundColor({ color: '#0891b2' });
                    StatusBar.setStyle({ style: Style.Dark });
                }).catch(() => {
                    // Status bar not available — silently ignore on web
                });
            }
        }).catch(() => {
            // Capacitor not available — silently ignore on web
        });
    }, []);

    return null;
}
