import { useNavigate } from "react-router-dom";
import { Bell, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import ModeCard from "@/components/ModeCard";

const quickActions = [
  { emoji: "🎙️", label: "Speak" },
  { emoji: "📖", label: "Words" },
  { emoji: "🎮", label: "Games" },
  { emoji: "🏆", label: "Train" },
];

const extraModes = [
  { emoji: "🗡️", title: "🎮 Grammar Quest", description: "Learn grammar through RPG battles." },
  { emoji: "🎤", title: "🗣️ Pronunciation Coach", description: "Speak, get feedback on your accent." },
  { emoji: "✍️", title: "📝 Writing Mentor", description: "Write emails/essays. AI improves them." },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Top Bar */}
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">👋 Привет, Алекс!</h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
              <Bell size={22} strokeWidth={1.5} className="text-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full gradient-primary" />
            </button>
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">А</span>
            </div>
          </div>
        </header>

        {/* Daily Goal */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">65%</span>
            <span className="text-sm text-muted-foreground">Daily goal: 20 min</span>
          </div>
          <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full gradient-primary transition-all duration-500"
              style={{ width: "65%" }}
            />
          </div>
        </section>

        {/* Hero Continue Card */}
        <Card
          onClick={() => navigate("/chat")}
          className="card-hover cursor-pointer flex items-center gap-4 p-5 shadow-card border-0 bg-card"
        >
          <span className="text-3xl">💬</span>
          <div className="flex-1">
            <h2 className="font-bold text-foreground text-lg">Continue conversation</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Chef role · A2 level · 4 min left</p>
          </div>
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
            <ArrowRight size={18} strokeWidth={2} className="text-primary-foreground" />
          </div>
        </Card>

        {/* Quick Actions */}
        <section className="flex gap-4 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-2 min-w-[72px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-2xl card-hover">
                {action.emoji}
              </div>
              <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
            </button>
          ))}
        </section>

        {/* Modes */}
        <section className="space-y-3">
          <ModeCard
            emoji="🗣️"
            title="Free Conversation"
            description="Choose level + role. Practice real life dialogues."
            to="/setup"
          />
          <ModeCard
            emoji="📚"
            title="Vocabulary Mode"
            description="Learn 10 words → Speak with AI using them."
            to="/vocabulary"
          />
          <ModeCard
            emoji="🎧"
            title="Listening Lab"
            description="Video + interactive subtitles."
            to="/listening"
          />
        </section>

        {/* More Ways */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">More ways to learn</h2>
          {extraModes.map((mode) => (
            <Card
              key={mode.title}
              onClick={() => alert("Coming soon! 🚧")}
              className="card-hover cursor-pointer flex items-center gap-4 p-5 shadow-card border-0 bg-card"
            >
              <span className="text-2xl">{mode.emoji}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{mode.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{mode.description}</p>
              </div>
            </Card>
          ))}
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;
