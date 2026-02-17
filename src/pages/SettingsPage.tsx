import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Globe, Bell, Volume2, Moon, User, Palette, Shield, KeyRound,
  LogOut, Trash2, Download, Eye, EyeOff, ChevronRight, Smartphone, Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const SettingsPage = () => {
  const { lang, setLang, tr } = useLanguage();
  const [name, setName] = useState("Алекс");
  const [email] = useState("alex@example.com");
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [dailyGoal, setDailyGoal] = useState("20");

  // Password reset
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handlePasswordReset = () => {
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
    toast({ title: "✅", description: tr("settings.passwordChanged") });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordSection(false);
  };

  const handleLogoutAll = () => {
    toast({ title: "✅", description: tr("settings.loggedOutAll") });
  };

  const handleExportData = () => {
    toast({ title: "📦", description: tr("settings.dataExported") });
  };

  const handleDeleteAccount = () => {
    toast({ title: "🗑️", description: tr("settings.accountDeleted"), variant: "destructive" });
  };

  return (
    <motion.div className="p-5 md:p-8 lg:p-12 max-w-3xl mx-auto space-y-10 pb-32" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading tracking-tight">{tr("settings.title")}</h1>
        <p className="text-muted-foreground text-sm">{tr("settings.subtitle")}</p>
      </motion.div>

      {/* Profile */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="section-heading flex items-center gap-2"><User size={13} /> {tr("settings.profile")}</h2>
        <Card className="p-5 md:p-6 bg-card shadow-sm rounded-xl space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{tr("settings.name")}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 bg-background border-border rounded-xl text-base md:text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{tr("settings.email")}</label>
            <div className="flex items-center gap-2">
              <Input value={email} disabled className="h-12 bg-muted border-border rounded-xl text-base md:text-sm opacity-60" />
              <Mail size={16} className="text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{tr("settings.dailyGoal")}</label>
            <Input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(e.target.value)} className="h-12 bg-background border-border rounded-xl w-36 text-base md:text-sm" />
          </div>
        </Card>
      </motion.section>

      {/* Language */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="section-heading flex items-center gap-2"><Globe size={13} /> {tr("settings.language")}</h2>
        <Card className="p-5 md:p-6 bg-card shadow-sm rounded-xl space-y-5">
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-muted-foreground">{tr("settings.nativeLang")}</label>
            <div className="flex flex-wrap gap-2">
              {([{ code: "ru" as const, label: "Russian" }, { code: "en" as const, label: "English" }]).map((l) => (
                <button key={l.code} onClick={() => setLang(l.code)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${lang === l.code ? "chip-active" : "chip-inactive"}`}>{l.label}</button>
              ))}
            </div>
          </div>
        </Card>
      </motion.section>

      {/* Preferences */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="section-heading flex items-center gap-2"><Palette size={13} /> {tr("settings.preferences")}</h2>
        <Card className="p-5 md:p-6 bg-card shadow-sm rounded-xl divide-y divide-border">
          {[
            { icon: Bell, label: tr("settings.reminders"), desc: tr("settings.remindersDesc"), value: notifications, set: setNotifications },
            { icon: Volume2, label: tr("settings.sound"), desc: tr("settings.soundDesc"), value: sound, set: setSound },
            { icon: Moon, label: tr("settings.darkMode"), desc: tr("settings.darkModeDesc"), value: darkMode, set: setDarkMode },
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
      </motion.section>

      {/* Security & Privacy */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="section-heading flex items-center gap-2"><Shield size={13} /> {tr("settings.security")}</h2>
        <Card className="p-5 md:p-6 bg-card shadow-sm rounded-xl space-y-1">
          {/* Change Password */}
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
              exit={{ opacity: 0, height: 0 }}
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

          {/* Active Sessions / Logout All */}
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

          {/* Export Data */}
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
      </motion.section>

      {/* Danger Zone */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="section-heading flex items-center gap-2 text-destructive"><Trash2 size={13} /> {tr("settings.dangerZone")}</h2>
        <Card className="p-5 md:p-6 bg-card shadow-sm rounded-xl border-destructive/20 space-y-1">
          {/* Logout */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center justify-between py-3.5 group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <LogOut size={16} className="text-destructive" />
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
                <AlertDialogAction onClick={() => toast({ title: "👋", description: tr("settings.loggedOut") })} className="rounded-xl">{tr("settings.confirm")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Separator />

          {/* Delete Account */}
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
      </motion.section>
    </motion.div>
  );
};

export default SettingsPage;
