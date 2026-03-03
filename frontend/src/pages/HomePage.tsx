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
import { motion, type Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Tilt } from "@/components/Effects";
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

import { cn } from "@/lib/utils";

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
    <motion.div className="p-5 md:p-8 lg:p-12 max-w-6xl mx-auto" variants={container} initial="hidden" animate="show">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5 auto-rows-[minmax(120px,auto)]">

        {/* Main Stats - Bento large items */}
        {stats.slice(0, 3).map((stat, idx) => (
          <motion.div
            key={stat.label}
            variants={item}
            className={cn(
              "md:col-span-2 lg:col-span-2",
              idx === 0 && "lg:col-span-2 md:row-span-1",
              idx === 1 && "lg:col-span-2 md:row-span-1",
              idx === 2 && "lg:col-span-2 md:row-span-1"
            )}
          >
            <Tilt className="h-full">
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`stat-glass ${statColors[idx]} h-full flex flex-col justify-center`}
              >
                <div className="flex items-center gap-4">
                  <div className="icon-bubble !w-12 !h-12 !rounded-2xl">
                    <stat.icon size={22} strokeWidth={1.8} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.isLevel ? (
                        level
                      ) : (
                        <AnimatedNumber value={stat.value as number} suffix={stat.suffix} />
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Tilt>
          </motion.div>
        ))}

        {/* Weekly Activity - Bento wide item */}
        {user && (
          <motion.div variants={item} className="md:col-span-4 lg:col-span-4 md:row-span-2">
            <Tilt className="h-full">
              <div className="glass-card p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-3">
                    <div className="icon-bubble !w-9 !h-9 !rounded-xl">
                      <BarChart3 size={18} strokeWidth={1.8} className="text-primary" />
                    </div>
                    {tr("home.weeklyActivity")}
                  </h2>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none mb-1">Total</span>
                    <span className="text-sm font-bold text-foreground">{weekTotal} мин</span>
                  </div>
                </div>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}`}
                      />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--primary) / 0.05)', radius: 8 }}
                        contentStyle={{
                          backgroundColor: "var(--glass-bg)",
                          backdropFilter: "blur(16px)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "1.25rem",
                          padding: "12px",
                          boxShadow: "0 12px 40px var(--glass-shadow)",
                        }}
                        content={({ active, payload }) =>
                          active && payload?.[0] ? (
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                {(payload[0].payload as { fullDate: string }).fullDate}
                              </p>
                              <p className="text-lg font-bold text-primary">{(payload[0].value as number)} <span className="text-sm font-medium">мин</span></p>
                            </div>
                          ) : null
                        }
                      />
                      <Bar
                        dataKey="minutes"
                        fill="url(#barGradient)"
                        radius={[8, 8, 8, 8]}
                        maxBarSize={32}
                        animationDuration={1500}
                      />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="hsl(var(--accent))" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Tilt>
          </motion.div>
        )}

        {/* Small Stats - Bento grid items */}
        {stats.slice(3).map((stat, idx) => (
          <motion.div key={stat.label} variants={item} className="md:col-span-2 lg:col-span-1">
            <Tilt className="h-full">
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`stat-glass ${statColors[idx + 3]} h-full flex items-center justify-center p-4`}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <stat.icon size={20} className={stat.color} />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{stat.label}</p>
                    <p className="text-sm font-bold text-foreground leading-none mt-1">
                      {stat.isLevel ? level : <AnimatedNumber value={stat.value as number} suffix={stat.suffix} />}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Tilt>
          </motion.div>
        ))}

        {/* Daily Goal - Bento wide item */}
        <motion.div variants={item} className="md:col-span-4 lg:col-span-2 lg:row-span-1">
          <Tilt className="h-full">
            <div className="glass-card p-6 h-full flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-foreground uppercase tracking-widest">{tr("home.dailyGoal")}</span>
                {goalReached ? (
                  <span className="text-[10px] font-bold text-success flex items-center gap-1 bg-success/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    <Check size={12} strokeWidth={3} />
                    Done
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    {todayMins} / {dailyGoal}
                  </span>
                )}
              </div>
              <div className="relative w-full h-4 rounded-full bg-muted/30 overflow-hidden border border-white/5">
                <motion.div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    goalReached ? "bg-success" : "gradient-primary progress-glow"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                />
              </div>
              {!goalReached && (
                <p className="text-[10px] text-muted-foreground mt-3 font-medium text-center">
                  Осталось {Math.max(0, dailyGoal - todayMins)} мин до цели!
                </p>
              )}
            </div>
          </Tilt>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default HomePage;
