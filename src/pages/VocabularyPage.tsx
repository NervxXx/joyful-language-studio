import { useNavigate } from "react-router-dom";
import { Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.3 } } };

const words = [
  { en: "appetizer", ru: "закуска" },
  { en: "main course", ru: "основное блюдо" },
  { en: "dessert", ru: "десерт" },
  { en: "bill", ru: "счёт" },
  { en: "waiter", ru: "официант" },
  { en: "menu", ru: "меню" },
  { en: "tip", ru: "чаевые" },
  { en: "reservation", ru: "бронирование" },
];

const VocabularyPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8" initial="hidden" animate="show" variants={container}>
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Vocabulary</h1>
        <p className="text-muted-foreground mt-1">At the Restaurant · 8 words</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {words.map((word) => (
          <motion.div key={word.en} variants={item}>
          <Card
            key={word.en}
            className="card-hover relative p-5 bg-card border-border flex flex-col items-center text-center gap-2"
          >
            <button className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition-colors">
              <Volume2 size={14} strokeWidth={1.5} />
            </button>
            <span className="text-base font-semibold text-foreground">{word.en}</span>
            <span className="text-xs text-muted-foreground">{word.ru}</span>
          </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item}>
        <button onClick={() => navigate("/vocabulary-chat")} className="btn-gradient text-sm">
          Practice with AI →
        </button>
      </motion.div>
    </motion.div>
  );
};

export default VocabularyPage;
