// app/(store)/layout.tsx

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MercadoPagoScripts from "@/components/MercadoPagoScripts";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      <MercadoPagoScripts />
    </div>
  );
}