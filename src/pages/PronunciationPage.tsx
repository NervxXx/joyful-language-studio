import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Mic, Play, RotateCcw, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

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

  const handleRecord = () => {
    setRecording(true);
    setTimeout(() => {
      setRecording(false);
      setAttempts((prev) => ({ ...prev, [selected.id]: (prev[selected.id] || 0) + 1 }));
    }, 2500);
  };

  return (
    <motion.div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Pronunciation</h1>
        <p className="text-muted-foreground mt-1">Listen, repeat, and perfect your accent</p>
      </motion.div>

      {/* Phrase list */}
      <motion.div variants={item} className="space-y-2">
        {phrases.map((p) => (
          <Card
            key={p.id}
            onClick={() => setSelected(p)}
            className={`card-hover cursor-pointer p-4 flex items-center gap-4 transition-all ${
              selected.id === p.id ? "border-primary bg-primary/5" : "border-border bg-card"
            }`}
          >
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              selected.id === p.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            }`}>{p.difficulty}</span>
            <p className={`text-sm flex-1 ${selected.id === p.id ? "text-foreground font-medium" : "text-foreground"}`}>{p.text}</p>
            {attempts[p.id] && (
              <div className="flex items-center gap-1 text-success">
                <CheckCircle2 size={14} />
                <span className="text-xs">{attempts[p.id]}×</span>
              </div>
            )}
          </Card>
        ))}
      </motion.div>

      {/* Practice area */}
      <motion.div variants={item}>
        <Card className="p-6 bg-card border-border space-y-5">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-foreground">{selected.text}</p>
            <p className="text-sm text-muted-foreground font-mono">{selected.phonetic}</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Play size={18} />
            </button>

            <button
              onClick={handleRecord}
              disabled={recording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                recording
                  ? "bg-destructive animate-pulse"
                  : "bg-primary hover:opacity-90"
              } text-primary-foreground`}
            >
              <Mic size={24} />
            </button>

            <button
              onClick={() => setAttempts((prev) => ({ ...prev, [selected.id]: 0 }))}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {recording && (
            <p className="text-center text-sm text-destructive animate-pulse">Listening...</p>
          )}

          {!recording && attempts[selected.id] && (
            <p className="text-center text-sm text-muted-foreground">
              {attempts[selected.id]} attempt{attempts[selected.id] > 1 ? "s" : ""} recorded
            </p>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PronunciationPage;
