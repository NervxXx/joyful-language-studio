import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Volume2, Plus, Trash2, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSpeechSynthesis } from "@/hooks/useVoiceChat";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1, transition: { duration: 0.35 } } };

const DEMO_WORDS = [
  { word_en: "appetizer", word_ru: "закуска", is_active: true },
  { word_en: "main course", word_ru: "основное блюдо", is_active: true },
  { word_en: "dessert", word_ru: "десерт", is_active: true },
  { word_en: "bill", word_ru: "счёт", is_active: false },
  { word_en: "waiter", word_ru: "официант", is_active: true },
  { word_en: "menu", word_ru: "меню", is_active: false },
  { word_en: "tip", word_ru: "чаевые", is_active: true },
  { word_en: "reservation", word_ru: "бронирование", is_active: false },
];

type LookupResult = {
  word_en: string;
  word_ru: string;
  phonetic: string | null;
  examples: string | null;
};

const VocabularyPage = () => {
  const queryClient = useQueryClient();
  const { tr } = useLanguage();
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [inputWord, setInputWord] = useState("");
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<number[] | null>(null);
  const [passiveOrder, setPassiveOrder] = useState<number[] | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverList, setDragOverList] = useState<"active" | "passive" | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const { speak } = useSpeechSynthesis();
  const [detailWord, setDetailWord] = useState<{
    id?: number | null;
    word_en: string;
    word_ru: string;
    phonetic?: string | null;
    example?: string | null;
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<LookupResult | null>(null);

  const { data: wordsData } = useQuery({
    queryKey: ["vocabulary", "words"],
    queryFn: () => api.getVocabularyWords(),
    enabled: !!user,
  });

  const addWordMutation = useMutation({
    mutationFn: api.addVocabularyWord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary", "words"] });
      setAddOpen(false);
      setInputWord("");
      setLookupResult(null);
    },
  });

  const allWords =
    user && wordsData !== undefined
      ? wordsData.map((w) => ({
          id: w.id,
          word_en: w.word_en,
          word_ru: w.word_ru,
          phonetic: w.phonetic,
          example: w.example,
          is_active: w.is_active !== false,
          sort_order: w.sort_order ?? 0,
        }))
      : DEMO_WORDS.map((w) => ({
          id: null as number | null,
          word_en: w.word_en,
          word_ru: w.word_ru,
          phonetic: undefined,
          example: undefined,
          is_active: w.is_active,
          sort_order: 0,
        }));

  const dbActiveWords = useMemo(
    () =>
      allWords
        .filter((w) => w.is_active)
        .sort((a, b) => ((a.id == null ? 0 : a.sort_order ?? 0) - (b.id == null ? 0 : b.sort_order ?? 0))),
    [allWords]
  );
  const dbPassiveWords = useMemo(
    () =>
      allWords
        .filter((w) => !w.is_active)
        .sort((a, b) => ((a.id == null ? 0 : a.sort_order ?? 0) - (b.id == null ? 0 : b.sort_order ?? 0))),
    [allWords]
  );
  const baseActiveIds = useMemo(() => dbActiveWords.map((w) => w.id).filter((id): id is number => id != null), [dbActiveWords]);
  const basePassiveIds = useMemo(() => dbPassiveWords.map((w) => w.id).filter((id): id is number => id != null), [dbPassiveWords]);
  const effectiveActiveIds = activeOrder !== null ? activeOrder : baseActiveIds;
  const effectivePassiveIds = passiveOrder !== null ? passiveOrder : basePassiveIds;
  const byId = useMemo(() => new Map(allWords.filter((w) => w.id != null).map((w) => [w.id as number, w])), [allWords]);
  const activeWords = effectiveActiveIds.map((id) => byId.get(id)).filter((w): w is NonNullable<typeof w> => !!w);
  const passiveWords = effectivePassiveIds.map((id) => byId.get(id)).filter((w): w is NonNullable<typeof w> => !!w);
  const demoActive = allWords.filter((w) => w.id == null && w.is_active);
  const demoPassive = allWords.filter((w) => w.id == null && !w.is_active);

  const updateWordMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => api.updateVocabularyWord(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vocabulary", "words"] }),
  });
  const reorderMutation = useMutation({
    mutationFn: (items: { id: number; is_active: boolean; sort_order: number }[]) => api.reorderVocabularyWords(items),
    onSuccess: () => {
      setActiveOrder(null);
      setPassiveOrder(null);
      queryClient.invalidateQueries({ queryKey: ["vocabulary", "words"] });
    },
  });

  const deleteWordMutation = useMutation({
    mutationFn: api.deleteVocabularyWord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary", "words"] });
      setDetailWord(null);
    },
  });

  const handleLookup = async () => {
    const w = inputWord.trim();
    if (!w) return;
    setLookupLoading(true);
    setLookupError(null);
    try {
      const res = await api.lookupWord(w);
      setLookupResult(res);
    } catch (e) {
      setLookupError((e as Error).message);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleAddToDict = (asActive = true) => {
    if (!lookupResult || !user) return;
    const nextSort = asActive ? effectiveActiveIds.length : effectivePassiveIds.length;
    addWordMutation.mutate({
      word_en: lookupResult.word_en,
      word_ru: lookupResult.word_ru,
      phonetic: lookupResult.phonetic ?? undefined,
      example: lookupResult.examples ?? undefined,
      is_active: asActive,
      sort_order: nextSort,
    });
  };

  const resetDialog = () => {
    setInputWord("");
    setLookupResult(null);
    setLookupError(null);
  };

  const commitReorder = (nextActive: number[], nextPassive: number[]) => {
    const items = [
      ...nextActive.map((id, idx) => ({ id, is_active: true, sort_order: idx })),
      ...nextPassive.map((id, idx) => ({ id, is_active: false, sort_order: idx })),
    ];
    reorderMutation.mutate(items);
  };

  const removeFrom = (ids: number[], id: number) => ids.filter((x) => x !== id);

  const insertAt = (ids: number[], id: number, beforeId: number | null) => {
    const without = removeFrom(ids, id);
    if (beforeId == null) return [...without, id];
    const idx = without.indexOf(beforeId);
    if (idx === -1) return [...without, id];
    return [...without.slice(0, idx), id, ...without.slice(idx)];
  };

  const onDragStart = (id: number | null) => {
    if (id == null) return;
    setDraggingId(id);
  };

  const onDropToList = (target: "active" | "passive", beforeId: number | null = null) => {
    if (draggingId == null) return;
    const baseActive = removeFrom(effectiveActiveIds, draggingId);
    const basePassive = removeFrom(effectivePassiveIds, draggingId);
    const nextActive = target === "active" ? insertAt(baseActive, draggingId, beforeId) : baseActive;
    const nextPassive = target === "passive" ? insertAt(basePassive, draggingId, beforeId) : basePassive;
    setActiveOrder(nextActive);
    setPassiveOrder(nextPassive);
    setDraggingId(null);
    setDragOverId(null);
    setDragOverList(null);
    commitReorder(nextActive, nextPassive);
  };

  const handleCardClick = async (word: { id?: number | null; word_en: string; word_ru: string; phonetic?: string | null; example?: string | null }) => {
    setDetailWord(word);
    setDetailData(null);
    if (word.phonetic || word.example) {
      setDetailData({
        word_en: word.word_en,
        word_ru: word.word_ru,
        phonetic: word.phonetic ?? null,
        examples: word.example ?? null,
      });
      return;
    }
    setDetailLoading(true);
    try {
      const res = await api.lookupWord(word.word_en);
      setDetailData(res);
    } catch {
      setDetailData({
        word_en: word.word_en,
        word_ru: word.word_ru,
        phonetic: null,
        examples: null,
      });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <motion.div className="p-5 md:p-8 lg:p-12 max-w-5xl mx-auto space-y-10" initial="hidden" animate="show" variants={container}>
      <motion.div variants={item} className="space-y-1.5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading tracking-tight">{tr("vocab.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {user && wordsData
              ? `${activeWords.length} ${tr("vocab.activeDict").toLowerCase()} · ${passiveWords.length} ${tr("vocab.passiveDict").toLowerCase()}`
              : tr("vocab.subtitle")}
          </p>
        </div>
        {user && (
          <Button
            onClick={() => { setAddOpen(true); resetDialog(); }}
            className="btn-gradient gap-2 shrink-0"
          >
            <Plus size={16} />
            {tr("vocab.addWord")}
          </Button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <motion.section variants={item} className="space-y-3">
          <h2 className="section-heading flex items-center gap-2">
            {tr("vocab.activeDict")}
            <span className="text-xs font-normal text-muted-foreground">({activeWords.length})</span>
          </h2>
          <p className="text-xs text-muted-foreground">{tr("vocab.activeHint")}</p>
          <div
            className="flex flex-col gap-2 min-h-[120px] max-h-[400px] overflow-y-auto p-3 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5"
            onDragOver={(e) => { e.preventDefault(); setDragOverList("active"); setDragOverId(null); }}
            onDrop={() => onDropToList("active")}
          >
            {activeWords.map((word) => (
              <motion.div key={`a-${word.id ?? word.word_en}`} variants={item}>
                <Card
                  draggable={word.id != null}
                  onDragStart={() => onDragStart(word.id)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverList("active"); setDragOverId(word.id ?? null); }}
                  onDrop={() => onDropToList("active", word.id ?? null)}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardClick(word)}
                  onKeyDown={(e) => e.key === "Enter" && handleCardClick(word)}
                  className={`card-hover relative p-4 bg-card shadow-sm rounded-xl flex flex-row items-center gap-3 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-ring ${
                    dragOverList === "active" && dragOverId === word.id ? "ring-2 ring-primary/40" : ""
                  }`}
                >
                  {word.id != null && <GripVertical size={16} className="text-muted-foreground/60 shrink-0" />}
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-base font-bold text-foreground block">{word.word_en}</span>
                    <span className="text-xs text-muted-foreground">{word.word_ru}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {word.id != null && (
                      <button
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        onClick={(e) => { e.stopPropagation(); deleteWordMutation.mutate(word.id!); }}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} strokeWidth={1.6} />
                      </button>
                    )}
                    <button
                      className="text-muted-foreground hover:text-primary transition-colors p-1"
                      onClick={(e) => { e.stopPropagation(); speak(word.word_en); }}
                      aria-label="Play"
                    >
                      <Volume2 size={14} strokeWidth={1.6} />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
            {demoActive.map((word) => (
              <motion.div key={`ad-${word.word_en}`} variants={item}>
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardClick(word)}
                  onKeyDown={(e) => e.key === "Enter" && handleCardClick(word)}
                  className="card-hover p-4 bg-card shadow-sm rounded-xl flex flex-row items-center gap-3 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-base font-bold text-foreground block">{word.word_en}</span>
                    <span className="text-xs text-muted-foreground">{word.word_ru}</span>
                  </div>
                  <button
                    className="text-muted-foreground hover:text-primary transition-colors p-1 shrink-0"
                    onClick={(e) => { e.stopPropagation(); speak(word.word_en); }}
                    aria-label="Play"
                  >
                    <Volume2 size={14} strokeWidth={1.6} />
                  </button>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} className="space-y-3">
          <h2 className="section-heading flex items-center gap-2">
            {tr("vocab.passiveDict")}
            <span className="text-xs font-normal text-muted-foreground">({passiveWords.length})</span>
          </h2>
          <p className="text-xs text-muted-foreground">{tr("vocab.passiveHint")}</p>
          <div
            className="flex flex-col gap-2 min-h-[120px] max-h-[400px] overflow-y-auto p-3 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30"
            onDragOver={(e) => { e.preventDefault(); setDragOverList("passive"); setDragOverId(null); }}
            onDrop={() => onDropToList("passive")}
          >
            {passiveWords.map((word) => (
              <motion.div key={`p-${word.id ?? word.word_en}`} variants={item}>
                <Card
                  draggable={word.id != null}
                  onDragStart={() => onDragStart(word.id)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverList("passive"); setDragOverId(word.id ?? null); }}
                  onDrop={() => onDropToList("passive", word.id ?? null)}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardClick(word)}
                  onKeyDown={(e) => e.key === "Enter" && handleCardClick(word)}
                  className={`card-hover relative p-4 bg-card shadow-sm rounded-xl flex flex-row items-center gap-3 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-ring opacity-90 ${
                    dragOverList === "passive" && dragOverId === word.id ? "ring-2 ring-primary/40" : ""
                  }`}
                >
                  {word.id != null && <GripVertical size={16} className="text-muted-foreground/60 shrink-0" />}
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-base font-bold text-foreground block">{word.word_en}</span>
                    <span className="text-xs text-muted-foreground">{word.word_ru}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {word.id != null && (
                      <button
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        onClick={(e) => { e.stopPropagation(); deleteWordMutation.mutate(word.id!); }}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} strokeWidth={1.6} />
                      </button>
                    )}
                    <button
                      className="text-muted-foreground hover:text-primary transition-colors p-1"
                      onClick={(e) => { e.stopPropagation(); speak(word.word_en); }}
                      aria-label="Play"
                    >
                      <Volume2 size={14} strokeWidth={1.6} />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
            {demoPassive.map((word) => (
              <motion.div key={`pd-${word.word_en}`} variants={item}>
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardClick(word)}
                  onKeyDown={(e) => e.key === "Enter" && handleCardClick(word)}
                  className="card-hover p-4 bg-card shadow-sm rounded-xl flex flex-row items-center gap-3 opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-base font-bold text-foreground block">{word.word_en}</span>
                    <span className="text-xs text-muted-foreground">{word.word_ru}</span>
                  </div>
                  <button
                    className="text-muted-foreground hover:text-primary transition-colors p-1 shrink-0"
                    onClick={(e) => { e.stopPropagation(); speak(word.word_en); }}
                    aria-label="Play"
                  >
                    <Volume2 size={14} strokeWidth={1.6} />
                  </button>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      <Dialog open={!!detailWord} onOpenChange={(o) => !o && setDetailWord(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailWord?.word_en}
              {detailWord && (
                <button
                  onClick={() => speak(detailWord.word_en)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                  aria-label="Play"
                >
                  <Volume2 size={18} strokeWidth={1.6} />
                </button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {detailLoading && <p className="text-sm text-muted-foreground">{tr("vocab.loading")}</p>}
            {detailData && !detailLoading && (
              <div className="space-y-3 text-sm">
                <p><span className="font-medium text-muted-foreground">{tr("vocab.translation")}:</span> {detailData.word_ru}</p>
                {detailData.phonetic && (
                  <p><span className="font-medium text-muted-foreground">{tr("vocab.phonetic")}:</span> {detailData.phonetic}</p>
                )}
                {detailData.examples && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">{tr("vocab.examples")}:</p>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{detailData.examples}</p>
                  </div>
                )}
                {detailWord && "id" in detailWord && detailWord.id != null && (
                  <Button variant="destructive" size="sm" className="mt-2" onClick={() => deleteWordMutation.mutate(detailWord.id!)}>
                    <Trash2 size={14} /> Удалить из словаря
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>


      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetDialog(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tr("vocab.addWord")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <input
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                placeholder={tr("vocab.wordPlaceholder")}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground"
                disabled={lookupLoading}
              />
              <Button onClick={handleLookup} disabled={lookupLoading || !inputWord.trim()} variant="secondary">
                {lookupLoading ? tr("vocab.loading") : tr("vocab.getTranslation")}
              </Button>
            </div>
            {lookupError && <p className="text-sm text-destructive">{lookupError}</p>}
            {lookupResult && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground">{tr("vocab.translation")}:</span>
                  {lookupResult.word_ru}
                  <button
                    onClick={() => speak(lookupResult.word_en)}
                    className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Play"
                  >
                    <Volume2 size={16} strokeWidth={1.6} />
                  </button>
                </p>
                {lookupResult.phonetic && (
                  <p><span className="font-medium text-muted-foreground">{tr("vocab.phonetic")}:</span> {lookupResult.phonetic}</p>
                )}
                {lookupResult.examples && (
                  <p><span className="font-medium text-muted-foreground">{tr("vocab.examples")}:</span><br />
                    <span className="text-muted-foreground whitespace-pre-line">{lookupResult.examples}</span></p>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => handleAddToDict(false)}
              disabled={!lookupResult || addWordMutation.isPending}
              className="w-full sm:w-auto"
            >
              {tr("vocab.passiveDict")}
            </Button>
            <Button
              onClick={() => handleAddToDict(true)}
              disabled={!lookupResult || addWordMutation.isPending}
              className="btn-gradient w-full sm:w-auto"
            >
              {addWordMutation.isPending ? tr("vocab.loading") : tr("vocab.activeDict")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default VocabularyPage;
