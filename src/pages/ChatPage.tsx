import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Paperclip, Send } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  id: number;
  sender: "ai" | "user";
  text: string;
}

const demoMessages: Message[] = [
  { id: 1, sender: "ai", text: "Hi! I'm your chef today. What would you like to cook? 🍳" },
  { id: 2, sender: "user", text: "I want to learn how to make pasta." },
  { id: 3, sender: "ai", text: "Great choice! Let's start with a classic carbonara. Do you know what ingredients we need?" },
  { id: 4, sender: "user", text: "Spaghetti, eggs, cheese, and bacon?" },
  { id: 5, sender: "ai", text: "Almost! We use guanciale instead of bacon, and Pecorino Romano cheese. Let me guide you through the recipe step by step. First, boil a large pot of salted water. 🧂" },
];

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages] = useState<Message[]>(demoMessages);
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
            <h1 className="font-semibold text-foreground">AI Coach · B1 · Chef</h1>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-muted transition-colors">
          <MoreVertical size={20} strokeWidth={1.5} className="text-muted-foreground" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
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
              {msg.text}
            </div>
          </motion.div>
        ))}
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

export default ChatPage;
