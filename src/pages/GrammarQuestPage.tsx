import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, ArrowRight, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const questions = [
  {
    sentence: "She ___ to school every day.",
    options: ["go", "goes", "going", "gone"],
    correct: 1,
    explanation: "Third person singular uses 'goes' in Present Simple.",
  },
  {
    sentence: "I ___ already ___ the movie.",
    options: ["have / seen", "has / saw", "had / see", "have / seeing"],
    correct: 0,
    explanation: "Present Perfect: have + past participle (seen).",
  },
  {
    sentence: "If I ___ rich, I would travel the world.",
    options: ["am", "was", "were", "be"],
    correct: 2,
    explanation: "Second conditional uses 'were' for all subjects.",
  },
];

const GrammarQuestPage = () => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[current];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  return (
    <motion.div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-8" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Grammar Quest</h1>
        <p className="text-muted-foreground mt-1">Test your grammar knowledge</p>
      </motion.div>

      {!finished ? (
        <>
          {/* Progress */}
          <motion.div variants={item} className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="text-xs text-muted-foreground font-mono">{current + 1}/{questions.length}</span>
          </motion.div>

          {/* Question */}
          <motion.div variants={item}>
            <Card className="p-6 bg-card border-border space-y-6">
              <p className="text-lg text-foreground font-medium">{q.sentence}</p>

              <div className="grid grid-cols-2 gap-3">
                {q.options.map((opt, i) => {
                  let style = "border-border bg-background hover:bg-muted/50 text-foreground";
                  if (selected !== null) {
                    if (i === q.correct) style = "border-success bg-success/10 text-success";
                    else if (i === selected) style = "border-destructive bg-destructive/10 text-destructive";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all text-left ${style}`}
                    >
                      <div className="flex items-center gap-2">
                        {selected !== null && i === q.correct && <CheckCircle2 size={16} />}
                        {selected !== null && i === selected && i !== q.correct && <XCircle size={16} />}
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <div className="pt-2 space-y-3">
                  <p className="text-sm text-muted-foreground">{q.explanation}</p>
                  <button onClick={handleNext} className="btn-gradient text-sm flex items-center gap-2">
                    {current < questions.length - 1 ? "Next" : "Finish"} <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </Card>
          </motion.div>
        </>
      ) : (
        <motion.div variants={item}>
          <Card className="p-8 bg-card border-border text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Trophy size={28} className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Quest Complete!</h2>
            <p className="text-muted-foreground">You scored <span className="text-primary font-semibold">{score}/{questions.length}</span></p>
            <button onClick={() => { setCurrent(0); setSelected(null); setScore(0); setFinished(false); }} className="btn-gradient text-sm">
              Try Again
            </button>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GrammarQuestPage;
