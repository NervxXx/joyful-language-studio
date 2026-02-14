import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { tr } = useLanguage();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-card shadow-xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-heading font-semibold text-foreground">{tr("nav.menu")}</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>
              <AppSidebar />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
                <Menu size={20} className="text-foreground" />
              </button>
              <div className="hidden lg:block">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              </div>
              <span className="font-heading font-semibold text-foreground text-sm tracking-tight">LinguaAI</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <Bell size={18} strokeWidth={1.5} className="text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
              </button>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">А</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
