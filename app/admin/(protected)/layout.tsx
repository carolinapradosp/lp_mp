// app/admin/(protected)/layout.tsx

import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/admin-session';

export default async function ProtectedAdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const isAuthenticated = await verifyAdminSession();

    if (!isAuthenticated) {
        redirect('/admin');
    }

    return children;
}