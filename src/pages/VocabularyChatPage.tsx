import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Paperclip, Send } from "lucide-react";

const activeWords = ["appetizer", "main course", "dessert", "bill"];

interface Message {
  id: number;
  sender: "ai" | "user";
  parts: { text: string; highlight?: boolean }[];
}

const demoMessages: Message[] = [
  {
    id: 1,
    sender: "ai",
    parts: [
      { text: "Welcome to the restaurant! What would you like for an " },
      { text: "appetizer", highlight: true },
      { text: "? 🍽️" },
    ],
  },
  {
    id: 2,
    sender: "user",
    parts: [{ text: "I'd like fried calamari, please." }],
  },
  {
    id: 3,
    sender: "ai",
    parts: [
      { text: "Great choice! And for your " },
      { text: "main course", highlight: true },
      { text: "? We have pasta, steak, and grilled salmon today." },
    ],
  },
  {
    id: 4,
    sender: "user",
    parts: [{ text: "I'll have the grilled salmon." }],
  },
  {
    id: 5,
    sender: "ai",
    parts: [
      { text: "Excellent! Would you like to see the " },
      { text: "dessert", highlight: true },
      { text: " menu as well? 🍰" },
    ],
  },
];

const VocabularyChatPage = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft size={22} strokeWidth={1.5} className="text-foreground" />
          </button>
          <div>
            <h1 className="font-semibold text-foreground">Vocabulary Practice</h1>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-muted transition-colors">
          <MoreVertical size={20} strokeWidth={1.5} className="text-muted-foreground" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {demoMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "ai" && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm shrink-0 mt-1">
                🤖
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 text-[15px] leading-relaxed ${
                msg.sender === "user"
                  ? "gradient-primary text-primary-foreground rounded-[20px] rounded-br-md"
                  : "bg-muted text-foreground rounded-[20px] rounded-bl-md"
              }`}
            >
              {msg.parts.map((part, i) =>
                part.highlight ? (
                  <span key={i} className={msg.sender === "user" ? "font-bold underline" : "font-bold text-primary"}>
                    {part.text}
                  </span>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Active Words Strip */}
      <div className="px-4 py-2 border-t border-border bg-card/80">
        <p className="text-xs font-medium text-muted-foreground mb-1.5">🔤 Active words:</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {activeWords.map((word) => (
            <span
              key={word}
              className="shrink-0 px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <Paperclip size={20} strokeWidth={1.5} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-[15px]"
          />
          <button className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
            <Send size={16} strokeWidth={2} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VocabularyChatPage;
