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
    title: "FaithCoop | Community Banking",
    description: "Digital rotational savings and multipurpose cooperative platform.",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
