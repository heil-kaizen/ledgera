import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Toaster } from "sonner";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans flex flex-col selection:bg-charity-accent/30">
      <Toaster position="top-center" expand={false} richColors />
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
