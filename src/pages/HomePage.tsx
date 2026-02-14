import { useNavigate } from "react-router-dom";
import { ArrowRight, Flame, Clock, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion, type Variants } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
};

const HomePage = () => {
  const navigate = useNavigate();
  const { tr } = useLanguage();

  const stats = [
    { icon: Flame, label: tr("home.streak"), value: tr("home.streakValue"), color: "text-warning" },
    { icon: Clock, label: tr("home.today"), value: tr("home.todayValue"), color: "text-primary" },
    { icon: Target, label: tr("home.words"), value: "86", color: "text-accent" },
    { icon: TrendingUp, label: tr("home.level"), value: "A2", color: "text-success" },
  ];

  const modes = [
    { emoji: "🗣️", title: tr("home.freeConvTitle"), desc: tr("home.freeConvDesc"), to: "/setup" },
    { emoji: "📚", title: tr("home.vocabTitle"), desc: tr("home.vocabDesc"), to: "/vocabulary" },
    { emoji: "🎧", title: tr("home.listenTitle"), desc: tr("home.listenDesc"), to: "/listening" },
  ];

  return (
    <motion.div className="p-5 md:p-8 lg:p-12 max-w-4xl mx-auto space-y-10" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading tracking-tight">{tr("home.greeting")}</h1>
        <p className="text-muted-foreground text-sm md:text-base">{tr("home.subtitle")}</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 md:p-5 bg-card shadow-sm rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <stat.icon size={18} strokeWidth={1.6} className={stat.color} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Card className="p-5 md:p-6 bg-card shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-foreground">{tr("home.dailyGoal")}</span>
            <span className="text-xs text-muted-foreground font-medium">{tr("home.dailyGoalProgress")}</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-700 ease-out" style={{ width: "65%" }} />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card onClick={() => navigate("/chat")} className="card-hover cursor-pointer p-5 md:p-6 bg-card shadow-sm rounded-xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
            <span className="text-xl">💬</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-foreground font-heading">{tr("home.continueConversation")}</h2>
            <p className="text-sm text-muted-foreground mt-1">{tr("home.continueDesc")}</p>
          </div>
          <ArrowRight size={18} strokeWidth={1.6} className="text-muted-foreground shrink-0" />
        </Card>
      </motion.div>

      <motion.div variants={item} className="space-y-4">
        <h2 className="section-heading">{tr("home.modes")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modes.map((mode) => (
            <Card key={mode.title} onClick={() => navigate(mode.to)} className="card-hover cursor-pointer p-5 md:p-6 bg-card shadow-sm rounded-xl group">
              <div className="flex items-start gap-3.5">
                <span className="text-2xl mt-0.5">{mode.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-sm font-heading">{mode.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{mode.desc}</p>
                </div>
                <ArrowRight size={16} strokeWidth={1.6} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
