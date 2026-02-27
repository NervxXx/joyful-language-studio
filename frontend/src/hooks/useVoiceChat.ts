import { useState, useRef, useCallback } from "react";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

const TTS_CHUNK_MAX = 180;

function chunkForTTS(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= TTS_CHUNK_MAX) return [trimmed];
  const chunks: string[] = [];
  let rest = trimmed;
  while (rest.length > 0) {
    if (rest.length <= TTS_CHUNK_MAX) {
      chunks.push(rest);
      break;
    }
    const slice = rest.slice(0, TTS_CHUNK_MAX);
    const lastSpace = slice.lastIndexOf(" ");
    const breakAt = lastSpace > TTS_CHUNK_MAX / 2 ? lastSpace : TTS_CHUNK_MAX;
    chunks.push(rest.slice(0, breakAt).trim());
    rest = rest.slice(breakAt).trim();
  }
  return chunks.filter(Boolean);
}

export function useSpeechRecognition(onFinalTranscript?: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  const onFinalRef = useRef(onFinalTranscript);
  onFinalRef.current = onFinalTranscript;

  const SpeechRecognitionAPI =
    typeof window !== "undefined"
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : undefined;

  const start = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      setError("Speech recognition not supported");
      return;
    }
    setError(null);
    setTranscript("");
    transcriptRef.current = "";
    const rec = new SpeechRecognitionAPI();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let full = "";
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0]?.transcript ?? "";
      }
      transcriptRef.current = full;
      setTranscript(full);
    };
    rec.onerror = (e: Event & { error?: string }) => {
      const err = (e as { error?: string }).error;
      if (err === "no-speech") setError("no-speech");
      else if (err === "not-allowed") setError("not-allowed");
      else setError(err || "recognition-error");
    };
    rec.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      const finalText = transcriptRef.current.trim();
      if (onFinalRef.current) onFinalRef.current(finalText);
    };
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [SpeechRecognitionAPI]);

  const stop = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
  }, []);

  return { isListening, transcript, error, start, stop, supported: !!SpeechRecognitionAPI };
}

export function useSpeechSynthesis(onDone?: () => void) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const chunks = chunkForTTS(text);
    if (chunks.length === 0) {
      onDoneRef.current?.();
      return;
    }
    let idx = 0;
    const speakNext = () => {
      if (idx >= chunks.length) {
        setIsSpeaking(false);
        onDoneRef.current?.();
        return;
      }
      const u = new SpeechSynthesisUtterance(chunks[idx]);
      u.lang = "en-US";
      u.rate = 0.95;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => {
        idx++;
        speakNext();
      };
      window.speechSynthesis.speak(u);
    };
    speakNext();
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onDoneRef.current?.();
    }
  }, []);

  return {
    isSpeaking,
    speak,
    stop,
    supported: typeof window !== "undefined" && "speechSynthesis" in window,
  };
}
