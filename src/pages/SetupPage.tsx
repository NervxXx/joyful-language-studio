import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

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
    <motion.div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-8" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">New conversation</h1>
        <p className="text-muted-foreground mt-1">Set up your practice session</p>
      </motion.div>

      {/* Level */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Level</h2>
        <div className="flex flex-wrap gap-2">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Context</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.map((r) => (
            <Card
              key={r.label}
              onClick={() => setRole(r.label)}
              className={`card-hover cursor-pointer flex items-center gap-3 p-4 transition-all ${
                role === r.label
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className={`text-sm font-medium ${role === r.label ? "text-primary" : "text-foreground"}`}>
                {r.label}
              </span>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* Situation */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Situation (optional)</h2>
        <Input
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="e.g. Ordering food in a restaurant"
          className="h-11 bg-card border-border"
        />
      </motion.section>

      {/* Start */}
      <motion.div variants={item}>
        <button onClick={() => navigate("/chat")} className="btn-gradient text-sm">
          Start Speaking →
        </button>
      </motion.div>
    </motion.div>
  );
};

export default SetupPage;
