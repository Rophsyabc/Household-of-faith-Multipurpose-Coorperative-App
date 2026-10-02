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
    title: "Household of Faith | Multipurpose Cooperative",
    description: "Digital cooperative banking platform for savings, loans, Ajo (Esusu), and investment.",
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
