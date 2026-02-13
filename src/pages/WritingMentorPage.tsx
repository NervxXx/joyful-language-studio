import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Lightbulb, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

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

  const handleSubmit = () => {
    if (text.trim().length > 10) setSubmitted(true);
  };

  const handleReset = () => {
    setText("");
    setSubmitted(false);
  };

  return (
    <motion.div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Writing Mentor</h1>
        <p className="text-muted-foreground mt-1">Practice writing with AI-powered feedback</p>
      </motion.div>

      {/* Prompt selection */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {prompts.map((p) => (
          <Card
            key={p.id}
            onClick={() => { setSelected(p); handleReset(); }}
            className={`card-hover cursor-pointer p-4 transition-all ${
              selected.id === p.id ? "border-primary bg-primary/5" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                selected.id === p.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}>{p.level}</span>
            </div>
            <p className={`text-sm font-medium ${selected.id === p.id ? "text-primary" : "text-foreground"}`}>{p.title}</p>
          </Card>
        ))}
      </motion.div>

      {/* Writing area */}
      <motion.div variants={item}>
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
            <Lightbulb size={16} className="text-warning mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{selected.title}</span> — {selected.hint}</p>
          </div>

          <Textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setSubmitted(false); }}
            placeholder="Start writing here..."
            className="min-h-[180px] bg-background border-border resize-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{text.split(/\s+/).filter(Boolean).length} words</span>
            <button onClick={handleSubmit} disabled={text.trim().length < 10} className="btn-gradient text-sm flex items-center gap-2 disabled:opacity-40">
              <Send size={14} /> Get Feedback
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Feedback */}
      {submitted && (
        <motion.div variants={item} initial="hidden" animate="show">
          <Card className="p-5 bg-card border-border space-y-3">
            <h3 className="font-semibold text-foreground text-sm">AI Feedback</h3>
            {sampleFeedback.map((fb, i) => (
              <div key={i} className="flex items-start gap-2">
                {fb.type === "success" ? (
                  <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />
                ) : (
                  <Lightbulb size={16} className="text-warning mt-0.5 shrink-0" />
                )}
                <p className="text-sm text-muted-foreground">{fb.text}</p>
              </div>
            ))}
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WritingMentorPage;
