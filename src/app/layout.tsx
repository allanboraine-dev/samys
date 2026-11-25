import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { CustomerOrderNotifications } from "@/components/CustomerOrderNotifications";

export const metadata: Metadata = {
  title: "Samy's Wholesalers Online | Kimberley Cash & Carry",
  description: "High-speed wholesale and retail cash & carry in Transvaal Road, Kimberley, Northern Cape. Click & collect for shoppers and bulk cases for tuck-shops.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col" suppressHydrationWarning>
        <AppProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <CartDrawer />
          <CustomerOrderNotifications />
          <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center font-black text-white text-xs">
                  S
                </div>
                <span className="font-bold text-white text-sm">
                  Samy&apos;s Wholesalers (Pty) Ltd
                </span>
                <span className="text-slate-600">|</span>
                <span>Transvaal Road, Kimberley, Northern Cape, South Africa</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span>Cash &amp; Carry Hours: 07:30 - 17:30</span>
                <span>•</span>
                <span>ZAR (R) 15% VAT Inclusive</span>
              </div>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
