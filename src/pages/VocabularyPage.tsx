import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";

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
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-4 pb-8 space-y-6">
        {/* Header */}
        <header className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft size={22} strokeWidth={1.5} className="text-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">Vocabulary: At the Restaurant</h1>
        </header>

        {/* Word Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {words.map((word) => (
            <Card
              key={word.en}
              className="card-hover relative p-5 shadow-card border-0 bg-card flex flex-col items-center text-center gap-2"
            >
              <button className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition-colors">
                <Volume2 size={16} strokeWidth={1.5} />
              </button>
              <span className="text-xl font-bold text-foreground">{word.en}</span>
              <span className="text-sm text-muted-foreground">{word.ru}</span>
            </Card>
          ))}
        </div>

        {/* Practice Button */}
        <button
          onClick={() => navigate("/vocabulary-chat")}
          className="btn-gradient text-center text-lg"
        >
          Practice with AI 🤖
        </button>
      </div>
    </div>
  );
};

export default VocabularyPage;
