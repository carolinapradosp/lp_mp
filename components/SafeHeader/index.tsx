'use client'; // <-- Isso garante que o código rode no navegador

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';

export default function SafeHeader() {
    const pathname = usePathname();

    // Se a rota começar com /admin, não renderiza nada
    if (pathname?.startsWith('/admin') || pathname?.includes('/order-confirmation')) {
        return null;
    }

    return <Header />;
}