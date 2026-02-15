import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Menu, X, Home, MessageCircle, BookOpen, Headphones, Gamepad2, Mic, PenLine, Settings, Zap, Map } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEnergy } from "@/contexts/EnergyContext";
import EnergyIndicator from "./EnergyIndicator";
import MoodCheckDialog from "./MoodCheckDialog";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const { tr } = useLanguage();
  const { moodChecked } = useEnergy();
  const navigate = useNavigate();
  const location = useLocation();

  // Show mood check on first visit
  useEffect(() => {
    if (!moodChecked) {
      const timer = setTimeout(() => setMoodOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [moodChecked]);

  const mainNav = [
    { title: tr("nav.home"), url: "/", icon: Home },
    { title: tr("nav.freeConversation"), url: "/setup", icon: MessageCircle },
    { title: tr("nav.vocabulary"), url: "/vocabulary", icon: BookOpen },
    { title: tr("nav.listeningLab"), url: "/listening", icon: Headphones },
    { title: tr("nav.skillMap"), url: "/skills", icon: Map },
  ];

  const extraNav = [
    { title: tr("nav.grammarQuest"), url: "/grammar", icon: Gamepad2 },
    { title: tr("nav.pronunciation"), url: "/pronunciation", icon: Mic },
    { title: tr("nav.writingMentor"), url: "/writing", icon: PenLine },
  ];

  const handleNav = (url: string) => {
    navigate(url);
    setMobileOpen(false);
  };

  const isActive = (url: string) => url === "/" ? location.pathname === "/" : location.pathname.startsWith(url);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        {/* Mobile burger menu overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <nav className="absolute left-0 top-0 bottom-0 w-72 bg-card shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
                    <Zap size={15} className="text-primary-foreground" />
                  </div>
                  <span className="font-heading font-bold text-foreground text-base tracking-tight">LinguaAI</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">{tr("nav.learn")}</p>
                  <div className="space-y-1">
                    {mainNav.map((item) => (
                      <button
                        key={item.url}
                        onClick={() => handleNav(item.url)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          isActive(item.url) ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <item.icon size={18} strokeWidth={1.6} className="shrink-0" />
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">{tr("nav.more")}</p>
                  <div className="space-y-1">
                    {extraNav.map((item) => (
                      <button
                        key={item.url}
                        onClick={() => handleNav(item.url)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          isActive(item.url) ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <item.icon size={18} strokeWidth={1.6} className="shrink-0" />
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-border">
                <button
                  onClick={() => handleNav("/settings")}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive("/settings") ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Settings size={18} strokeWidth={1.6} className="shrink-0" />
                  <span>{tr("nav.settings")}</span>
                </button>
              </div>
            </nav>
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
              <EnergyIndicator onClick={() => setMoodOpen(true)} />
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

      <MoodCheckDialog open={moodOpen} onClose={() => setMoodOpen(false)} />
    </SidebarProvider>
  );
}
