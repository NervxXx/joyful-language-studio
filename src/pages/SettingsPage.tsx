import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Globe, Bell, Volume2, Moon, User, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const SettingsPage = () => {
  const { lang, setLang, tr } = useLanguage();
  const [name, setName] = useState("Алекс");
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);
  const [dailyGoal, setDailyGoal] = useState("20");

  return (
    <motion.div className="p-5 md:p-8 lg:p-12 max-w-3xl mx-auto space-y-10" variants={container} initial="hidden" animate="show">
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
    </motion.div>
  );
};

export default SettingsPage;
