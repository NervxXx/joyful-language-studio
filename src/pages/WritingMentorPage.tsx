import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Lightbulb, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const prompts = [
  { id: 1, title: "Describe your morning routine", level: "A1", hint: "Use Present Simple tense" },
  { id: 2, title: "Write about your last vacation", level: "A2", hint: "Use Past Simple tense" },
  { id: 3, title: "A letter to a friend about a movie", level: "B1", hint: "Include your opinion and recommendation" },
  { id: 4, title: "Argue for or against remote work", level: "B2", hint: "Use linking words and complex sentences" },
];

const sampleFeedback = [
  { type: "success", text: "Good use of connecting words!" },
  { type: "suggestion", text: "Try using 'Furthermore' instead of 'And also' for a more formal tone." },
  { type: "suggestion", text: "Consider varying your sentence length for better flow." },
];

const WritingMentorPage = () => {
  const [selected, setSelected] = useState(prompts[0]);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { tr } = useLanguage();

  const handleSubmit = () => { if (text.trim().length > 10) setSubmitted(true); };
  const handleReset = () => { setText(""); setSubmitted(false); };

  return (
    <motion.div className="p-5 md:p-8 lg:p-12 max-w-4xl mx-auto space-y-10" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading tracking-tight">{tr("writing.title")}</h1>
        <p className="text-muted-foreground text-sm">{tr("writing.subtitle")}</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prompts.map((p) => (
          <Card key={p.id} onClick={() => { setSelected(p); handleReset(); }} className={`card-hover cursor-pointer p-4 md:p-5 rounded-xl transition-all ${selected.id === p.id ? "border-primary/30 bg-primary/5 shadow-sm" : "border-border bg-card shadow-sm"}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${selected.id === p.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{p.level}</span>
            </div>
            <p className={`text-sm font-semibold ${selected.id === p.id ? "text-primary" : "text-foreground"}`}>{p.title}</p>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Card className="p-5 md:p-7 bg-card shadow-sm rounded-xl space-y-5">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/60">
            <Lightbulb size={16} className="text-warning mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{selected.title}</span> — {selected.hint}</p>
          </div>

          <Textarea value={text} onChange={(e) => { setText(e.target.value); setSubmitted(false); }} placeholder={tr("writing.placeholder")} className="min-h-[200px] bg-background border-border rounded-xl resize-none text-base md:text-sm" />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">{text.split(/\s+/).filter(Boolean).length} {tr("writing.words")}</span>
            <button onClick={handleSubmit} disabled={text.trim().length < 10} className="btn-gradient text-sm flex items-center gap-2 disabled:opacity-40">
              <Send size={14} /> {tr("writing.getFeedback")}
            </button>
          </div>
        </Card>
      </motion.div>

      {submitted && (
        <motion.div variants={item} initial="hidden" animate="show">
          <Card className="p-5 md:p-7 bg-card shadow-sm rounded-xl space-y-4">
            <h3 className="font-bold text-foreground font-heading text-sm">{tr("writing.aiFeedback")}</h3>
            {sampleFeedback.map((fb, i) => (
              <div key={i} className="flex items-start gap-2.5">
                {fb.type === "success" ? <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" /> : <Lightbulb size={16} className="text-warning mt-0.5 shrink-0" />}
                <p className="text-sm text-muted-foreground leading-relaxed">{fb.text}</p>
              </div>
            ))}
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WritingMentorPage;
