import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, MessageCircle, Headphones, PenLine, Mic, Gamepad2, TrendingUp, Star, Zap } from "lucide-react";

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

interface Skill {
  key: string;
  icon: typeof BookOpen;
  level: number;
  maxLevel: number;
  xp: number;
  nextXp: number;
  color: string;
}

const initialSkills: Skill[] = [
  { key: "vocabulary", icon: BookOpen, level: 4, maxLevel: 10, xp: 340, nextXp: 500, color: "bg-primary" },
  { key: "grammar", icon: Gamepad2, level: 3, maxLevel: 10, xp: 210, nextXp: 400, color: "bg-accent" },
  { key: "fluency", icon: MessageCircle, level: 2, maxLevel: 10, xp: 120, nextXp: 300, color: "bg-success" },
  { key: "listening", icon: Headphones, level: 3, maxLevel: 10, xp: 280, nextXp: 400, color: "bg-warning" },
  { key: "pronunciation", icon: Mic, level: 1, maxLevel: 10, xp: 45, nextXp: 200, color: "bg-destructive" },
  { key: "writing", icon: PenLine, level: 2, maxLevel: 10, xp: 90, nextXp: 300, color: "bg-primary" },
];

const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
const currentCefr = 1;

// Particle component for level-up celebration
const LevelUpParticles = ({ color }: { color: string }) => {
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const rad = (angle * Math.PI) / 180;
    const distance = 60 + Math.random() * 40;
    const x = Math.cos(rad) * distance;
    const y = Math.sin(rad) * distance;
    const isstar = i % 3 === 0;
    return { id: i, x, y, isstar, delay: i * 0.03 };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.8, delay: p.delay, ease: "easeOut" }}
        >
          {p.isstar ? (
            <Star size={14} className={`${color.replace("bg-", "text-")} fill-current`} />
          ) : (
            <span className="text-lg">{["✨", "🎉", "⭐", "🌟"][p.id % 4]}</span>
          )}
        </motion.div>
      ))}
    </div>
  );
};

const SkillMapPage = () => {
  const { tr } = useLanguage();
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [levelUpKey, setLevelUpKey] = useState<string | null>(null);

  const totalXp = skills.reduce((s, sk) => s + sk.xp, 0);
  const avgLevel = Math.round(skills.reduce((s, sk) => s + sk.level, 0) / skills.length * 10) / 10;

  const easiest = skills.reduce((best, sk) => {
    const pct = sk.xp / sk.nextXp;
    return pct > (best.xp / best.nextXp) ? sk : best;
  });

  const handleLevelUp = useCallback((key: string) => {
    setSkills((prev) =>
      prev.map((sk) =>
        sk.key === key
          ? { ...sk, level: Math.min(sk.level + 1, sk.maxLevel), xp: 0 }
          : sk
      )
    );
    setLevelUpKey(key);
    setTimeout(() => setLevelUpKey(null), 1200);
  }, []);

  return (
    <motion.div className="p-5 md:p-8 lg:p-12 max-w-4xl mx-auto space-y-10" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading tracking-tight">{tr("skills.title")}</h1>
        <p className="text-muted-foreground text-sm">{tr("skills.subtitle")}</p>
      </motion.div>

      {/* Overall CEFR Progress */}
      <motion.div variants={item}>
        <Card className="p-5 md:p-6 bg-card shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp size={22} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{tr("skills.overallLevel")}</p>
                <p className="text-xs text-muted-foreground">{totalXp} XP · {tr("skills.avgLevel")} {avgLevel}</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-primary font-heading">{cefrLevels[currentCefr]}</span>
          </div>
          <div className="flex gap-1.5">
            {cefrLevels.map((lvl, i) => (
              <div key={lvl} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`w-full h-2 rounded-full ${i <= currentCefr ? "bg-primary" : "bg-muted"} transition-all`} />
                <span className={`text-[10px] font-medium ${i === currentCefr ? "text-primary" : "text-muted-foreground"}`}>{lvl}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Skill Cards */}
      <motion.div variants={item} className="space-y-4">
        <h2 className="section-heading">{tr("skills.yourSkills")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((sk) => {
            const pct = Math.round((sk.xp / sk.nextXp) * 100);
            const isEasiest = sk.key === easiest.key;
            const isLevelingUp = levelUpKey === sk.key;
            return (
              <motion.div key={sk.key} variants={item} className="relative">
                <AnimatePresence>
                  {isLevelingUp && <LevelUpParticles color={sk.color} />}
                </AnimatePresence>
                <motion.div
                  animate={isLevelingUp ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 0 0 hsl(var(--primary) / 0)",
                      "0 0 20px 6px hsl(var(--primary) / 0.3)",
                      "0 0 0 0 hsl(var(--primary) / 0)",
                    ],
                  } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <Card className={`p-5 bg-card shadow-sm rounded-xl transition-all ${isEasiest ? "ring-2 ring-primary/20" : ""}`}>
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-xl ${sk.color}/10 flex items-center justify-center shrink-0`}>
                        <sk.icon size={20} className={sk.color.replace("bg-", "text-")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-sm text-foreground font-heading">{tr(`skills.${sk.key}` as any)}</h3>
                          <div className="flex items-center gap-1">
                            <motion.div
                              key={sk.level}
                              initial={{ scale: 1.6, rotate: -10 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Star size={12} className="text-warning fill-warning" />
                            </motion.div>
                            <motion.span
                              key={`lvl-${sk.level}`}
                              className="text-xs font-semibold text-foreground"
                              initial={{ scale: 1.4, color: "hsl(var(--primary))" }}
                              animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                              transition={{ duration: 0.5 }}
                            >
                              {tr("skills.lvl")} {sk.level}
                            </motion.span>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-1.5">
                          <motion.div
                            className={`h-full rounded-full ${sk.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">{sk.xp} / {sk.nextXp} XP</span>
                          <div className="flex items-center gap-2">
                            {isEasiest && (
                              <span className="text-[10px] font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                                {tr("skills.easiestGoal")}
                              </span>
                            )}
                            <button
                              onClick={() => handleLevelUp(sk.key)}
                              className="text-[10px] font-semibold text-primary-foreground bg-primary px-2.5 py-1 rounded-full flex items-center gap-1 hover:opacity-90 transition-opacity"
                            >
                              <Zap size={10} />
                              Level Up
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Motivational tip */}
      <motion.div variants={item}>
        <Card className="p-5 md:p-6 bg-primary/5 border-primary/10 shadow-sm rounded-xl">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">{tr("skills.tipTitle")}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{tr("skills.tipDesc")}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SkillMapPage;
