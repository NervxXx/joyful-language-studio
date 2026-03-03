import { useState, useCallback } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";

const cache = new Map<string, { word_en: string; word_ru: string; phonetic: string | null; examples: string | null }>();

function stripPunctuation(w: string): string {
  return w.replace(/^[^\p{L}\p{N}]+/u, "").replace(/[^\p{L}\p{N}]+$/u, "");
}

function WordSpan({
  word,
  children,
  tr,
}: {
  word: string;
  children: React.ReactNode;
  tr: (k: string) => string;
}) {
  const cleaned = stripPunctuation(word);
  const [data, setData] = useState<typeof cache extends Map<string, infer V> ? V : never | null>(cache.get(cleaned) ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOnOpen = useCallback(async () => {
    if (!cleaned || cleaned.length < 2) return;
    if (cache.has(cleaned)) {
      setData(cache.get(cleaned)!);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.lookupWord(cleaned);
      cache.set(cleaned, res);
      setData(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [cleaned]);

  const isEmpty = cleaned.length < 2;

  if (isEmpty) {
    return <span>{children}</span>;
  }

  return (
    <Popover onOpenChange={(open) => open && fetchOnOpen()}>
      <PopoverTrigger asChild>
        <span className="border-b border-dashed border-muted-foreground/40 cursor-pointer hover:border-primary/60 hover:text-primary transition-colors">
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent align="center" side="bottom" sideOffset={10} collisionPadding={16} className="w-72">
        {loading && <p className="text-sm text-muted-foreground">{tr("vocab.loading")}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {data && (
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-foreground">{data.word_en} → {data.word_ru}</p>
            {data.phonetic && <p className="text-muted-foreground">{data.phonetic}</p>}
            {data.examples && (
              <p className="text-muted-foreground text-xs whitespace-pre-line leading-relaxed">
                {data.examples}
              </p>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function HoverableMessage({ text }: { text: string }) {
  const { tr } = useLanguage();
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((part, i) => {
        if (/^\s+$/.test(part)) return <span key={i}>{part}</span>;
        return (
          <WordSpan key={i} word={part} tr={tr}>
            {part}
          </WordSpan>
        );
      })}
    </>
  );
}
