import { Home, MessageCircle, BookOpen, Settings, Headphones, Gamepad2, Mic, PenLine, Zap, Map } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { tr } = useLanguage();

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

  const linkClass = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="px-4 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-sm">
          <Zap size={15} className="text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-heading font-bold text-foreground text-base tracking-tight">LinguaAI</span>}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="section-heading px-3 mb-1.5">
            {tr("nav.learn")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/"} className={linkClass} activeClassName="bg-primary/8 text-primary font-medium">
                      <item.icon size={18} strokeWidth={1.6} className="shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="section-heading px-3 mb-1.5">
            {tr("nav.more")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {extraNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={linkClass} activeClassName="bg-primary/8 text-primary font-medium">
                      <item.icon size={18} strokeWidth={1.6} className="shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/settings" className={linkClass} activeClassName="bg-primary/8 text-primary font-medium">
                      <Settings size={18} strokeWidth={1.6} className="shrink-0" />
                      {!collapsed && <span>{tr("nav.settings")}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
