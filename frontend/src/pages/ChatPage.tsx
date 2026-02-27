import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Headphones,
  Mic,
  MicOff,
  Loader2,
  Paperclip,
  Pencil,
  Send,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { HoverableMessage } from "@/components/WordHoverCard";
import { api } from "@/lib/api";
import { COACH_ICONS, type CoachType } from "@/lib/coachTypes";
import { ChatSettingsSheet } from "@/components/ChatSettingsSheet";
import { VocabularyEditSheet } from "@/components/VocabularyEditSheet";
import { useSpeechRecognition, useSpeechSynthesis } from "@/hooks/useVoiceChat";
import { getAvatarGradient } from "@/lib/utils";

interface Message {
  id: number;
  sender: "ai" | "user";
  text: string;
  correction?: { wrong: string; right: string; reason: string };
}

const ChatPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const convIdParam = searchParams.get("conv");
  const { tr, lang } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [coach, setCoach] = useState<CoachType>("friendly");
  const [explainLang, setExplainLang] = useState<"ru" | "en">("ru");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editDictOpen, setEditDictOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(
    convIdParam ? parseInt(convIdParam, 10) : null
  );
  const [title, setTitle] = useState("AI Coach");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [convContext, setConvContext] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [vocabEnabled, setVocabEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [micStatus, setMicStatus] = useState<"idle" | "listening" | "processing" | "speaking">("idle");
  const scrollRef = useRef<HTMLDivElement>(null);

  const synth = useSpeechSynthesis(useCallback(() => setMicStatus("idle"), []));

  const { data: wordsData } = useQuery({
    queryKey: ["vocabulary", "words"],
    queryFn: () => api.getVocabularyWords(undefined, true),
    enabled: !!user,
  });
  const activeWords =
    user && wordsData
      ? wordsData.filter((w) => w.is_active !== false).slice(0, 8).map((w) => w.word_en)
      : ["appetizer", "main course", "dessert", "bill"];

  const handleVoiceSend = useCallback(
    (text: string) => {
      if (!text) {
        setMicStatus("idle");
        return;
      }
      setMicStatus("processing");
      const voiceTitle = lang === "ru" ? "Аудиоразговор" : "Voice chat";
      const sendTitle = conversationId ? undefined : voiceTitle;
      const vocabList = vocabEnabled && activeWords.length > 0 ? activeWords : undefined;
      api
        .sendMessage(text, conversationId ?? undefined, coach, sendTitle, {
          voiceMode: true,
          explainLang,
          vocabWords: vocabList,
        })
        .then((res) => {
          setConversationId(res.conversation_id);
          if (!conversationId) setTitle(lang === "ru" ? "Аудиоразговор" : "Voice chat");
          setMessages((prev) => [
            ...prev,
            { id: Date.now(), sender: "user" as const, text },
            { id: res.message_id, sender: "ai" as const, text: res.agent_response },
          ]);
          setMicStatus("speaking");
          synth.speak(res.agent_response);
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          queryClient.invalidateQueries({ queryKey: ["stats"] });
          queryClient.invalidateQueries({ queryKey: ["stats", "activity"] });
        })
        .catch((e) => {
          setMicStatus("idle");
          setMessages((prev) => [...prev, { id: Date.now(), sender: "ai" as const, text: (e as Error).message }]);
        });
    },
    [conversationId, coach, explainLang, synth, lang, queryClient, vocabEnabled, activeWords]
  );

  const rec = useSpeechRecognition(handleVoiceSend);
  const showVoiceMic = rec.supported && !!user;
  const showVocabPanel = vocabEnabled && user;

  useEffect(() => {
    if (!user) {
      setLoadingHistory(false);
      setMessages([{ id: 0, sender: "ai", text: tr("chat.coachGreeting") }]);
      return;
    }
    if (conversationId) {
      Promise.all([api.getMessages(conversationId), api.getConversation(conversationId)])
        .then(([msgs, conv]) => {
          setTitle(conv.title);
          setAvatar(conv.avatar || null);
          setConvContext(conv.context || null);
          setCoach((conv.coach_type as CoachType) || "friendly");
          setExplainLang((conv.explain_lang === "en" ? "en" : "ru") as "ru" | "en");
          setMessages(
            msgs.map((m) => ({
              id: m.id,
              sender: m.is_from_user ? ("user" as const) : ("ai" as const),
              text: m.content,
              correction:
                (m as { correction_wrong?: string; correction_right?: string; correction_reason?: string })
                  .correction_wrong && (m as { correction_right?: string }).correction_right
                  ? {
                      wrong: (m as { correction_wrong: string }).correction_wrong,
                      right: (m as { correction_right: string }).correction_right,
                      reason: (m as { correction_reason?: string }).correction_reason || "",
                    }
                  : undefined,
            }))
          );
        })
        .catch(() => setMessages([{ id: 0, sender: "ai", text: tr("chat.coachGreeting") }]))
        .finally(() => setLoadingHistory(false));
    } else {
      setMessages([{ id: 0, sender: "ai", text: tr("chat.coachGreeting") }]);
      setAvatar(null);
      setLoadingHistory(false);
    }
  }, [conversationId, user, tr]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSendText = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!user) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "user", text },
        { id: Date.now() + 1, sender: "ai", text: "Войдите, чтобы общаться с AI Coach." },
      ]);
      setInput("");
      return;
    }
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now(), sender: "user", text }]);
    setLoading(true);
    try {
      let convId = conversationId;
      const vocabList = vocabEnabled && activeWords.length > 0 ? activeWords : undefined;
      if (!convId && vocabList) {
        const created = await api.createChat({
          title: tr("chat.vocabPractice"),
          coachType: coach,
          explainLang,
        });
        convId = created.conversation_id;
        setConversationId(convId);
        setTitle(tr("chat.vocabPractice"));
      }
      const res = await api.sendMessage(text, convId ?? undefined, coach, undefined, {
        voiceMode: false,
        explainLang,
        vocabWords: vocabList,
      });
      setConversationId(res.conversation_id);
      if (voiceEnabled) {
        setMicStatus("speaking");
        synth.speak(res.agent_response);
      }
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["stats", "activity"] });
      setMessages((prev) => [
        ...prev,
        {
          id: res.message_id,
          sender: "ai",
          text: res.agent_response,
          correction: res.correction ?? undefined,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [...prev, { id: Date.now(), sender: "ai", text: `Ошибка: ${(err as Error).message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMicClick = () => {
    if (!user || !showVoiceMic) return;
    if (micStatus === "speaking") {
      synth.stop();
      setMicStatus("idle");
      return;
    }
    if (micStatus === "processing") return;
    if (micStatus === "idle") {
      rec.start();
      setMicStatus("listening");
      return;
    }
    if (micStatus === "listening") {
      rec.stop();
    }
  };

  const getHeaderIcon = () => {
    if (voiceEnabled) return Headphones;
    if (vocabEnabled) return BookOpen;
    return COACH_ICONS[coach];
  };
  const HeaderIcon = getHeaderIcon();

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] min-h-0 bg-background">
      <header className="flex items-center justify-between px-4 md:px-6 py-3.5 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors shrink-0">
            <ArrowLeft size={20} strokeWidth={1.6} className="text-foreground" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 shadow-sm ${
                avatar
                  ? `bg-gradient-to-br ${getAvatarGradient(avatar)} text-xl`
                  : "bg-muted/60"
              }`}
            >
              {avatar || <HeaderIcon size={18} strokeWidth={1.6} className="text-muted-foreground" />}
            </span>
            <h1 className="font-bold text-foreground font-heading text-sm truncate">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            title={tr("chat.editSettings")}
          >
            <Settings size={20} strokeWidth={1.6} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      <ChatSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        conversationId={conversationId}
        title={title}
        avatar={avatar}
        coachType={coach}
        explainLang={explainLang}
        context={convContext}
        onSave={(data) => {
          setTitle(data.title);
          setAvatar(data.avatar);
          setCoach(data.coachType);
          setExplainLang(data.explainLang);
          setConvContext(data.context);
        }}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto w-full min-h-0">
        <div className="px-4 md:px-6 py-6 space-y-5 max-w-3xl mx-auto w-full">
          {loadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-primary/50" />
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                      avatar
                        ? `bg-gradient-to-br ${getAvatarGradient(avatar)} text-base`
                        : "bg-muted"
                    }`}
                  >
                    {avatar || <HeaderIcon size={15} strokeWidth={1.6} className="text-muted-foreground" />}
                  </div>
                )}
                <div className="max-w-[75%] space-y-2">
                  <div
                    className={`px-4 py-3 text-[15px] leading-relaxed ${
                      msg.sender === "user"
                        ? "msg-user"
                        : "msg-ai text-foreground"
                    }`}
                  >
                    {msg.sender === "ai" ? <HoverableMessage text={msg.text} /> : msg.text}
                  </div>
                  {msg.correction && (
                    <Card className="p-3 glass-card !rounded-xl text-xs space-y-1 border-primary/10">
                      <p className="font-medium text-foreground">
                        <span className="line-through text-destructive/70">{msg.correction.wrong}</span> →{" "}
                        <span className="text-primary font-semibold">{msg.correction.right}</span>
                      </p>
                      <p className="text-muted-foreground leading-relaxed">{msg.correction.reason}</p>
                    </Card>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {showVocabPanel && (
        <div className="px-4 md:px-6 py-2.5 border-t border-border bg-card/80 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground">{tr("chat.activeWords")}</p>
            <button
              onClick={() => setEditDictOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Pencil size={14} strokeWidth={1.6} />
              {tr("vocab.editDict")}
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {activeWords.map((word) => (
              <span
                key={word}
                className="shrink-0 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-sm font-medium"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {voiceEnabled && showVoiceMic ? (
        <div className="px-4 md:px-6 py-6 border-t border-border bg-card/80 backdrop-blur-md shrink-0 flex flex-col items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVocabEnabled((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  vocabEnabled ? "chip-active" : "chip-inactive"
                }`}
              >
                <BookOpen size={14} strokeWidth={1.6} />
                {tr("chat.vocabMode")}
              </button>
              <button
                onClick={() => setVoiceEnabled((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all chip-active"
              >
                <Headphones size={14} strokeWidth={1.6} />
                {tr("chat.voiceMode")}
              </button>
            </div>
          )}
          <button
            onClick={handleMicClick}
            disabled={micStatus === "processing"}
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-lg ${
              micStatus === "listening"
                ? "bg-primary text-primary-foreground scale-110"
                : micStatus === "speaking"
                  ? "bg-accent text-accent-foreground"
                  : micStatus === "processing"
                    ? "bg-muted text-muted-foreground cursor-wait"
                    : "bg-primary/90 text-primary-foreground hover:bg-primary hover:scale-105"
            }`}
          >
            {micStatus === "processing" ? (
              <Loader2 size={36} className="animate-spin" />
            ) : micStatus === "speaking" ? (
              <MicOff size={36} strokeWidth={1.8} />
            ) : (
              <Mic size={36} strokeWidth={1.8} />
            )}
          </button>
          <p className="text-sm text-muted-foreground">
            {micStatus === "idle" && tr("audio.clickToStart")}
            {micStatus === "listening" && tr("audio.clickToStop")}
            {micStatus === "processing" && tr("audio.processing")}
            {micStatus === "speaking" && tr("audio.speaking")}
          </p>
          {rec.error === "no-speech" && (
            <p className="text-sm text-destructive">{tr("audio.errorNoSpeech")}</p>
          )}
        </div>
      ) : (
        <div className="px-4 md:px-6 py-3.5 border-t border-border bg-transparent shrink-0 space-y-2">
          {user && (
            <div className="flex items-center gap-2 max-w-3xl mx-auto mb-2">
              <button
                onClick={() => setVocabEnabled((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  vocabEnabled ? "chip-active" : "chip-inactive"
                }`}
              >
                <BookOpen size={14} strokeWidth={1.6} />
                {tr("chat.vocabMode")}
              </button>
              {showVoiceMic && (
                <button
                  onClick={() => setVoiceEnabled((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    voiceEnabled ? "chip-active" : "chip-inactive"
                  }`}
                >
                  <Headphones size={14} strokeWidth={1.6} />
                  {tr("chat.voiceMode")}
                </button>
              )}
            </div>
          )}
          <div className="flex items-center gap-2.5 bg-muted rounded-2xl px-4 py-2.5 max-w-3xl mx-auto">
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <Paperclip size={18} strokeWidth={1.6} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendText()}
              placeholder={tr("chat.typeMessage")}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base md:text-[15px] min-w-0"
            />
            <button
              onClick={handleSendText}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={15} strokeWidth={2} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      )}

      <VocabularyEditSheet open={editDictOpen} onOpenChange={setEditDictOpen} />
    </div>
  );
};

export default ChatPage;
