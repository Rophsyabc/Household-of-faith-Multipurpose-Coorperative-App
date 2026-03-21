'use client';

import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export default function StatusBarManager() {
    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            // Set Status Bar Background to Cyan-600
            StatusBar.setBackgroundColor({ color: '#0891b2' });
            // Set icons to Light (since background is dark)
            StatusBar.setStyle({ style: Style.Dark });
        }
    }, []);

    return null;
}
