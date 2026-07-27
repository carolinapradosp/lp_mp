// app/admin/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administração",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] w-full">
      {children}
    </div>
  );
}