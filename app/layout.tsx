import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope", 
});

export const metadata: Metadata = {
    title: "Household of Faith Multipurpose Cooperative",
    description: "Digital rotational savings and multipurpose cooperative platform.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body suppressHydrationWarning className={`${manrope.variable} font-sans antialiased bg-slate-50`} >
                {children}
                
                <Toaster 
                    position="top-right" 
                    richColors 
                    closeButton
                    toastOptions={{
                        style: { fontFamily: 'var(--font-manrope)' },
                        className: 'font-sans'
                    }}
                />
            </body>
        </html>
    );
}
