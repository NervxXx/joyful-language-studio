import { useState } from "react";
import { Outlet, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Menu, X, Home, BookOpen, Headphones, MessageCircle, Settings, Zap } from "lucide-react";
import { COACH_ICONS } from "@/lib/coachTypes";
import { useLanguage } from "@/contexts/LanguageContext";
export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const convParam = searchParams.get("conv");
  const activeConvId = convParam && location.pathname === "/chat" ? parseInt(convParam, 10) : null;
  const isVoiceChat = (t: string | null | undefined) => !!t && ["Аудиоразговор", "Voice chat", "Audio Conversation"].includes(t);
  const isVocabChat = (t: string | null | undefined) => !!t && ["Vocabulary Practice", "Практика словаря"].includes(t);
  const getConvIcon = (conv: { title?: string | null; coach_type?: string }) => {
    if (isVoiceChat(conv.title)) return Headphones;
    if (isVocabChat(conv.title)) return BookOpen;
    return COACH_ICONS[conv.coach_type as keyof typeof COACH_ICONS] ?? MessageCircle;
  };
  const { data: conversations = [] } = useQuery({ queryKey: ["conversations"], queryFn: () => api.getConversations(), enabled: !!user });
  const sortedConvs = [...conversations].sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());

  const mainNav = [
    { title: tr("nav.home"), url: "/", icon: Home },
    { title: tr("nav.vocabulary"), url: "/vocabulary", icon: BookOpen },
    { title: tr("nav.settings"), url: "/settings", icon: Settings },
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
                  <div className="space-y-1 mb-4">
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
                {user && (
                  <div>
                    <div className="flex justify-center px-3 mb-2">
                      <button
                        onClick={() => handleNav("/setup")}
                        className="flex items-center justify-center gap-2 min-w-[200px] px-8 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm transition-colors"
                      >
                        <span className="text-lg leading-none">+</span>
                        {tr("setup.title")}
                      </button>
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                      {tr("nav.chatHistory")}
                    </p>
                    <div className="space-y-0.5 max-h-40 overflow-y-auto">
                      {sortedConvs.slice(0, 10).map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => handleNav(`/chat?conv=${conv.id}`)}
                          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                            activeConvId === conv.id ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                          }`}
                        >
                          {(() => {
                              const Icon = getConvIcon(conv);
                              return <Icon size={16} strokeWidth={1.6} className="shrink-0 text-muted-foreground" />;
                            })()}
                          <span className="truncate flex-1">{conv.title || "AI Coach"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
          </header>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

    </SidebarProvider>
  );
}
