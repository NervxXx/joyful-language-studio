import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COACH_ICONS, type CoachType } from "@/lib/coachTypes";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import { getAvatarGradient } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChatSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: number | null;
  title: string;
  avatar: string | null;
  coachType: CoachType;
  explainLang: "ru" | "en";
  context: string | null;
  onSave: (data: {
    title: string;
    avatar: string | null;
    coachType: CoachType;
    explainLang: "ru" | "en";
    context: string | null;
    customCoach: string;
  }) => void;
}

type CoachLabelKey =
  | "chat.coachFriendly"
  | "chat.coachStrict"
  | "chat.coachCalm"
  | "chat.coachHumorous"
  | "chat.coachPatient"
  | "chat.coachMotivating"
  | "chat.coachProfessional"
  | "chat.coachCasual"
  | "chat.coachNeutral"
  | "chat.coachCustom";

const coachModes: { key: CoachType; labelKey: CoachLabelKey }[] = [
  { key: "neutral", labelKey: "chat.coachNeutral" },
  { key: "friendly", labelKey: "chat.coachFriendly" },
  { key: "strict", labelKey: "chat.coachStrict" },
  { key: "calm", labelKey: "chat.coachCalm" },
  { key: "humorous", labelKey: "chat.coachHumorous" },
  { key: "patient", labelKey: "chat.coachPatient" },
  { key: "motivating", labelKey: "chat.coachMotivating" },
  { key: "professional", labelKey: "chat.coachProfessional" },
  { key: "casual", labelKey: "chat.coachCasual" },
  { key: "custom", labelKey: "chat.coachCustom" },
];

const levels = ["A1", "A2", "B1", "B2", "C1"] as const;

const avatarEmojis = [
  "💬", "📚", "✈️", "🍽️", "🎯", "🏨", "📞", "🎉",
  "🛒", "🏥", "💊", "🏦", "🎓", "🌍", "🎬", "🎵",
  "🚀", "💡", "🎨", "🧩", "☕", "🏖️", "🔬", "💼",
];

function parseContext(ctx: string | null): {
  personality: string;
  level: string;
  scenario: string;
} {
  if (!ctx) return { personality: "", level: "B1", scenario: "" };

  let text = ctx;
  let personality = "";

  const pm = text.match(/\[PERSONALITY\](.*?)\[\/PERSONALITY\]\s*/s);
  if (pm) {
    personality = pm[1].trim();
    text = text.replace(pm[0], "").trim();
  }

  let level = "B1";
  const lm = text.match(/^Level:\s*(A1|A2|B1|B2|C1)\.\s*/i);
  if (lm) {
    level = lm[1].toUpperCase();
    text = text.replace(lm[0], "").trim();
  }

  if (/^Free conversation,?\s*no specific context\.?$/i.test(text)) {
    text = "";
  }

  return { personality, level, scenario: text };
}

function buildContext(level: string, scenario: string, personality: string): string {
  let ctx = "";
  if (personality) {
    ctx += `[PERSONALITY]${personality}[/PERSONALITY]\n`;
  }
  ctx += `Level: ${level}.`;
  if (scenario.trim()) {
    ctx += ` ${scenario.trim()}`;
  } else {
    ctx += " Free conversation, no specific context.";
  }
  return ctx;
}

export function ChatSettingsSheet({
  open,
  onOpenChange,
  conversationId,
  title: propTitle,
  avatar: propAvatar,
  coachType,
  explainLang,
  context: propContext,
  onSave,
}: ChatSettingsSheetProps) {
  const { tr } = useLanguage();
  const queryClient = useQueryClient();

  const [chatTitle, setChatTitle] = useState(propTitle);
  const [chatAvatar, setChatAvatar] = useState<string | null>(propAvatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [coach, setCoach] = useState<CoachType>(coachType);
  const [customCoach, setCustomCoach] = useState("");
  const [explain, setExplain] = useState<"ru" | "en">(explainLang);
  const [level, setLevel] = useState("B1");
  const [scenario, setScenario] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setChatTitle(propTitle);
      setChatAvatar(propAvatar);
      setCoach(coachType);
      setExplain(explainLang);
      setShowAvatarPicker(false);

      const parsed = parseContext(propContext);
      setCustomCoach(parsed.personality);
      setLevel(parsed.level);
      setScenario(parsed.scenario);

      if (parsed.personality && coachType === "custom") {
        setCoach("custom");
      }
    }
  }, [open, propTitle, propAvatar, coachType, explainLang, propContext]);

  const handleSave = async () => {
    const finalTitle = chatTitle.trim() || "AI Coach";
    const finalCustomCoach = coach === "custom" ? customCoach.trim() : "";
    const finalContext = buildContext(level, scenario, finalCustomCoach);

    onSave({
      title: finalTitle,
      avatar: chatAvatar,
      coachType: coach,
      explainLang: explain,
      context: finalContext,
      customCoach: finalCustomCoach,
    });

    if (conversationId) {
      setLoading(true);
      try {
        await api.updateConversation(conversationId, {
          title: finalTitle,
          avatar: chatAvatar,
          coach_type: coach,
          explain_lang: explain,
          context: finalContext,
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
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{tr("chat.editSettings")}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Title & Avatar */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">{tr("setup.chatName")}</h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all duration-200 ${
                  chatAvatar
                    ? `bg-gradient-to-br ${getAvatarGradient(chatAvatar)} ring-2 ring-white/20`
                    : "bg-muted/60 border-2 border-dashed border-muted-foreground/30 hover:border-primary/40"
                }`}
              >
                {chatAvatar || <span className="text-muted-foreground text-sm">?</span>}
              </button>
              <Input
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                placeholder={tr("setup.chatNamePlaceholder")}
                className="h-10 bg-card border-border rounded-xl text-sm flex-1"
              />
            </div>
            {showAvatarPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-8 gap-1.5 pt-1"
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setChatAvatar(null); setShowAvatarPicker(false); }}
                  className={`aspect-square rounded-lg text-xs flex items-center justify-center transition-all ${
                    !chatAvatar ? "bg-primary/15 ring-1 ring-primary/40" : "bg-muted/40 hover:bg-muted/60"
                  }`}
                >
                  ✕
                </motion.button>
                {avatarEmojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setChatAvatar(emoji); setShowAvatarPicker(false); }}
                    className={`aspect-square rounded-lg text-base flex items-center justify-center transition-all ${
                      chatAvatar === emoji
                        ? `bg-gradient-to-br ${getAvatarGradient(emoji)} shadow-sm ring-1 ring-primary/40`
                        : "bg-muted/40 hover:bg-muted/60"
                    }`}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Coach personality */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">{tr("chat.coachPersonality")}</h3>
            <div className="flex flex-wrap gap-1.5">
              {coachModes.map((m) => {
                const Icon = COACH_ICONS[m.key];
                return (
                  <button
                    key={m.key}
                    onClick={() => setCoach(m.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      coach === m.key ? "chip-active" : "chip-inactive"
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.6} />
                    {tr(m.labelKey)}
                  </button>
                );
              })}
            </div>
            {coach === "custom" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  value={customCoach}
                  onChange={(e) => setCustomCoach(e.target.value)}
                  placeholder={tr("chat.coachCustomPlaceholder")}
                  className="h-10 bg-card border-border rounded-xl text-sm"
                />
              </motion.div>
            )}
          </div>

          {/* Level */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">{tr("setup.level")}</h3>
            <div className="flex flex-wrap gap-2">
              {levels.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    level === l ? "chip-active" : "chip-inactive"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Explanation language */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">{tr("audio.explainLang")}</h3>
            <p className="text-xs text-muted-foreground">{tr("audio.explainLangDesc")}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setExplain("ru")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${explain === "ru" ? "chip-active" : "chip-inactive"}`}
              >
                Русский
              </button>
              <button
                onClick={() => setExplain("en")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${explain === "en" ? "chip-active" : "chip-inactive"}`}
              >
                English
              </button>
            </div>
          </div>

          {/* Context / Scenario */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">{tr("setup.context")}</h3>
            <Input
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder={tr("setup.customContextPlaceholder")}
              className="h-10 bg-card border-border rounded-xl text-sm"
            />
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full rounded-xl">
            {loading ? "..." : tr("common.save")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
