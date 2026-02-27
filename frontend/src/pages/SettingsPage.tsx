import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Globe,
  Bell,
  Volume2,
  Moon,
  User,
  Shield,
  KeyRound,
  LogOut,
  Trash2,
  Download,
  Eye,
  EyeOff,
  ChevronRight,
  Smartphone,
  Mail,
  Sun,
  Monitor,
  Database,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";
type SettingsCategory = "general" | "profile" | "data" | "account";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const CATEGORIES: { id: SettingsCategory; icon: typeof Settings }[] = [
  { id: "general", icon: Settings },
  { id: "profile", icon: User },
  { id: "data", icon: Database },
  { id: "account", icon: Shield },
];

const SettingsPage = () => {
  const { lang, setLang, tr } = useLanguage();
  const { user, logout, refetchUser } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("general");

  const [name, setName] = useState(user?.full_name || user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    return stored && ["light", "dark", "system"].includes(stored) ? stored : "system";
  });
  const [dailyGoal, setDailyGoal] = useState("20");

  useEffect(() => {
    if (user) {
      setName(user.full_name || user.username || "");
      setEmail(user.email || "");
      setDailyGoal(String((user as { daily_goal_minutes?: number }).daily_goal_minutes ?? 20));
      setNotifications((user as { notifications_enabled?: boolean }).notifications_enabled ?? true);
      setSound((user as { sound_enabled?: boolean }).sound_enabled ?? true);
    }
  }, [user]);

  useEffect(() => {
    const applyTheme = (t: Theme) => {
      if (t === "system") {
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.toggle("dark", dark);
      } else {
        document.documentElement.classList.toggle("dark", t === "dark");
      }
    };
    applyTheme(theme);
    localStorage.setItem("theme", theme);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => theme === "system" && applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await api.updateMe({
        full_name: name,
        daily_goal_minutes: parseInt(dailyGoal, 10) || 20,
        notifications_enabled: notifications,
        sound_enabled: sound,
      });
      await refetchUser();
      toast({ title: "✅", description: "Профиль сохранён" });
    } catch (err) {
      toast({ title: tr("settings.error"), description: (err as Error).message, variant: "destructive" });
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const handlePasswordReset = async () => {
    if (!currentPassword) {
      toast({ title: tr("settings.error"), description: tr("settings.enterCurrentPassword"), variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: tr("settings.error"), description: tr("settings.passwordMinLength"), variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: tr("settings.error"), description: tr("settings.passwordMismatch"), variant: "destructive" });
      return;
    }
    try {
      await api.updateMe({ password: newPassword });
      toast({ title: "✅", description: tr("settings.passwordChanged") });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (err) {
      toast({ title: tr("settings.error"), description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logout();
      toast({ title: "✅", description: tr("settings.loggedOutAll") });
      navigate("/");
    } catch {
      toast({ title: tr("settings.error"), description: "Не удалось выйти", variant: "destructive" });
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `english-studio-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast({ title: "📦", description: tr("settings.dataExported") });
    } catch (err) {
      toast({ title: tr("settings.error"), description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount();
      logout();
      toast({ title: "🗑️", description: tr("settings.accountDeleted"), variant: "destructive" });
      navigate("/");
    } catch (err) {
      toast({ title: tr("settings.error"), description: (err as Error).message, variant: "destructive" });
    }
  };

  const categoryLabel = (id: SettingsCategory) => {
    switch (id) {
      case "general": return tr("settings.general");
      case "profile": return tr("settings.profile");
      case "data": return tr("settings.data");
      case "account": return tr("settings.account");
    }
  };

  return (
    <motion.div
      className="flex flex-col lg:flex-row min-h-0 flex-1 p-5 md:p-8 lg:p-10 gap-8 lg:gap-10 max-w-5xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Sidebar - categories */}
      <motion.nav
        variants={item}
        className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 shrink-0 lg:w-48"
      >
        {CATEGORIES.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
              activeCategory === id
                ? "text-primary font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon size={18} strokeWidth={1.6} className="shrink-0" />
            {categoryLabel(id)}
          </button>
        ))}
      </motion.nav>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-6 pb-20">
        <motion.div variants={item}>
          <h1 className="text-xl font-bold text-foreground font-heading">{categoryLabel(activeCategory)}</h1>
        </motion.div>

        {activeCategory === "general" && (
          <motion.div variants={item} className="space-y-8">
            <Card className="p-5 md:p-6 bg-card shadow-sm rounded-xl space-y-5">
              <h2 className="text-sm font-semibold text-foreground">{tr("settings.theme")}</h2>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: "light" as const, icon: Sun, label: tr("settings.themeLight") },
                  { value: "dark" as const, icon: Moon, label: tr("settings.themeDark") },
                  { value: "system" as const, icon: Monitor, label: tr("settings.themeSystem") },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all border",
                      theme === value
                        ? "text-primary border-primary shadow-sm"
                        : "bg-muted/50 hover:bg-muted border-transparent"
                    )}
                  >
                    <Icon size={18} strokeWidth={1.6} />
                    {label}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5 md:p-6 bg-card shadow-sm rounded-xl space-y-4">
              <h2 className="text-sm font-semibold text-foreground">{tr("settings.language")}</h2>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">{tr("settings.nativeLang")}</label>
                <Select value={lang} onValueChange={(v) => setLang(v as "ru" | "en")}>
                  <SelectTrigger className="h-11 rounded-xl max-w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <Card className="p-5 md:p-6 bg-card shadow-sm rounded-xl divide-y divide-border">
              {[
                { icon: Bell, label: tr("settings.reminders"), desc: tr("settings.remindersDesc"), value: notifications, set: setNotifications },
                { icon: Volume2, label: tr("settings.sound"), desc: tr("settings.soundDesc"), value: sound, set: setSound },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <pref.icon size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{pref.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{pref.desc}</p>
                    </div>
                  </div>
                  <Switch checked={pref.value} onCheckedChange={pref.set} />
                </div>
              ))}
            </Card>
          </motion.div>
        )}

        {activeCategory === "profile" && (
          <motion.div variants={item}>
            <Card className="p-5 md:p-6 bg-card shadow-sm rounded-xl space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{tr("settings.name")}</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 bg-background border-border rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{tr("settings.email")}</label>
                <div className="flex items-center gap-2">
                  <Input value={email} disabled className="h-12 bg-muted border-border rounded-xl opacity-60 flex-1" />
                  <Mail size={16} className="text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{tr("settings.dailyGoal")}</label>
                <Input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(e.target.value)} className="h-12 bg-background border-border rounded-xl w-36" />
              </div>
              {user && <Button onClick={handleSaveProfile} className="rounded-xl">Сохранить</Button>}
            </Card>
          </motion.div>
        )}

        {activeCategory === "data" && (
          <motion.div variants={item}>
            <Card className="p-5 md:p-6 bg-card shadow-sm rounded-xl space-y-1">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full flex items-center justify-between py-3.5 group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <Smartphone size={16} className="text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">{tr("settings.logoutAll")}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tr("settings.logoutAllDesc")}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{tr("settings.logoutAllConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>{tr("settings.logoutAllConfirmDesc")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">{tr("settings.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogoutAll} className="rounded-xl">{tr("settings.confirm")}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Separator />

              <button onClick={handleExportData} className="w-full flex items-center justify-between py-3.5 group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Download size={16} className="text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{tr("settings.exportData")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tr("settings.exportDataDesc")}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            </Card>
          </motion.div>
        )}

        {activeCategory === "account" && (
          <motion.div variants={item}>
            <Card className="p-5 md:p-6 bg-card shadow-sm rounded-xl space-y-1">
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="w-full flex items-center justify-between py-3.5 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <KeyRound size={16} className="text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{tr("settings.changePassword")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tr("settings.changePasswordDesc")}</p>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-muted-foreground transition-transform ${showPasswordSection ? "rotate-90" : ""}`} />
              </button>

              {showPasswordSection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="pl-14 pr-2 pb-4 space-y-3"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{tr("settings.currentPassword")}</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-11 bg-background border-border rounded-xl text-sm pr-10"
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{tr("settings.newPassword")}</label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-11 bg-background border-border rounded-xl text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{tr("settings.confirmPassword")}</label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11 bg-background border-border rounded-xl text-sm" />
                  </div>
                  <Button onClick={handlePasswordReset} className="rounded-xl mt-1">{tr("settings.savePassword")}</Button>
                </motion.div>
              )}

              <Separator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full flex items-center justify-between py-3.5 group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <LogOut size={16} className="text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">{tr("settings.logout")}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tr("settings.logoutDesc")}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{tr("settings.logoutConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>{tr("settings.logoutConfirmDesc")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">{tr("settings.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        await logout();
                        toast({ title: "👋", description: tr("settings.loggedOut") });
                        navigate("/");
                      }}
                      className="rounded-xl"
                    >
                      {tr("settings.confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Separator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full flex items-center justify-between py-3.5 group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <Trash2 size={16} className="text-destructive" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-destructive">{tr("settings.deleteAccount")}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tr("settings.deleteAccountDesc")}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{tr("settings.deleteConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>{tr("settings.deleteConfirmDesc")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">{tr("settings.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">{tr("settings.deleteForever")}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SettingsPage;
