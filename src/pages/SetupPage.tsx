import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const levels = ["A1", "A2", "B1", "B2", "C1"];

const roles = [
  { emoji: "👨‍🍳", label: "Chef" },
  { emoji: "🧳", label: "Tourist" },
  { emoji: "🛒", label: "Shop Assistant" },
  { emoji: "💼", label: "Office Worker" },
  { emoji: "👨‍🎓", label: "Student" },
  { emoji: "🏋️‍♀️", label: "Fitness Coach" },
];

const SetupPage = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState("B1");
  const [role, setRole] = useState("Chef");
  const [situation, setSituation] = useState("");

  return (
    <motion.div className="p-5 md:p-8 lg:p-12 max-w-3xl mx-auto space-y-10" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading tracking-tight">New conversation</h1>
        <p className="text-muted-foreground text-sm">Set up your practice session</p>
      </motion.div>

      {/* Level */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="section-heading">Level</h2>
        <div className="flex flex-wrap gap-2.5">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                level === l ? "chip-active" : "chip-inactive"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Role */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="section-heading">Context</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.map((r) => (
            <Card
              key={r.label}
              onClick={() => setRole(r.label)}
              className={`card-hover cursor-pointer flex items-center gap-3.5 p-4 md:p-5 rounded-xl transition-all ${
                role === r.label
                  ? "border-primary/30 bg-primary/5 shadow-sm"
                  : "border-border bg-card shadow-sm"
              }`}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className={`text-sm font-semibold ${role === r.label ? "text-primary" : "text-foreground"}`}>
                {r.label}
              </span>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* Situation */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="section-heading">Situation (optional)</h2>
        <Input
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="e.g. Ordering food in a restaurant"
          className="h-12 bg-card border-border rounded-xl text-base md:text-sm"
        />
      </motion.section>

      {/* Start */}
      <motion.div variants={item}>
        <button onClick={() => navigate("/chat")} className="btn-gradient text-sm w-full md:w-auto">
          Start Speaking →
        </button>
      </motion.div>
    </motion.div>
  );
};

export default SetupPage;
