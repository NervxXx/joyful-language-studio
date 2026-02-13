import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Globe, Bell, Volume2, Moon, User, Palette } from "lucide-react";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const languages = ["English", "Spanish", "French", "German", "Japanese", "Chinese"];

const SettingsPage = () => {
  const [name, setName] = useState("Алекс");
  const [nativeLang, setNativeLang] = useState("Russian");
  const [targetLang, setTargetLang] = useState("English");
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [dailyGoal, setDailyGoal] = useState("20");

  return (
    <motion.div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-8" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your learning experience</p>
      </motion.div>

      {/* Profile */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <User size={14} /> Profile
        </h2>
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 bg-background border-border" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Daily goal (minutes)</label>
            <Input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(e.target.value)} className="h-11 bg-background border-border w-32" />
          </div>
        </Card>
      </motion.section>

      {/* Language */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Globe size={14} /> Language
        </h2>
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Native language</label>
            <div className="flex flex-wrap gap-2">
              {["Russian", ...languages].map((l) => (
                <button
                  key={l}
                  onClick={() => setNativeLang(l)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${nativeLang === l ? "chip-active" : "chip-inactive"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Learning language</label>
            <div className="flex flex-wrap gap-2">
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => setTargetLang(l)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${targetLang === l ? "chip-active" : "chip-inactive"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.section>

      {/* Preferences */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Palette size={14} /> Preferences
        </h2>
        <Card className="p-5 bg-card border-border divide-y divide-border">
          {[
            { icon: Bell, label: "Daily reminders", desc: "Get notified to practice", value: notifications, set: setNotifications },
            { icon: Volume2, label: "Sound effects", desc: "Play sounds on actions", value: sound, set: setSound },
            { icon: Moon, label: "Dark mode", desc: "Use dark theme", value: darkMode, set: setDarkMode },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <pref.icon size={16} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{pref.label}</p>
                  <p className="text-xs text-muted-foreground">{pref.desc}</p>
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
