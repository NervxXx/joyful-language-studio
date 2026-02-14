import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Play, Pause, SkipForward, Volume2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

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
  const { tr } = useLanguage();

  return (
    <motion.div className="p-5 md:p-8 lg:p-12 max-w-4xl mx-auto space-y-10" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading tracking-tight">{tr("listening.title")}</h1>
        <p className="text-muted-foreground text-sm">{tr("listening.subtitle")}</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {episodes.map((ep) => (
          <Card key={ep.id} onClick={() => setSelected(ep)} className={`card-hover cursor-pointer p-4 md:p-5 rounded-xl transition-all ${selected.id === ep.id ? "border-primary/30 bg-primary/5 shadow-sm" : "border-border bg-card shadow-sm"}`}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${selected.id === ep.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{ep.level}</span>
              <span className="text-xs text-muted-foreground">{ep.duration}</span>
            </div>
            <p className={`text-sm font-semibold ${selected.id === ep.id ? "text-primary" : "text-foreground"}`}>{ep.title}</p>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Card className="p-5 md:p-7 bg-card shadow-sm rounded-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-foreground font-heading">{selected.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.level} · {selected.duration}</p>
            </div>
            <button onClick={() => setShowTranslation(!showTranslation)} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              {showTranslation ? <EyeOff size={14} /> : <Eye size={14} />}
              {showTranslation ? tr("listening.hideTranslation") : tr("listening.showTranslation")}
            </button>
          </div>

          <div className="flex items-center justify-center gap-5">
            <button className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Volume2 size={18} />
            </button>
            <button onClick={() => setPlaying(!playing)} className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity shadow-md">
              {playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
            </button>
            <button className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <SkipForward size={18} />
            </button>
          </div>

          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: "25%" }} />
          </div>

          {selected.lines.length > 0 && (
            <div className="space-y-2 pt-3">
              {selected.lines.map((line, i) => (
                <div key={i} onClick={() => setActiveLine(i)} className={`p-3.5 rounded-xl cursor-pointer transition-all ${activeLine === i ? "bg-primary/6 border border-primary/15" : "hover:bg-muted/60"}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-[10px] text-muted-foreground font-mono mt-1 shrink-0">{line.time}</span>
                    <div>
                      <p className={`text-sm ${activeLine === i ? "text-foreground font-medium" : "text-foreground"}`}>{line.en}</p>
                      {showTranslation && <p className="text-xs text-muted-foreground mt-1">{line.ru}</p>}
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
