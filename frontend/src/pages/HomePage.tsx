import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Flame,
  Clock,
  Target,
  TrendingUp,
  Check,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
};

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const dur = 600;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(1, elapsed / dur);
      setDisplay(Math.round(end * (1 - Math.pow(1 - pct, 3))));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{display}{suffix}</>;
}

const statColors = [
  "stat-glass--orange",
  "stat-glass--blue",
  "stat-glass--purple",
  "stat-glass--blue",
  "stat-glass--green",
];

const HomePage = () => {
  const { tr, lang } = useLanguage();
  const { user } = useAuth();
  const { data: statsData } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.getStats(),
  });
  const { data: activityData } = useQuery({
    queryKey: ["stats", "activity"],
    queryFn: () => api.getStatsActivity(),
    enabled: !!user,
  });

  const s = statsData;
  const wordsCount = s?.words_count ?? 0;
  const streakDays = s?.streak_days ?? 0;
  const todayMins = s?.today_minutes ?? 0;
  const level = s?.level ?? "A2";
  const dailyGoal = s?.daily_goal_minutes ?? 20;
  const convCount = s?.conversations_count ?? 0;

  const stats = [
    { icon: Flame, label: tr("home.streak"), value: streakDays, suffix: lang === "ru" ? " дн." : " days", color: "text-warning", isLevel: false },
    { icon: Clock, label: tr("home.today"), value: todayMins, suffix: " мин", color: "text-primary", isLevel: false },
    { icon: Target, label: tr("home.words"), value: wordsCount, suffix: "", color: "text-accent", isLevel: false },
    { icon: MessageSquare, label: tr("home.conversations"), value: convCount, suffix: "", color: "text-primary", isLevel: false },
    { icon: TrendingUp, label: tr("home.level"), value: level, suffix: "", color: "text-success", isLevel: true },
  ];

  const progressPct = dailyGoal > 0 ? Math.min(100, (todayMins / dailyGoal) * 100) : 0;
  const goalReached = progressPct >= 100;

  const chartData = (activityData?.activity ?? []).map((a) => ({
    ...a,
    day: format(parseISO(a.date), "EEE", { locale: lang === "ru" ? ru : undefined }),
    fullDate: format(parseISO(a.date), "d MMM", { locale: lang === "ru" ? ru : undefined }),
  }));
  const weekTotal = chartData.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <motion.div className="p-5 md:p-8 lg:p-12 max-w-4xl mx-auto space-y-8" variants={container} initial="hidden" animate="show">
      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className={`stat-glass ${statColors[idx]} h-full`}>
              <div className="flex items-center gap-3">
                <motion.div
                  className="icon-bubble"
                  animate={stat.label === tr("home.streak") && streakDays > 0 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <stat.icon size={18} strokeWidth={1.6} className={stat.color} />
                </motion.div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-sm font-bold text-foreground">
                    {stat.isLevel ? level : <AnimatedNumber value={stat.value as number} suffix={stat.suffix} />}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Daily goal */}
      <motion.div variants={item}>
        <div className="glass-card p-5 md:p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-foreground">{tr("home.dailyGoal")}</span>
            {goalReached ? (
              <span className="text-xs font-medium text-success flex items-center gap-1.5 bg-success/10 px-3 py-1 rounded-full">
                <Check size={14} strokeWidth={2.5} />
                {tr("home.goalReached")}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground font-medium">{todayMins} / {dailyGoal} мин</span>
            )}
          </div>
          <div className="w-full h-3 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors ${goalReached ? "bg-success" : "gradient-primary"} ${!goalReached ? "progress-glow" : ""}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        </div>
      </motion.div>

      {/* Weekly activity chart */}
      {user && (
        <motion.div variants={item}>
          <div className="glass-card p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="icon-bubble !w-8 !h-8 !rounded-xl">
                  <BarChart3 size={16} strokeWidth={1.6} className="text-muted-foreground" />
                </div>
                {tr("home.weeklyActivity")}
              </h2>
              <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-full">
                {tr("home.totalMinutes")}: {weekTotal} мин
              </span>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--glass-bg)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "1rem",
                      fontSize: "12px",
                      boxShadow: "0 8px 32px var(--glass-shadow)",
                    }}
                    content={({ active, payload }) =>
                      active && payload?.[0] ? (
                        <div className="px-3 py-2 text-sm">
                          <p className="font-medium text-foreground">{(payload[0].payload as { fullDate: string }).fullDate}</p>
                          <p className="text-muted-foreground">{(payload[0].value as number)} мин</p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar
                    dataKey="minutes"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(272, 55%, 58%)" />
                      <stop offset="100%" stopColor="hsl(290, 50%, 62%)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

    </motion.div>
  );
};

export default HomePage;
