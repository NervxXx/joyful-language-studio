"""Сервис для работы с LLM через LangChain / OpenRouter"""
import json
import re
from typing import Optional, List
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage

from langchain_config import config

COACH_SYSTEM_PROMPTS = {
    "friendly": """You are a friendly English learning AI coach. Help the student practice English in a warm, encouraging way. 
When they make mistakes, gently correct them using the sandwich feedback: positive → correction → encouragement.
Keep responses conversational and natural (1-4 sentences typically).""",
    "strict": """You are a strict English learning AI coach. Focus on accuracy and correct grammar.
When the student makes mistakes, correct them directly and explain why. Be professional and goal-oriented.
Keep responses clear and structured (1-4 sentences).""",
    "calm": """You are a calm, supportive English learning AI coach. Create a relaxed learning atmosphere.
Correct mistakes with patience. Use the sandwich approach when giving feedback.
Keep responses brief and peaceful (1-4 sentences).""",
    "humorous": """You are a witty, humorous English learning AI coach. Lighten the mood with appropriate jokes and wordplay.
When correcting mistakes, do it in a funny, memorable way. Keep the student engaged and laughing while learning.
Responses: 1-4 sentences, light tone.""",
    "patient": """You are an extremely patient English learning AI coach. Never rush the student.
Repeat explanations if needed. Celebrate small progress. Use simple language and short sentences.
Keep responses supportive and unhurried (1-4 sentences).""",
    "motivating": """You are a motivating, energetic English learning AI coach. Inspire the student with enthusiasm.
Praise every effort. Use phrases like "Great try!", "You're improving!". Correct mistakes positively and focus on growth.
Keep responses upbeat and encouraging (1-4 sentences).""",
    "professional": """You are a professional English learning AI coach. Business-like, clear, and efficient.
Correct mistakes concisely with precise explanations. Focus on formal English and professional communication.
Keep responses structured and to the point (1-4 sentences).""",
    "casual": """You are a casual, laid-back English learning AI coach. Talk like a helpful friend, not a teacher.
Use colloquial expressions and natural slang when appropriate. Correct mistakes in a relaxed, non-judgmental way.
Keep responses short and conversational (1-4 sentences).""",
    "neutral": """You are an English learning AI coach. Be balanced and adaptive — match the student's energy.
Correct mistakes clearly and explain when helpful. Keep responses natural and concise (1-4 sentences).""",
    "custom": """You are an English learning AI coach. Help the student practice English.
When they make mistakes, correct them. Keep responses natural (1-4 sentences).""",
}


class LangChainService:
    def __init__(self):
        self.api_key = config.OPENROUTER_API_KEY or "dummy-key"
        openrouter_config = config.get_openrouter_config()
        model_config = config.get_model_config()
        self.llm = ChatOpenAI(
            model=model_config["model"],
            temperature=model_config["temperature"],
            max_tokens=model_config["max_tokens"],
            api_key=self.api_key,
            base_url=openrouter_config["base_url"],
            default_headers=openrouter_config["default_headers"],
            streaming=False,
            timeout=60.0,
        )
        self.memories: dict[str, List[BaseMessage]] = {}
        self.max_history = config.MAX_HISTORY_LENGTH

    def _get_messages(
        self,
        conversation_id: str,
        history: List[dict],
        user_message: str,
        coach_type: str = "friendly",
        context: Optional[str] = None,
        voice_mode: bool = False,
        explain_lang: Optional[str] = None,
        vocab_words: Optional[List[str]] = None,
    ) -> List[BaseMessage]:
        system = COACH_SYSTEM_PROMPTS.get(coach_type, COACH_SYSTEM_PROMPTS["friendly"])
        if coach_type == "custom" and context:
            m = re.search(r"\[PERSONALITY\](.*?)\[/PERSONALITY\]", context, re.DOTALL)
            if m:
                personality = m.group(1).strip()
                system = (
                    f"You are an English learning AI coach with the following personality: {personality}\n"
                    "When they make mistakes, correct them. Keep responses natural (1-4 sentences)."
                )
                context = re.sub(r"\[PERSONALITY\].*?\[/PERSONALITY\]\s*", "", context, flags=re.DOTALL).strip() or None
        if explain_lang == "ru":
            ru_rule = (
                "CRITICAL: Any correction or explanation of a mistake MUST be written in RUSSIAN. "
                "Never write 'Just a small correction', 'you might want to say', 'we usually say', 'a better way would be' in English. "
                "Use Russian instead: 'Небольшая поправка', 'Лучше сказать', 'Обычно говорят' и т.д. "
                "Dialogue (greetings, questions) — in English. Corrections/explanations — only in Russian."
            )
            system = ru_rule + "\n\n" + system
        elif explain_lang == "en":
            system = (
                "CRITICAL RULE: Write your entire response in English.\n\n"
                + system
            )
        if context and context.strip():
            system = system.rstrip() + f"\n\nUser context for this conversation:\n{context.strip()}"
        if vocab_words:
            words_list = ", ".join(vocab_words)
            system = system.rstrip() + (
                f"\n\n=== VOCABULARY PRACTICE MODE (MANDATORY) ===\n"
                f"Target words: {words_list}\n"
                f"RULES YOU MUST FOLLOW:\n"
                f"1. In EVERY response, naturally use 1-3 words from the target list above.\n"
                f"2. Steer the conversation toward topics where the student MUST use these words.\n"
                f"3. Ask direct questions that require the student to answer using the target words. "
                f"For example: ask about their preferences, opinions, experiences related to these words.\n"
                f"4. If the student uses a target word correctly, briefly praise them and introduce the next target word.\n"
                f"5. If the student avoids target words, gently rephrase your question so the target word becomes the obvious answer.\n"
                f"6. NEVER just list the words. Weave them into natural dialogue.\n"
                f"=== END VOCABULARY PRACTICE ===\n"
            )
        if voice_mode:
            system = system.rstrip() + "\n\nVoice mode: User messages come from speech-to-text. Do NOT correct or comment on punctuation, commas, periods, or capitalization. Focus only on grammar and vocabulary errors."
        if explain_lang == "ru":
            system = system.rstrip() + "\n\n[REMINDER: Corrections and explanations = RUSSIAN only. No English for correction phrases.]"
        messages: List[BaseMessage] = [SystemMessage(content=system)]

        for h in history[-self.max_history:]:
            if h.get("is_from_user"):
                messages.append(HumanMessage(content=h.get("content", "")))
            else:
                messages.append(AIMessage(content=h.get("content", "")))

        messages.append(HumanMessage(content=user_message))
        return messages

    async def _rewrite_explanations_to_russian(self, text: str) -> str:
        """Force correction/explanation fragments to Russian while keeping dialogue natural."""
        prompt = (
            "Transform the assistant reply into strict JSON with exactly two fields:\n"
            "{\"dialogue_en\":\"...\", \"explanation_ru\":\"...\"}\n\n"
            "Rules:\n"
            "1) dialogue_en: only casual conversational part in English (greetings, follow-up question, encouragement).\n"
            "2) explanation_ru: all corrections/explanations in Russian only.\n"
            "3) If there is no correction, explanation_ru must be empty string.\n"
            "4) No markdown, no extra keys, valid JSON only.\n\n"
            f"Input reply:\n{text}"
        )
        resp = await self.llm.ainvoke([HumanMessage(content=prompt)])
        raw = (resp.content if hasattr(resp, "content") else str(resp)).strip()
        raw = re.sub(r"^```(?:json)?\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw)
        try:
            data = json.loads(raw)
            dialogue_en = str(data.get("dialogue_en", "")).strip()
            explanation_ru = str(data.get("explanation_ru", "")).strip()
            if dialogue_en and explanation_ru:
                return f"{dialogue_en}\n{explanation_ru}"
            if dialogue_en:
                return dialogue_en
            if explanation_ru:
                return explanation_ru
        except Exception:
            pass
        return text

    async def generate_coach_response(
        self,
        user_message: str,
        conversation_id: str,
        history: List[dict],
        coach_type: str = "friendly",
        context: Optional[str] = None,
        voice_mode: bool = False,
        explain_lang: Optional[str] = None,
        vocab_words: Optional[List[str]] = None,
    ) -> dict:
        """Generate AI coach response with optional correction."""
        messages = self._get_messages(
            conversation_id, history, user_message, coach_type,
            context=context, voice_mode=voice_mode, explain_lang=explain_lang,
            vocab_words=vocab_words,
        )
        response = await self.llm.ainvoke(messages)
        content = response.content if hasattr(response, "content") else str(response)
        if explain_lang == "ru":
            try:
                content = await self._rewrite_explanations_to_russian(content)
            except Exception:
                # Fallback to original model output if rewrite step fails.
                pass
        return {"text": content, "correction": None}

    async def lookup_word(self, word: str) -> dict:
        """Get translation, phonetic, and usage examples for a word (EN or RU input)."""
        prompt = f"""You are an English-Russian dictionary assistant. The user entered: "{word}"

Respond with a JSON object only (no extra text), in this exact format:
{{
  "word_en": "English word",
  "word_ru": "Russian translation",
  "phonetic": "/IPA or transcription/",
  "examples": ["Example sentence 1 in English", "Example sentence 2"]
}}

Rules:
- If the input looks like Russian, provide the English translation in word_en and the Russian in word_ru
- If the input looks like English, provide it in word_en and Russian translation in word_ru
- Phonetic: IPA notation in slashes, e.g. /ˈeksəmpəl/
- Examples: 2-3 short example sentences using the word in context
- Output ONLY the JSON, no markdown, no explanation"""

        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        content = (response.content if hasattr(response, "content") else str(response)).strip()
        content = re.sub(r"^```\w*\n?", "", content)
        content = re.sub(r"\n?```$", "", content)
        data = json.loads(content)
        examples_str = "\n".join(data.get("examples", [])) if isinstance(data.get("examples"), list) else str(data.get("examples", ""))
        return {
            "word_en": str(data.get("word_en", word)).strip(),
            "word_ru": str(data.get("word_ru", "")).strip(),
            "phonetic": str(data.get("phonetic", "")).strip() or None,
            "examples": examples_str or None,
        }
