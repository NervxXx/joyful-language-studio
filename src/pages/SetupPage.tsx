import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-4 pb-8 space-y-8">
        {/* Header */}
        <header className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft size={22} strokeWidth={1.5} className="text-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">New conversation</h1>
        </header>

        {/* Level Selection */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Select your level</h2>
          <div className="flex flex-wrap gap-2">
            {levels.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  level === l ? "chip-active" : "chip-inactive"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </section>

        {/* Role Selection */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Choose context (role)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {roles.map((r) => (
              <Card
                key={r.label}
                onClick={() => setRole(r.label)}
                className={`card-hover cursor-pointer flex flex-col items-center gap-2 p-5 border-2 shadow-sm transition-all ${
                  role === r.label
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-card"
                }`}
              >
                <span className="text-4xl">{r.emoji}</span>
                <span
                  className={`text-sm font-medium ${
                    role === r.label ? "text-primary" : "text-foreground"
                  }`}
                >
                  {r.label}
                </span>
              </Card>
            ))}
          </div>
        </section>

        {/* Situation Input */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Situation (optional)</h2>
          <Input
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="e.g. Ordering food in a restaurant"
            className="rounded-full h-12 px-5 bg-card border-border"
          />
        </section>

        {/* Start Button */}
        <button
          onClick={() => navigate("/chat")}
          className="btn-gradient text-center text-lg"
        >
          Start Speaking 🤖
        </button>
      </div>
    </div>
  );
};

export default SetupPage;
