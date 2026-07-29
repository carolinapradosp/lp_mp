// app/admin/(protected)/dashboard/page.tsx

import { redirect } from 'next/navigation';

import DashboardContent from '@/components/AdminComponents/DashboardContent';
import HeaderAdmin from '@/components/AdminComponents/HeaderAdmin';
import { verifyAdminSession } from '@/lib/auth/admin-session';
import { getOrdersFromDatabase } from '@/lib/orders/queries';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const isAuthenticated = await verifyAdminSession();

    if (!isAuthenticated) {
        redirect('/admin');
    }

    const initialData = await getOrdersFromDatabase();

    return (
        <main className="min-h-screen bg-[#f5f7fb] p-4 lg:p-8">
            <div className="mx-auto max-w-480">
                <HeaderAdmin />

                <DashboardContent
                    initialOrders={initialData.orders}
                    initialTotalOrders={initialData.totalOrders}
                />
            </div>
        </main>
    );
}