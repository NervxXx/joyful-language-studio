import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEnergy, type EnergyState } from "@/contexts/EnergyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Zap, Sun, CloudSun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const moods: { state: EnergyState; emoji: string; icon: typeof Zap; color: string }[] = [
  { state: "peak", emoji: "🔥", icon: Zap, color: "text-warning" },
  { state: "normal", emoji: "😊", icon: Sun, color: "text-primary" },
  { state: "tired", emoji: "😴", icon: CloudSun, color: "text-muted-foreground" },
  { state: "exhausted", emoji: "🥱", icon: Moon, color: "text-accent" },
];

export default function MoodCheckDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setEnergy, setMoodChecked } = useEnergy();
  const { tr } = useLanguage();

  const pick = (state: EnergyState) => {
    setEnergy(state);
    setMoodChecked(true);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">{tr("mood.title")}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{tr("mood.subtitle")}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {moods.map((m, i) => (
            <motion.button
              key={m.state}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => pick(m.state)}
              className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-border bg-card hover:bg-muted/60 hover:border-primary/30 transition-all group"
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{tr(`mood.${m.state}` as any)}</span>
            </motion.button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
