// app/(store)/layout.tsx

import Footer from "@/components/Footer";
import MercadoPagoScripts from "@/components/MercadoPagoScripts";
import SafeHeader from "@/components/SafeHeader";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <SafeHeader />

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      <MercadoPagoScripts />
    </div>
  );
}