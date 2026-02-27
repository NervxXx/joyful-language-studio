import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { COACH_ICONS, type CoachType } from "@/lib/coachTypes";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getAvatarGradient } from "@/lib/utils";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const levels = ["A1", "A2", "B1", "B2", "C1"] as const;

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

type ScenarioKey =
  | "setup.scenarioRestaurant"
  | "setup.scenarioHotel"
  | "setup.scenarioAirport"
  | "setup.scenarioJobInterview"
  | "setup.scenarioShopping"
  | "setup.scenarioDirections"
  | "setup.scenarioDoctor"
  | "setup.scenarioParty"
  | "setup.scenarioComplaint"
  | "setup.scenarioReservation"
  | "setup.scenarioPharmacy"
  | "setup.scenarioBank";

const presetContexts: { key: ScenarioKey }[] = [
  { key: "setup.scenarioRestaurant" },
  { key: "setup.scenarioHotel" },
  { key: "setup.scenarioAirport" },
  { key: "setup.scenarioJobInterview" },
  { key: "setup.scenarioShopping" },
  { key: "setup.scenarioDirections" },
  { key: "setup.scenarioDoctor" },
  { key: "setup.scenarioParty" },
  { key: "setup.scenarioComplaint" },
  { key: "setup.scenarioReservation" },
  { key: "setup.scenarioPharmacy" },
  { key: "setup.scenarioBank" },
];

const avatarEmojis = [
  "💬", "📚", "✈️", "🍽️", "🎯", "🏨", "📞", "🎉",
  "🛒", "🏥", "💊", "🏦", "🎓", "🌍", "🎬", "🎵",
  "🚀", "💡", "🎨", "🧩", "☕", "🏖️", "🔬", "💼",
];

const SetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { tr } = useLanguage();
  const { user } = useAuth();
  const [chatName, setChatName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [coachType, setCoachType] = useState<CoachType>("friendly");
  const [customCoach, setCustomCoach] = useState("");
  const [level, setLevel] = useState("B1");
  const [explainLang, setExplainLang] = useState<"ru" | "en">("ru");
  const [contextMode, setContextMode] = useState<"none" | "custom">("none");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const preset = (location.state as { presetScenario?: ScenarioKey } | null)?.presetScenario;
    if (preset && presetContexts.some((p) => p.key === preset)) {
      setContextMode("custom");
      setContext(tr(preset));
    }
  }, [location.state, tr]);

  const handleCreate = async () => {
    if (!user) {
      navigate("/");
      return;
    }
    setLoading(true);
    try {
      let title: string;
      let contextStr: string;
      if (contextMode === "none" || !context.trim()) {
        title = chatName.trim() || tr("nav.freeConversation");
        contextStr = `Level: ${level}. Free conversation, no specific context.`;
      } else {
        title = chatName.trim() || context.trim().slice(0, 50);
        contextStr = `Level: ${level}. ${context.trim()}`;
      }
      if (coachType === "custom" && customCoach.trim()) {
        contextStr = `[PERSONALITY]${customCoach.trim()}[/PERSONALITY]\n${contextStr}`;
      }

      const res = await api.createChat({
        title,
        avatar: avatar || undefined,
        coachType,
        context: contextStr,
        explainLang,
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["stats", "activity"] });

      navigate(`/chat?conv=${res.conversation_id}`);
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="p-5 md:p-8 lg:p-10 max-w-2xl mx-auto space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading tracking-tight">
          {tr("setup.title")}
        </h1>
        <p className="text-muted-foreground text-sm">{tr("setup.subtitle")}</p>
      </motion.div>

      {/* Chat name & avatar */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="section-heading">{tr("setup.chatName")}</h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setAvatar(null)}
            className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-all duration-300 ${
              avatar
                ? `bg-gradient-to-br ${getAvatarGradient(avatar)} ring-2 ring-white/20`
                : "bg-muted/60 border-2 border-dashed border-muted-foreground/30"
            }`}
          >
            {avatar || <span className="text-muted-foreground text-lg">?</span>}
          </button>
          <Input
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            placeholder={tr("setup.chatNamePlaceholder")}
            className="h-11 bg-card border-border rounded-xl text-base md:text-sm flex-1"
          />
        </div>
        <h2 className="section-heading mt-4">{tr("setup.chatAvatar")}</h2>
        <div className="grid grid-cols-8 gap-2">
          {avatarEmojis.map((emoji) => {
            const selected = avatar === emoji;
            return (
              <motion.button
                key={emoji}
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setAvatar(selected ? null : emoji)}
                className={`relative aspect-square rounded-xl text-xl flex items-center justify-center transition-all duration-200 ${
                  selected
                    ? `bg-gradient-to-br ${getAvatarGradient(emoji)} shadow-md ring-2 ring-primary/50`
                    : "bg-muted/40 hover:bg-muted/70 hover:shadow-sm"
                }`}
              >
                <span className={selected ? "drop-shadow-md" : ""}>{emoji}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* Coach personality */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="section-heading">{tr("chat.coachPersonality")}</h2>
        <div className="flex flex-wrap gap-2">
          {coachModes.map((m) => {
            const Icon = COACH_ICONS[m.key];
            return (
              <button
                key={m.key}
                onClick={() => setCoachType(m.key)}
                className={`px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all ${
                  coachType === m.key ? "chip-active" : "chip-inactive"
                }`}
              >
                <Icon size={20} strokeWidth={1.6} />
                {tr(m.labelKey)}
              </button>
            );
          })}
        </div>
        {coachType === "custom" && (
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
              className="h-11 bg-card border-border rounded-xl text-base md:text-sm mt-2"
            />
          </motion.div>
        )}
      </motion.section>

      {/* Level */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="section-heading">{tr("setup.level")}</h2>
        <div className="flex flex-wrap gap-2.5">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                level === l ? "chip-active" : "chip-inactive"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Explanation language */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="section-heading">{tr("audio.explainLang")}</h2>
        <p className="text-xs text-muted-foreground">{tr("audio.explainLangDesc")}</p>
        <div className="flex gap-3">
          <button
            onClick={() => setExplainLang("ru")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${explainLang === "ru" ? "chip-active" : "chip-inactive"}`}
          >
            Русский
          </button>
          <button
            onClick={() => setExplainLang("en")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${explainLang === "en" ? "chip-active" : "chip-inactive"}`}
          >
            English
          </button>
        </div>
      </motion.section>

      {/* Context */}
      <motion.section variants={item} className="space-y-3">
        <h2 className="section-heading">{tr("setup.context")}</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setContextMode("none"); setContext(""); }}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              contextMode === "none" ? "chip-active" : "chip-inactive"
            }`}
          >
            {tr("setup.contextNone")}
          </button>
          <button
            onClick={() => setContextMode("custom")}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              contextMode === "custom" ? "chip-active" : "chip-inactive"
            }`}
          >
            {tr("setup.contextCustom")}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {presetContexts.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => { setContextMode("custom"); setContext(tr(s.key)); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                context === tr(s.key) ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted/50 hover:bg-muted"
              }`}
            >
              {tr(s.key)}
            </button>
          ))}
        </div>
        <Input
          value={context}
          onChange={(e) => { setContext(e.target.value); if (e.target.value) setContextMode("custom"); }}
          placeholder={tr("setup.customContextPlaceholder")}
          className="h-11 bg-card border-border rounded-xl text-base md:text-sm"
        />
      </motion.section>

      <motion.div variants={item}>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="btn-gradient text-sm w-full md:w-auto min-w-[180px] disabled:opacity-50"
        >
          {loading ? "..." : tr("setup.createChat")}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default SetupPage;
