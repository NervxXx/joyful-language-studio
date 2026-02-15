import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Paperclip, Send, Heart, Smile, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEnergy } from "@/contexts/EnergyContext";
import { Card } from "@/components/ui/card";

type CoachType = "friendly" | "strict" | "calm";

interface Message {
  id: number;
  sender: "ai" | "user";
  text: string;
  correction?: { wrong: string; right: string; reason: string };
}

const coachEmoji: Record<CoachType, string> = { friendly: "😄", strict: "🎯", calm: "🧘" };

const demoMessages: Message[] = [
  { id: 1, sender: "ai", text: "Hi! I'm your coach today. What would you like to cook? 🍳" },
  { id: 2, sender: "user", text: "I want to learn how to make pasta." },
  { id: 3, sender: "ai", text: "Great choice! Let's start with a classic carbonara. Do you know what ingredients we need?" },
  { id: 4, sender: "user", text: "Spaghetti, eggs, cheese, and bacon?" },
  {
    id: 5, sender: "ai",
    text: "Almost perfect! Your thinking is spot on — those are the core ingredients. 👏 One small thing: in an authentic carbonara, we use guanciale instead of bacon, and Pecorino Romano cheese. But honestly, you clearly understand the dish — let's keep going! First, boil a large pot of salted water. 🧂",
    correction: { wrong: "bacon", right: "guanciale", reason: "Traditional carbonara uses guanciale (cured pork cheek) for richer flavor." }
  },
];

const ChatPage = () => {
  const navigate = useNavigate();
  const { tr } = useLanguage();
  const { energy } = useEnergy();
  const [messages] = useState<Message[]>(demoMessages);
  const [input, setInput] = useState("");
  const [coach, setCoach] = useState<CoachType>("friendly");
  const [showCoachPicker, setShowCoachPicker] = useState(false);

  const coaches: { type: CoachType; icon: typeof Heart; label: string }[] = [
    { type: "friendly", icon: Smile, label: tr("chat.coachFriendly") },
    { type: "strict", icon: Shield, label: tr("chat.coachStrict") },
    { type: "calm", icon: Heart, label: tr("chat.coachCalm") },
  ];

  // Adaptive recommendation based on energy
  const getAdaptiveHint = () => {
    return tr(`mood.recommendation.${energy}` as any);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 md:px-6 py-3.5 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft size={20} strokeWidth={1.6} className="text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCoachPicker(!showCoachPicker)} className="text-xl">{coachEmoji[coach]}</button>
            <div>
              <h1 className="font-bold text-foreground font-heading text-sm">AI Coach · B1 · Chef</h1>
            </div>
          </div>
        </div>
        <button className="p-2 rounded-xl hover:bg-muted transition-colors">
          <MoreVertical size={18} strokeWidth={1.6} className="text-muted-foreground" />
        </button>
      </header>

      {/* Coach personality picker */}
      {showCoachPicker && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="px-4 md:px-6 py-3 border-b border-border bg-card">
          <p className="text-xs font-medium text-muted-foreground mb-2">{tr("chat.coachPersonality")}</p>
          <div className="flex gap-2">
            {coaches.map((c) => (
              <button
                key={c.type}
                onClick={() => { setCoach(c.type); setShowCoachPicker(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  coach === c.type ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <c.icon size={14} />
                {c.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Adaptive energy hint */}
      {energy !== "normal" && energy !== "peak" && (
        <div className="px-4 md:px-6 py-2.5 bg-warning/5 border-b border-warning/10">
          <p className="text-xs text-muted-foreground">{getAdaptiveHint()}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "ai" && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm shrink-0 mt-1">{coachEmoji[coach]}</div>
            )}
            <div className="max-w-[75%] space-y-2">
              <div className={`px-4 py-3 text-[15px] leading-relaxed ${msg.sender === "user" ? "gradient-primary text-primary-foreground rounded-2xl rounded-br-md shadow-sm" : "bg-card text-foreground rounded-2xl rounded-bl-md shadow-sm border border-border"}`}>
                {msg.text}
              </div>
              {/* Correction card (sandwich feedback) */}
              {msg.correction && (
                <Card className="p-3 bg-primary/5 border-primary/10 rounded-xl text-xs space-y-1">
                  <p className="font-medium text-foreground">
                    <span className="line-through text-destructive/70">{msg.correction.wrong}</span> → <span className="text-primary font-semibold">{msg.correction.right}</span>
                  </p>
                  <p className="text-muted-foreground leading-relaxed">{msg.correction.reason}</p>
                </Card>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-4 md:px-6 py-3.5 border-t border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5 bg-muted rounded-2xl px-4 py-2.5 max-w-3xl mx-auto">
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <Paperclip size={18} strokeWidth={1.6} />
          </button>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={tr("chat.typeMessage")} className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base md:text-[15px]" />
          <button className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0 shadow-sm">
            <Send size={15} strokeWidth={2} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
