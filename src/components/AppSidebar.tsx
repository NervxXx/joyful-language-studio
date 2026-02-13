import { Home, MessageCircle, BookOpen, Settings, Headphones, Gamepad2, Mic, PenLine, Zap } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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

const mainNav = [
  { title: "Home", url: "/", icon: Home },
  { title: "Free Conversation", url: "/setup", icon: MessageCircle },
  { title: "Vocabulary", url: "/vocabulary", icon: BookOpen },
  { title: "Listening Lab", url: "/listening", icon: Headphones },
];

const extraNav = [
  { title: "Grammar Quest", url: "/grammar", icon: Gamepad2 },
  { title: "Pronunciation", url: "/pronunciation", icon: Mic },
  { title: "Writing Mentor", url: "/writing", icon: PenLine },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const linkClass = "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="px-4 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Zap size={16} className="text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-semibold text-foreground text-base tracking-tight">LinguaAI</span>}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/60 px-3 mb-1">
            Learn
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={linkClass}
                      activeClassName="bg-sidebar-accent text-foreground font-medium"
                    >
                      <item.icon size={18} strokeWidth={1.5} className="shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/60 px-3 mb-1">
            More
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {extraNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={linkClass}
                      activeClassName="bg-sidebar-accent text-foreground font-medium"
                    >
                      <item.icon size={18} strokeWidth={1.5} className="shrink-0" />
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
                    <NavLink
                      to="/settings"
                      className={linkClass}
                      activeClassName="bg-sidebar-accent text-foreground font-medium"
                    >
                      <Settings size={18} strokeWidth={1.5} className="shrink-0" />
                      {!collapsed && <span>Settings</span>}
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
