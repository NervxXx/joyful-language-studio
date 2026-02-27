import { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Home,
  MessageCircle,
  BookOpen,
  Settings,
  Headphones,
  Zap,
  LogIn,
  Plus,
  MessageSquare,
  Pin,
} from "lucide-react";
import { COACH_ICONS } from "@/lib/coachTypes";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const VOICE_CHAT_TITLES = ["Аудиоразговор", "Voice chat", "Audio Conversation"];
const VOCAB_TITLES = ["Vocabulary Practice", "Практика словаря"];

function isVoiceChat(title: string | null | undefined): boolean {
  return !!title && VOICE_CHAT_TITLES.includes(title);
}

function isVocabChat(title: string | null | undefined): boolean {
  return !!title && VOCAB_TITLES.includes(title);
}

function getConvIcon(conv: { title?: string | null; coach_type?: string; avatar?: string | null }) {
  if (conv.avatar) return null; // use emoji instead
  if (isVoiceChat(conv.title)) return Headphones;
  if (isVocabChat(conv.title)) return BookOpen;
  return COACH_ICONS[conv.coach_type as keyof typeof COACH_ICONS] ?? MessageSquare;
}

function formatTimeAgo(iso: string, tr: (key: string) => string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return tr("time.justNow");
  if (mins < 60) return `${mins} ${tr("time.minAgo")}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${tr("time.hoursAgo")}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${tr("time.daysAgo")}`;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    ...(d.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  });
}

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { tr } = useLanguage();
  const { user } = useAuth();

  const convParam = searchParams.get("conv");
  const activeConvId = convParam && (location.pathname === "/chat" || location.pathname === "/audio") ? parseInt(convParam, 10) : null;

  const [renameConv, setRenameConv] = useState<{ id: number; title: string } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteConvId, setDeleteConvId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { title?: string; is_pinned?: boolean } }) =>
      api.updateConversation(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (activeConvId === id) navigate("/setup");
      setDeleteConvId(null);
    },
  });

  const handlePin = (conv: { id: number; is_pinned?: boolean }) => {
    updateMutation.mutate({ id: conv.id, data: { is_pinned: !conv.is_pinned } });
  };
  const openRename = (conv: { id: number; title: string | null }) => {
    setRenameConv({ id: conv.id, title: conv.title || "New Chat" });
    setRenameValue(conv.title || "New Chat");
  };
  const submitRename = () => {
    if (renameConv && renameValue.trim()) {
      updateMutation.mutate({ id: renameConv.id, data: { title: renameValue.trim() } });
      setRenameConv(null);
    }
  };
  const openDelete = (id: number) => setDeleteConvId(id);
  const confirmDelete = () => deleteConvId && deleteMutation.mutate(deleteConvId);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.getConversations(),
    enabled: !!user,
  });

  const sortedConvs = [...conversations].sort((a, b) => {
    const aPinned = (a as { is_pinned?: boolean }).is_pinned ? 1 : 0;
    const bPinned = (b as { is_pinned?: boolean }).is_pinned ? 1 : 0;
    if (bPinned !== aPinned) return bPinned - aPinned;
    return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
  });

  const mainNav = [
    { title: tr("nav.home"), url: "/", icon: Home },
    { title: tr("nav.vocabulary"), url: "/vocabulary", icon: BookOpen },
    { title: tr("nav.settings"), url: "/settings", icon: Settings },
  ];

  const linkClass = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors";


  const handleChatSelect = (id: number) => {
    navigate(`/chat?conv=${id}`);
  };

  const isActive = (url: string) => (url === "/" ? location.pathname === "/" : location.pathname.startsWith(url));

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
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={isActive(item.url)}
                    className={linkClass}
                  >
                    <item.icon size={18} strokeWidth={1.6} className="shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <SidebarGroup className="flex-1 min-h-0 flex flex-col">
            {!collapsed && (
              <div className="space-y-3 mb-3">
                <div className="flex justify-center px-3">
                  <button
                    onClick={() => navigate("/setup")}
                    className="flex items-center justify-center gap-2 min-w-[200px] px-8 py-3 rounded-xl border border-primary/40 hover:bg-muted text-primary font-semibold text-sm transition-colors"
                  >
                    <Plus size={18} strokeWidth={2} />
                    {tr("setup.title")}
                  </button>
                </div>
                <p className="px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {tr("nav.chatHistory")}
                </p>
              </div>
            )}
            {collapsed && (
              <div className="flex justify-center px-2 mb-3">
                <button
                  onClick={() => navigate("/setup")}
                  className="flex items-center justify-center p-2.5 rounded-xl hover:bg-muted text-primary transition-colors"
                  title={tr("setup.title")}
                >
                  <Plus size={18} strokeWidth={2} />
                </button>
              </div>
            )}
            <SidebarGroupContent className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <SidebarMenu className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {!collapsed ? (
                  <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-0.5 pr-1">
                    {sortedConvs.length === 0 ? (
                      <p className="px-3 py-4 text-xs text-muted-foreground">{tr("nav.freeConversation")} →</p>
                    ) : (
                      sortedConvs.map((conv) => (
                        <ContextMenu key={conv.id}>
                          <ContextMenuTrigger asChild>
                            <button
                              onClick={() => handleChatSelect(conv.id)}
                              className={cn(
                                "w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm transition-colors",
                                activeConvId === conv.id
                                  ? "text-primary font-medium"
                                  : "text-foreground hover:bg-muted"
                              )}
                            >
                              <span className="text-base shrink-0 mt-0.5 flex items-center gap-1">
                                {(conv as { is_pinned?: boolean }).is_pinned && (
                                  <Pin size={12} className="text-primary shrink-0" />
                                )}
                                {(conv as { avatar?: string | null }).avatar ? (
                                  <span className="text-base leading-none w-5 h-5 flex items-center justify-center">
                                    {(conv as { avatar?: string | null }).avatar}
                                  </span>
                                ) : (
                                  (() => {
                                    const Icon = getConvIcon(conv);
                                    return Icon ? <Icon size={16} strokeWidth={1.6} className="shrink-0 text-muted-foreground" /> : null;
                                  })()
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{conv.title || "AI Coach"}</p>
                                <p className="text-[11px] text-muted-foreground">{formatTimeAgo(conv.updated_at || conv.created_at, tr)}</p>
                              </div>
                            </button>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem onClick={() => handlePin(conv)}>
                              {(conv as { is_pinned?: boolean }).is_pinned ? tr("chat.unpin") : tr("chat.pin")}
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => openRename(conv)}>{tr("chat.rename")}</ContextMenuItem>
                            <ContextMenuItem onClick={() => openDelete(conv.id)} className="text-destructive focus:text-destructive">
                              {tr("chat.delete")}
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      ))
                    )}
                  </div>
                ) : (
                  sortedConvs.slice(0, 5).map((conv) => (
                    <SidebarMenuItem key={conv.id}>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <SidebarMenuButton
                            onClick={() => handleChatSelect(conv.id)}
                            isActive={activeConvId === conv.id}
                            className="!p-2"
                            title={conv.title || "AI Coach"}
                          >
                            {(conv as { is_pinned?: boolean }).is_pinned ? (
                              <Pin size={18} strokeWidth={1.6} />
                            ) : (conv as { avatar?: string | null }).avatar ? (
                              <span className="text-base">{(conv as { avatar?: string | null }).avatar}</span>
                            ) : (
                              (() => {
                                const Icon = getConvIcon(conv);
                                return Icon ? <Icon size={18} strokeWidth={1.6} /> : null;
                              })()
                            )}
                          </SidebarMenuButton>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => handlePin(conv)}>
                            {(conv as { is_pinned?: boolean }).is_pinned ? tr("chat.unpin") : tr("chat.pin")}
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => openRename(conv)}>{tr("chat.rename")}</ContextMenuItem>
                          <ContextMenuItem onClick={() => openDelete(conv.id)} className="text-destructive focus:text-destructive">
                            {tr("chat.delete")}
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {!user && (
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/login")} className={linkClass}>
                      <LogIn size={18} strokeWidth={1.6} className="shrink-0" />
                      {!collapsed && <span>Вход</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>

      <Dialog open={!!renameConv} onOpenChange={(open) => !open && setRenameConv(null)}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{tr("chat.renameTitle")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rename-input">{tr("chat.renamePlaceholder")}</Label>
              <Input
                id="rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitRename()}
                placeholder="AI Coach"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameConv(null)}>
              {tr("common.cancel")}
            </Button>
            <Button onClick={submitRename} disabled={!renameValue.trim()}>
              {tr("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConvId} onOpenChange={(open) => !open && setDeleteConvId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr("chat.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{tr("chat.deleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tr("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {tr("chat.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
