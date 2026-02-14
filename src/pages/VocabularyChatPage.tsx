import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Paperclip, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const activeWords = ["appetizer", "main course", "dessert", "bill"];

interface Message {
  id: number;
  sender: "ai" | "user";
  parts: { text: string; highlight?: boolean }[];
}

const demoMessages: Message[] = [
  { id: 1, sender: "ai", parts: [{ text: "Welcome to the restaurant! What would you like for an " }, { text: "appetizer", highlight: true }, { text: "? 🍽️" }] },
  { id: 2, sender: "user", parts: [{ text: "I'd like fried calamari, please." }] },
  { id: 3, sender: "ai", parts: [{ text: "Great choice! And for your " }, { text: "main course", highlight: true }, { text: "? We have pasta, steak, and grilled salmon today." }] },
  { id: 4, sender: "user", parts: [{ text: "I'll have the grilled salmon." }] },
  { id: 5, sender: "ai", parts: [{ text: "Excellent! Would you like to see the " }, { text: "dessert", highlight: true }, { text: " menu as well? 🍰" }] },
];

const VocabularyChatPage = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const { tr } = useLanguage();

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 md:px-6 py-3.5 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft size={20} strokeWidth={1.6} className="text-foreground" />
          </button>
          <h1 className="font-bold text-foreground font-heading text-sm">{tr("chat.vocabPractice")}</h1>
        </div>
        <button className="p-2 rounded-xl hover:bg-muted transition-colors">
          <MoreVertical size={18} strokeWidth={1.6} className="text-muted-foreground" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5 max-w-3xl mx-auto w-full">
        {demoMessages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "ai" && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm shrink-0 mt-1">🤖</div>
            )}
            <div className={`max-w-[75%] px-4 py-3 text-[15px] leading-relaxed ${msg.sender === "user" ? "gradient-primary text-primary-foreground rounded-2xl rounded-br-md shadow-sm" : "bg-card text-foreground rounded-2xl rounded-bl-md shadow-sm border border-border"}`}>
              {msg.parts.map((part, i) =>
                part.highlight ? (
                  <span key={i} className={msg.sender === "user" ? "font-bold underline" : "font-bold text-primary"}>{part.text}</span>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 md:px-6 py-2.5 border-t border-border bg-card/60 backdrop-blur-sm">
        <p className="text-xs font-semibold text-muted-foreground mb-2">{tr("chat.activeWords")}</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {activeWords.map((word) => (
            <span key={word} className="shrink-0 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-sm font-medium">{word}</span>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-6 py-3.5 border-t border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5 bg-muted rounded-2xl px-4 py-2.5 max-w-3xl mx-auto">
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <Paperclip size={18} strokeWidth={1.6} />
          </button>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={tr("chat.typeMessage")} className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base md:text-[15px]" />
          <button className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0 shadow-sm">
            <Send size={15} strokeWidth={2} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VocabularyChatPage;
