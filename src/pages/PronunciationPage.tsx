import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Mic, Play, RotateCcw, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const phrases = [
  { id: 1, text: "How much does this cost?", phonetic: "/haʊ mʌtʃ dʌz ðɪs kɒst/", difficulty: "A1" },
  { id: 2, text: "I'd like to make a reservation.", phonetic: "/aɪd laɪk tə meɪk ə ˌrezəˈveɪʃən/", difficulty: "A2" },
  { id: 3, text: "Could you repeat that, please?", phonetic: "/kʊd juː rɪˈpiːt ðæt pliːz/", difficulty: "A1" },
  { id: 4, text: "The weather has been unpredictable.", phonetic: "/ðə ˈweðər hæz biːn ˌʌnprɪˈdɪktəbl/", difficulty: "B1" },
  { id: 5, text: "She's been working here for five years.", phonetic: "/ʃiːz biːn ˈwɜːrkɪŋ hɪər fɔːr faɪv jɪərz/", difficulty: "B1" },
];

const PronunciationPage = () => {
  const [selected, setSelected] = useState(phrases[0]);
  const [recording, setRecording] = useState(false);
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const { tr } = useLanguage();

  const handleRecord = () => {
    setRecording(true);
    setTimeout(() => {
      setRecording(false);
      setAttempts((prev) => ({ ...prev, [selected.id]: (prev[selected.id] || 0) + 1 }));
    }, 2500);
  };

  return (
    <motion.div className="p-5 md:p-8 lg:p-12 max-w-4xl mx-auto space-y-10" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading tracking-tight">{tr("pronunciation.title")}</h1>
        <p className="text-muted-foreground text-sm">{tr("pronunciation.subtitle")}</p>
      </motion.div>

      <motion.div variants={item} className="space-y-2.5">
        {phrases.map((p) => (
          <Card key={p.id} onClick={() => setSelected(p)} className={`card-hover cursor-pointer p-4 md:p-5 rounded-xl flex items-center gap-4 transition-all ${selected.id === p.id ? "border-primary/30 bg-primary/5 shadow-sm" : "border-border bg-card shadow-sm"}`}>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${selected.id === p.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{p.difficulty}</span>
            <p className={`text-sm flex-1 ${selected.id === p.id ? "text-foreground font-medium" : "text-foreground"}`}>{p.text}</p>
            {attempts[p.id] && (
              <div className="flex items-center gap-1 text-success">
                <CheckCircle2 size={14} />
                <span className="text-xs font-medium">{attempts[p.id]}×</span>
              </div>
            )}
          </Card>
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Card className="p-6 md:p-8 bg-card shadow-sm rounded-xl space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg md:text-xl font-bold text-foreground font-heading">{selected.text}</p>
            <p className="text-sm text-muted-foreground font-mono">{selected.phonetic}</p>
          </div>

          <div className="flex items-center justify-center gap-5">
            <button className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Play size={18} />
            </button>
            <button onClick={handleRecord} disabled={recording} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${recording ? "bg-destructive animate-pulse" : "bg-primary hover:opacity-90"} text-primary-foreground`}>
              <Mic size={24} />
            </button>
            <button onClick={() => setAttempts((prev) => ({ ...prev, [selected.id]: 0 }))} className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw size={18} />
            </button>
          </div>

          {recording && <p className="text-center text-sm text-destructive font-medium animate-pulse">{tr("pronunciation.listening")}</p>}
          {!recording && attempts[selected.id] && (
            <p className="text-center text-sm text-muted-foreground">{attempts[selected.id]} {tr("pronunciation.attempts")}</p>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PronunciationPage;
