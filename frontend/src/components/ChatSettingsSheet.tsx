import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { COACH_ICONS, type CoachType } from "@/lib/coachTypes";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";

interface ChatSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: number | null;
  coachType: CoachType;
  explainLang: "ru" | "en";
  onSave: (coach: CoachType, explain: "ru" | "en") => void;
}

type CoachLabelKey =
  | "chat.coachFriendly"
  | "chat.coachStrict"
  | "chat.coachCalm"
  | "chat.coachHumorous"
  | "chat.coachPatient"
  | "chat.coachMotivating"
  | "chat.coachProfessional"
  | "chat.coachCasual";

const coachModes: { key: CoachType; labelKey: CoachLabelKey }[] = [
  { key: "friendly", labelKey: "chat.coachFriendly" },
  { key: "strict", labelKey: "chat.coachStrict" },
  { key: "calm", labelKey: "chat.coachCalm" },
  { key: "humorous", labelKey: "chat.coachHumorous" },
  { key: "patient", labelKey: "chat.coachPatient" },
  { key: "motivating", labelKey: "chat.coachMotivating" },
  { key: "professional", labelKey: "chat.coachProfessional" },
  { key: "casual", labelKey: "chat.coachCasual" },
];

export function ChatSettingsSheet({
  open,
  onOpenChange,
  conversationId,
  coachType,
  explainLang,
  onSave,
}: ChatSettingsSheetProps) {
  const { tr } = useLanguage();
  const queryClient = useQueryClient();
  const [coach, setCoach] = useState<CoachType>(coachType);
  const [explain, setExplain] = useState<"ru" | "en">(explainLang);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCoach(coachType);
      setExplain(explainLang);
    }
  }, [open, coachType, explainLang]);

  const handleSave = async () => {
    onSave(coach, explain);
    if (conversationId) {
      setLoading(true);
      try {
        await api.updateConversation(conversationId, {
          coach_type: coach,
          explain_lang: explain,
        });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      } finally {
        setLoading(false);
      }
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md matte-glass !bg-background/60 shadow-2xl border-l-white/10 p-8 flex flex-col">
        <SheetHeader className="pb-6 border-b border-foreground/5">
          <SheetTitle className="text-xl font-bold tracking-tight text-foreground">{tr("chat.editSettings")}</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-10 flex-1 overflow-y-auto pr-2">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase opacity-70 mb-2">{tr("chat.coachPersonality")}</h3>
            <div className="grid grid-cols-2 gap-3">
              {coachModes.map((m) => {
                const Icon = COACH_ICONS[m.key];
                const isActive = coach === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => setCoach(m.key)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-medium transition-all border ${isActive
                        ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.15)] ring-1 ring-primary/20"
                        : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "text-primary opacity-100" : "opacity-70"} />
                    <span className="truncate">{tr(m.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase opacity-70">{tr("audio.explainLang")}</h3>
              <p className="text-[13px] text-muted-foreground/80 leading-relaxed">{tr("audio.explainLangDesc")}</p>
            </div>
            <div className="flex gap-3 bg-muted/30 p-1.5 rounded-2xl backdrop-blur-sm border border-foreground/5">
              <button
                onClick={() => setExplain("ru")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${explain === "ru"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Русский
              </button>
              <button
                onClick={() => setExplain("en")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${explain === "en"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                English
              </button>
            </div>
          </div>
          <div className="pt-6 mt-auto border-t border-foreground/5 pb-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full rounded-2xl h-12 text-base font-semibold shadow-[0_8px_20px_hsl(var(--primary)/0.25)] hover:shadow-[0_12px_25px_hsl(var(--primary)/0.35)] transition-all bg-primary hover:bg-primary/95 text-primary-foreground"
            >
              {loading ? "..." : tr("common.save")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
