import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

type Word = {
  id: number | null;
  word_en: string;
  word_ru: string;
  is_active: boolean;
  sort_order: number;
};

interface VocabularyEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VocabularyEditSheet({ open, onOpenChange }: VocabularyEditSheetProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tr } = useLanguage();
  const { user } = useAuth();
  const [activeOrder, setActiveOrder] = useState<number[] | null>(null);
  const [passiveOrder, setPassiveOrder] = useState<number[] | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverList, setDragOverList] = useState<"active" | "passive" | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const { data: wordsData } = useQuery({
    queryKey: ["vocabulary", "words"],
    queryFn: () => api.getVocabularyWords(),
    enabled: !!user && open,
  });

  const allWords = useMemo(() => {
    if (!user || !wordsData) return [];
    return wordsData.map((w) => ({
      id: w.id,
      word_en: w.word_en,
      word_ru: w.word_ru,
      is_active: w.is_active !== false,
      sort_order: w.sort_order ?? 0,
    }));
  }, [user, wordsData]);

  const dbActiveWords = useMemo(
    () => allWords.filter((w) => w.is_active).sort((a, b) => a.sort_order - b.sort_order),
    [allWords]
  );
  const dbPassiveWords = useMemo(
    () => allWords.filter((w) => !w.is_active).sort((a, b) => a.sort_order - b.sort_order),
    [allWords]
  );
  const baseActiveIds = dbActiveWords.map((w) => w.id).filter((id): id is number => id != null);
  const basePassiveIds = dbPassiveWords.map((w) => w.id).filter((id): id is number => id != null);
  const effectiveActiveIds = activeOrder !== null ? activeOrder : baseActiveIds;
  const effectivePassiveIds = passiveOrder !== null ? passiveOrder : basePassiveIds;
  const byId = useMemo(() => new Map(allWords.filter((w) => w.id != null).map((w) => [w.id as number, w])), [allWords]);
  const activeWords = effectiveActiveIds.map((id) => byId.get(id)).filter((w): w is Word => !!w);
  const passiveWords = effectivePassiveIds.map((id) => byId.get(id)).filter((w): w is Word => !!w);

  const reorderMutation = useMutation({
    mutationFn: (items: { id: number; is_active: boolean; sort_order: number }[]) => api.reorderVocabularyWords(items),
    onSuccess: () => {
      setActiveOrder(null);
      setPassiveOrder(null);
      queryClient.invalidateQueries({ queryKey: ["vocabulary", "words"] });
    },
  });

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

  const handleOpenFull = () => {
    onOpenChange(false);
    navigate("/vocabulary");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>{tr("vocab.editDict")}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 mt-4">
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{tr("vocab.activeDict")}</h3>
            <div
              className="flex flex-col gap-2 min-h-[80px] max-h-[200px] overflow-y-auto p-2 rounded-lg border-2 border-dashed border-primary/20 bg-muted/20"
              onDragOver={(e) => { e.preventDefault(); setDragOverList("active"); setDragOverId(null); }}
              onDrop={() => onDropToList("active")}
            >
              {activeWords.map((word) => (
                <Card
                  key={word.id}
                  draggable
                  onDragStart={() => onDragStart(word.id)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverList("active"); setDragOverId(word.id); }}
                  onDrop={() => onDropToList("active", word.id)}
                  className={`p-3 flex flex-row items-center gap-2 cursor-grab active:cursor-grabbing ${dragOverList === "active" && dragOverId === word.id ? "ring-2 ring-primary/40" : ""}`}
                >
                  <GripVertical size={14} className="text-muted-foreground/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block">{word.word_en}</span>
                    <span className="text-xs text-muted-foreground">{word.word_ru}</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{tr("vocab.passiveDict")}</h3>
            <div
              className="flex flex-col gap-2 min-h-[80px] max-h-[200px] overflow-y-auto p-2 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30"
              onDragOver={(e) => { e.preventDefault(); setDragOverList("passive"); setDragOverId(null); }}
              onDrop={() => onDropToList("passive")}
            >
              {passiveWords.map((word) => (
                <Card
                  key={word.id}
                  draggable
                  onDragStart={() => onDragStart(word.id)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverList("passive"); setDragOverId(word.id); }}
                  onDrop={() => onDropToList("passive", word.id)}
                  className={`p-3 flex flex-row items-center gap-2 cursor-grab active:cursor-grabbing opacity-90 ${dragOverList === "passive" && dragOverId === word.id ? "ring-2 ring-primary/40" : ""}`}
                >
                  <GripVertical size={14} className="text-muted-foreground/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block">{word.word_en}</span>
                    <span className="text-xs text-muted-foreground">{word.word_ru}</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
        <div className="pt-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={handleOpenFull}>
            {tr("vocab.openFullDict")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
