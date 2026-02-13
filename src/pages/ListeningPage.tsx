import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Play, Pause, SkipForward, Volume2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const episodes = [
  { id: 1, title: "At the Airport", level: "A2", duration: "2:30", lines: [
    { time: "0:00", en: "Excuse me, where is gate 12?", ru: "Извините, где выход 12?" },
    { time: "0:05", en: "Go straight and turn left.", ru: "Идите прямо и поверните налево." },
    { time: "0:10", en: "Thank you. Is there a café nearby?", ru: "Спасибо. Есть ли кафе поблизости?" },
    { time: "0:15", en: "Yes, right after the security check.", ru: "Да, сразу после контроля безопасности." },
  ]},
  { id: 2, title: "Job Interview", level: "B1", duration: "3:15", lines: [] },
  { id: 3, title: "Doctor's Appointment", level: "A2", duration: "2:45", lines: [] },
  { id: 4, title: "Hotel Check-in", level: "A1", duration: "1:50", lines: [] },
];

const ListeningPage = () => {
  const [selected, setSelected] = useState(episodes[0]);
  const [playing, setPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [activeLine, setActiveLine] = useState(0);

  return (
    <motion.div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Listening Lab</h1>
        <p className="text-muted-foreground mt-1">Listen, read subtitles, and improve comprehension</p>
      </motion.div>

      {/* Episode list */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {episodes.map((ep) => (
          <Card
            key={ep.id}
            onClick={() => setSelected(ep)}
            className={`card-hover cursor-pointer p-4 transition-all ${
              selected.id === ep.id ? "border-primary bg-primary/5" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                selected.id === ep.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}>{ep.level}</span>
              <span className="text-xs text-muted-foreground">{ep.duration}</span>
            </div>
            <p className={`text-sm font-medium ${selected.id === ep.id ? "text-primary" : "text-foreground"}`}>{ep.title}</p>
          </Card>
        ))}
      </motion.div>

      {/* Player */}
      <motion.div variants={item}>
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">{selected.title}</h2>
              <p className="text-xs text-muted-foreground">{selected.level} · {selected.duration}</p>
            </div>
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showTranslation ? <EyeOff size={14} /> : <Eye size={14} />}
              {showTranslation ? "Hide" : "Show"} translation
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Volume2 size={18} />
            </button>
            <button
              onClick={() => setPlaying(!playing)}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <SkipForward size={18} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: "25%" }} />
          </div>

          {/* Subtitles */}
          {selected.lines.length > 0 && (
            <div className="space-y-2 pt-2">
              {selected.lines.map((line, i) => (
                <div
                  key={i}
                  onClick={() => setActiveLine(i)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    activeLine === i ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-[10px] text-muted-foreground font-mono mt-1 shrink-0">{line.time}</span>
                    <div>
                      <p className={`text-sm ${activeLine === i ? "text-foreground font-medium" : "text-foreground"}`}>{line.en}</p>
                      {showTranslation && (
                        <p className="text-xs text-muted-foreground mt-0.5">{line.ru}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ListeningPage;
