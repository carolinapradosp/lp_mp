import HeaderAdmin from "@/components/AdminComponents/HeaderAdmin";
import DashboardContent from "@/components/AdminComponents/DashboardContent";

export default function DashboardPage() {
    return (
        <main className="min-h-screen bg-[#f5f7fb] p-4 lg:p-8">
            <div className="mx-auto max-w-480">
                <HeaderAdmin />
                <DashboardContent />
            </div>
        </main>
    );
}