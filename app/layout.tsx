import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import StatusBarManager from './components/StatusBarManager';

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope", 
});

export const metadata: Metadata = {
    title: {
        default: "Household of Faith Multipurpose Cooperative",
        template: "%s | Household of Faith Multipurpose Cooperative",
    },
    description: "Official digital portal for Household of Faith Multipurpose Cooperative Society. Providing structured cooperative savings, rotational Ajo cycles, accessible member loans, and community economic empowerment.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://household-of-faith-multipurpose.onrender.com'),
    openGraph: {
        title: "Household of Faith Multipurpose Cooperative",
        description: "Official digital portal for Household of Faith Multipurpose Cooperative Society.",
        url: 'https://household-of-faith-multipurpose.onrender.com',
        siteName: 'Household of Faith Multipurpose Cooperative',
        locale: 'en_NG',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "Household of Faith Multipurpose Cooperative",
        description: "Official digital portal for Household of Faith Multipurpose Cooperative Society.",
    },
    icons: {
        icon: '/favicon.ico',
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body suppressHydrationWarning className={`${manrope.variable} font-sans antialiased bg-slate-50`} >
                <StatusBarManager />
                {children}
                
                <Toaster 
                    position="top-center" 
                    richColors 
                    closeButton
                    toastOptions={{
                        style: { fontFamily: 'var(--font-manrope)', borderRadius: '1.25rem' },
                        className: 'font-sans mobile-toast'
                    }}
                />
            </body>
        </html>
    );
}
