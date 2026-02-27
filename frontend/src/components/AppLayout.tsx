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

/** Seamless adaptive background with biomorphic blobs, particles & floating letters */
function SeamlessBackground() {
  const letters = [
    { char: "A", top: "10%", left: "7%", size: "clamp(1.6rem, 3vw, 2.8rem)", delay: "0s", dur: "8s" },
    { char: "B", top: "16%", right: "10%", size: "clamp(1.2rem, 2.2vw, 2rem)", delay: "1.2s", dur: "10s" },
    { char: "英", top: "52%", left: "4%", size: "clamp(1.3rem, 2.5vw, 2.2rem)", delay: "2.5s", dur: "9s" },
    { char: "C", bottom: "18%", right: "7%", size: "clamp(1.4rem, 2.8vw, 2.4rem)", delay: "0.8s", dur: "11s" },
    { char: "✦", top: "33%", right: "4%", size: "clamp(0.8rem, 1.4vw, 1.3rem)", delay: "3.5s", dur: "7s" },
    { char: "◇", bottom: "32%", left: "9%", size: "clamp(1rem, 1.8vw, 1.6rem)", delay: "1.8s", dur: "9s" },
    { char: "★", top: "70%", right: "15%", size: "clamp(0.7rem, 1.2vw, 1.1rem)", delay: "4s", dur: "8s" },
  ];

  const particles = [
    { cls: "bg-particle--sm", top: "15%", left: "20%", delay: "0s" },
    { cls: "bg-particle--md", top: "40%", right: "12%", delay: "1.5s" },
    { cls: "bg-particle--lg", bottom: "25%", left: "35%", delay: "0.8s" },
    { cls: "bg-particle--sm", top: "60%", right: "30%", delay: "2.2s" },
    { cls: "bg-particle--md", bottom: "40%", right: "45%", delay: "3s" },
    { cls: "bg-particle--sm", top: "25%", left: "55%", delay: "1s" },
    { cls: "bg-particle--lg", bottom: "15%", right: "18%", delay: "2.8s" },
    { cls: "bg-particle--sm", top: "75%", left: "12%", delay: "3.5s" },
  ];

  return (
    <>
      {/* 5 biomorphic fluid blobs — viewport-relative */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      <div className="bg-blob bg-blob-4" />
      <div className="bg-blob bg-blob-5" />

      {/* Glowing particles */}
      {particles.map((p, i) => (
        <div
          key={`p-${i}`}
          className={`bg-particle ${p.cls}`}
          style={{
            top: p.top,
            left: (p as { left?: string }).left,
            right: (p as { right?: string }).right,
            bottom: (p as { bottom?: string }).bottom,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Floating letters — viewport-scaled */}
      {letters.map((l, i) => (
        <span
          key={`l-${i}`}
          className="floating-letter"
          style={{
            top: l.top,
            left: (l as { left?: string }).left,
            right: (l as { right?: string }).right,
            bottom: (l as { bottom?: string }).bottom,
            fontSize: l.size,
            animation: `${i % 2 === 0 ? "float-letter" : "float-letter-reverse"} ${l.dur} ease-in-out ${l.delay} infinite`,
          }}
        >
          {l.char}
        </span>
      ))}

      {/* Holographic accent line */}
      <div className="holo-accent" style={{ position: "absolute", bottom: "30%", left: "5%", right: "5%" }} />
    </>
  );
}

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
      <div className="min-h-screen flex w-full relative">
        {/* Seamless adaptive background */}
        <div className="bg-decoration">
          <SeamlessBackground />
        </div>

        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        {/* Mobile burger menu overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
            <nav className="absolute left-0 top-0 bottom-0 w-72 sidebar-glass shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col border-r border-white/10">
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl gradient-primary flex items-center justify-center shrink-0 shadow-glow-blue">
                    <Zap size={15} className="text-primary-foreground" />
                  </div>
                  <span className="font-heading font-bold text-foreground text-base tracking-tight">LinguaAI</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
                <div>
                  <div className="space-y-1 mb-4">
                    {mainNav.map((item) => (
                      <button
                        key={item.url}
                        onClick={() => handleNav(item.url)}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm transition-all ${isActive(item.url) ? "text-primary font-medium shadow-soft" : "text-foreground hover:bg-muted/50"
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
                    <div className="flex justify-center px-3 mb-3">
                      <button
                        onClick={() => handleNav("/setup")}
                        className="flex items-center justify-center gap-2 min-w-[200px] px-8 py-3.5 rounded-2xl hover:bg-muted text-primary font-semibold text-sm transition-all hover:shadow-soft"
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
                          className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-2xl text-left text-sm transition-all ${activeConvId === conv.id ? "text-primary font-medium" : "text-foreground hover:bg-muted/50"
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
          <header className="h-14 flex items-center justify-between px-4 lg:px-6 glass-header sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-muted/50 transition-colors">
                <Menu size={20} className="text-foreground" />
              </button>
              <div className="hidden lg:block">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                  <Zap size={12} className="text-primary-foreground" />
                </div>
                <span className="font-heading font-bold text-foreground text-sm tracking-tight">LinguaAI</span>
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
