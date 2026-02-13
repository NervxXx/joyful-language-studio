import { useNavigate } from "react-router-dom";
import { ArrowRight, Flame, Clock, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

const stats = [
  { icon: Flame, label: "Streak", value: "12 days", color: "text-warning" },
  { icon: Clock, label: "Today", value: "13 min", color: "text-primary" },
  { icon: Target, label: "Words", value: "86", color: "text-accent" },
  { icon: TrendingUp, label: "Level", value: "A2", color: "text-success" },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <motion.div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8" variants={container} initial="hidden" animate="show">
      {/* Greeting */}
      <motion.div variants={item}>
        <h1 className="text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
          Привет, Алекс 👋
        </h1>
        <p className="text-muted-foreground mt-1">Готов продолжить обучение?</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <stat.icon size={18} strokeWidth={1.5} className={stat.color} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-semibold text-foreground">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Daily Progress */}
      <motion.div variants={item}>
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Daily goal</span>
          <span className="text-xs text-muted-foreground">13 / 20 min</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: "65%" }}
          />
        </div>
      </Card>
      </motion.div>

      {/* Continue Card */}
      <motion.div variants={item}>
      <Card
        onClick={() => navigate("/chat")}
        className="card-hover cursor-pointer p-5 bg-card border-border flex items-center gap-4"
      >
        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-lg">💬</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground">Continue conversation</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Chef role · A2 level · 4 min left</p>
        </div>
        <ArrowRight size={18} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
      </Card>
      </motion.div>

      {/* Mode Cards */}
      <motion.div variants={item}>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Modes</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {[
            { emoji: "🗣️", title: "Free Conversation", desc: "Choose level + role. Practice real dialogues.", to: "/setup" },
            { emoji: "📚", title: "Vocabulary Mode", desc: "Learn 10 words → Speak with AI using them.", to: "/vocabulary" },
            { emoji: "🎧", title: "Listening Lab", desc: "Video + interactive subtitles.", to: "/listening" },
          ].map((mode) => (
            <Card
              key={mode.title}
              onClick={() => navigate(mode.to)}
              className="card-hover cursor-pointer p-5 bg-card border-border group"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{mode.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">{mode.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{mode.desc}</p>
                </div>
                <ArrowRight size={16} strokeWidth={1.5} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
