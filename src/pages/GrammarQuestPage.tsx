import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, ArrowRight, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const questions = [
  { sentence: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], correct: 1, explanation: "Third person singular uses 'goes' in Present Simple." },
  { sentence: "I ___ already ___ the movie.", options: ["have / seen", "has / saw", "had / see", "have / seeing"], correct: 0, explanation: "Present Perfect: have + past participle (seen)." },
  { sentence: "If I ___ rich, I would travel the world.", options: ["am", "was", "were", "be"], correct: 2, explanation: "Second conditional uses 'were' for all subjects." },
];

const GrammarQuestPage = () => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const { tr } = useLanguage();

  const q = questions[current];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current < questions.length - 1) { setCurrent((c) => c + 1); setSelected(null); }
    else setFinished(true);
  };

  return (
    <motion.div className="p-5 md:p-8 lg:p-12 max-w-3xl mx-auto space-y-10" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading tracking-tight">{tr("grammar.title")}</h1>
        <p className="text-muted-foreground text-sm">{tr("grammar.subtitle")}</p>
      </motion.div>

      {!finished ? (
        <>
          <motion.div variants={item} className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="text-xs text-muted-foreground font-mono font-medium">{current + 1}/{questions.length}</span>
          </motion.div>

          <motion.div variants={item}>
            <Card className="p-6 md:p-8 bg-card shadow-sm rounded-xl space-y-7">
              <p className="text-lg md:text-xl text-foreground font-semibold font-heading leading-relaxed">{q.sentence}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, i) => {
                  let style = "border-border bg-background hover:bg-muted/50 text-foreground";
                  if (selected !== null) {
                    if (i === q.correct) style = "border-success/40 bg-success/8 text-success";
                    else if (i === selected) style = "border-destructive/40 bg-destructive/8 text-destructive";
                  }
                  return (
                    <button key={i} onClick={() => handleSelect(i)} className={`p-4 rounded-xl border text-sm font-medium transition-all text-left ${style}`}>
                      <div className="flex items-center gap-2.5">
                        {selected !== null && i === q.correct && <CheckCircle2 size={16} />}
                        {selected !== null && i === selected && i !== q.correct && <XCircle size={16} />}
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <div className="pt-1 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{q.explanation}</p>
                  <button onClick={handleNext} className="btn-gradient text-sm flex items-center gap-2">
                    {current < questions.length - 1 ? tr("grammar.next") : tr("grammar.finish")} <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </Card>
          </motion.div>
        </>
      ) : (
        <motion.div variants={item}>
          <Card className="p-8 md:p-10 bg-card shadow-sm rounded-xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Trophy size={28} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground font-heading">{tr("grammar.complete")}</h2>
            <p className="text-muted-foreground">{tr("grammar.score")} <span className="text-primary font-bold">{score}/{questions.length}</span></p>
            <button onClick={() => { setCurrent(0); setSelected(null); setScore(0); setFinished(false); }} className="btn-gradient text-sm">
              {tr("grammar.tryAgain")}
            </button>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GrammarQuestPage;
