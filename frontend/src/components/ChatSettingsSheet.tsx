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
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{tr("chat.editSettings")}</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-8">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{tr("chat.coachPersonality")}</h3>
            <div className="flex flex-wrap gap-1.5">
              {coachModes.map((m) => {
                const Icon = COACH_ICONS[m.key];
                return (
                  <button
                    key={m.key}
                    onClick={() => setCoach(m.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      coach === m.key ? "chip-active" : "chip-inactive"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.6} />
                    {tr(m.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{tr("audio.explainLang")}</h3>
            <p className="text-xs text-muted-foreground">{tr("audio.explainLangDesc")}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setExplain("ru")}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${explain === "ru" ? "chip-active" : "chip-inactive"}`}
              >
                Русский
              </button>
              <button
                onClick={() => setExplain("en")}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${explain === "en" ? "chip-active" : "chip-inactive"}`}
              >
                English
              </button>
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full rounded-xl">
            {loading ? "..." : tr("common.save")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
