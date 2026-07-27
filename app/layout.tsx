// app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
};

export const metadata: Metadata = {
    title: {
        default: "LP MP",
        template: "%s | LP MP",
    },
    description:
        "Compre agora os melhores produtos com descontos incríveis!",
    icons: {
        icon: "/icon.png",
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body
                className={`${montserrat.variable} min-h-screen antialiased`}
            >
                {children}
            </body>
        </html>
    );
}