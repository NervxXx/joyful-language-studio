import { createContext, useContext, useState, type ReactNode } from "react";

type Lang = "ru" | "en";

const t = {
  // Sidebar & Nav
  "nav.learn": { ru: "Обучение", en: "Learn" },
  "nav.more": { ru: "Ещё", en: "More" },
  "nav.home": { ru: "Главная", en: "Home" },
  "nav.freeConversation": { ru: "Свободный диалог", en: "Free Conversation" },
  "nav.vocabulary": { ru: "Словарь", en: "Vocabulary" },
  "nav.listeningLab": { ru: "Аудирование", en: "Listening Lab" },
  "nav.grammarQuest": { ru: "Грамматика", en: "Grammar Quest" },
  "nav.pronunciation": { ru: "Произношение", en: "Pronunciation" },
  "nav.writingMentor": { ru: "Письмо", en: "Writing Mentor" },
  "nav.settings": { ru: "Настройки", en: "Settings" },
  "nav.skillMap": { ru: "Карта навыков", en: "Skill Map" },
  "nav.menu": { ru: "Меню", en: "Menu" },
  "nav.library": { ru: "Библиотека", en: "Library" },
  "nav.chat": { ru: "Чат", en: "Chat" },
  "nav.stats": { ru: "Статистика", en: "Stats" },
  "nav.profile": { ru: "Профиль", en: "Profile" },

  // Home
  "home.greeting": { ru: "Привет, Алекс 👋", en: "Hi, Alex 👋" },
  "home.subtitle": { ru: "Готов продолжить обучение?", en: "Ready to continue learning?" },
  "home.streak": { ru: "Серия", en: "Streak" },
  "home.streakValue": { ru: "12 дней", en: "12 days" },
  "home.today": { ru: "Сегодня", en: "Today" },
  "home.todayValue": { ru: "13 мин", en: "13 min" },
  "home.words": { ru: "Слова", en: "Words" },
  "home.level": { ru: "Уровень", en: "Level" },
  "home.dailyGoal": { ru: "Дневная цель", en: "Daily goal" },
  "home.dailyGoalProgress": { ru: "13 / 20 мин", en: "13 / 20 min" },
  "home.continueConversation": { ru: "Продолжить диалог", en: "Continue conversation" },
  "home.continueDesc": { ru: "Роль: Повар · Уровень A2 · Осталось 4 мин", en: "Chef role · A2 level · 4 min left" },
  "home.modes": { ru: "Режимы", en: "Modes" },
  "home.freeConvTitle": { ru: "Свободный диалог", en: "Free Conversation" },
  "home.freeConvDesc": { ru: "Выберите уровень и роль. Практикуйте реальные диалоги.", en: "Choose level & role. Practice real dialogues." },
  "home.vocabTitle": { ru: "Режим словаря", en: "Vocabulary Mode" },
  "home.vocabDesc": { ru: "Выучите 10 слов → Говорите с ИИ, используя их.", en: "Learn 10 words → Speak with AI using them." },
  "home.listenTitle": { ru: "Аудирование", en: "Listening Lab" },
  "home.listenDesc": { ru: "Видео + интерактивные субтитры.", en: "Video + interactive subtitles." },

  // Setup
  "setup.title": { ru: "Новый диалог", en: "New conversation" },
  "setup.subtitle": { ru: "Настройте практическую сессию", en: "Set up your practice session" },
  "setup.level": { ru: "Уровень", en: "Level" },
  "setup.context": { ru: "Контекст", en: "Context" },
  "setup.situation": { ru: "Ситуация (необязательно)", en: "Situation (optional)" },
  "setup.situationPlaceholder": { ru: "напр. Заказ еды в ресторане", en: "e.g. Ordering food in a restaurant" },
  "setup.start": { ru: "Начать говорить →", en: "Start Speaking →" },
  "setup.chef": { ru: "Повар", en: "Chef" },
  "setup.tourist": { ru: "Турист", en: "Tourist" },
  "setup.shopAssistant": { ru: "Продавец", en: "Shop Assistant" },
  "setup.officeWorker": { ru: "Офисный работник", en: "Office Worker" },
  "setup.student": { ru: "Студент", en: "Student" },
  "setup.fitnessCoach": { ru: "Фитнес-тренер", en: "Fitness Coach" },

  // Vocabulary
  "vocab.title": { ru: "Словарь", en: "Vocabulary" },
  "vocab.subtitle": { ru: "В ресторане · 8 слов", en: "At the Restaurant · 8 words" },
  "vocab.practice": { ru: "Практика с ИИ →", en: "Practice with AI →" },

  // Chat
  "chat.typeMessage": { ru: "Введите сообщение...", en: "Type your message..." },
  "chat.vocabPractice": { ru: "Практика словаря", en: "Vocabulary Practice" },
  "chat.activeWords": { ru: "🔤 Активные слова:", en: "🔤 Active words:" },
  "chat.coachGreeting": { ru: "Привет! Я твой коуч. Как пройдёт наше занятие — зависит от тебя. Не бойся ошибок, я здесь чтобы помочь! 💪", en: "Hi! I'm your coach. How our session goes depends on you. Don't be afraid of mistakes — I'm here to help! 💪" },
  "chat.coachPersonality": { ru: "Ваш коуч", en: "Your Coach" },
  "chat.coachFriendly": { ru: "Дружелюбный", en: "Friendly" },
  "chat.coachStrict": { ru: "Строгий", en: "Strict" },
  "chat.coachCalm": { ru: "Спокойный", en: "Calm" },

  // Listening
  "listening.title": { ru: "Аудирование", en: "Listening Lab" },
  "listening.subtitle": { ru: "Слушайте, читайте субтитры и улучшайте понимание", en: "Listen, read subtitles, and improve comprehension" },
  "listening.hideTranslation": { ru: "Скрыть перевод", en: "Hide translation" },
  "listening.showTranslation": { ru: "Показать перевод", en: "Show translation" },

  // Settings
  "settings.title": { ru: "Настройки", en: "Settings" },
  "settings.subtitle": { ru: "Настройте обучение под себя", en: "Customize your learning experience" },
  "settings.profile": { ru: "Профиль", en: "Profile" },
  "settings.name": { ru: "Имя", en: "Name" },
  "settings.dailyGoal": { ru: "Дневная цель (минуты)", en: "Daily goal (minutes)" },
  "settings.language": { ru: "Язык", en: "Language" },
  "settings.nativeLang": { ru: "Родной язык", en: "Native language" },
  "settings.preferences": { ru: "Настройки", en: "Preferences" },
  "settings.reminders": { ru: "Ежедневные напоминания", en: "Daily reminders" },
  "settings.remindersDesc": { ru: "Получать уведомления для практики", en: "Get notified to practice" },
  "settings.sound": { ru: "Звуковые эффекты", en: "Sound effects" },
  "settings.soundDesc": { ru: "Воспроизводить звуки при действиях", en: "Play sounds on actions" },
  "settings.darkMode": { ru: "Тёмная тема", en: "Dark mode" },
  "settings.darkModeDesc": { ru: "Использовать тёмную тему", en: "Use dark theme" },
  "settings.email": { ru: "Email", en: "Email" },
  "settings.security": { ru: "Безопасность и конфиденциальность", en: "Security & Privacy" },
  "settings.changePassword": { ru: "Сменить пароль", en: "Change password" },
  "settings.changePasswordDesc": { ru: "Обновите пароль для защиты аккаунта", en: "Update your password to keep your account secure" },
  "settings.currentPassword": { ru: "Текущий пароль", en: "Current password" },
  "settings.newPassword": { ru: "Новый пароль", en: "New password" },
  "settings.confirmPassword": { ru: "Подтвердите пароль", en: "Confirm password" },
  "settings.savePassword": { ru: "Сохранить пароль", en: "Save password" },
  "settings.error": { ru: "Ошибка", en: "Error" },
  "settings.enterCurrentPassword": { ru: "Введите текущий пароль", en: "Enter your current password" },
  "settings.passwordMinLength": { ru: "Пароль должен быть не менее 8 символов", en: "Password must be at least 8 characters" },
  "settings.passwordMismatch": { ru: "Пароли не совпадают", en: "Passwords do not match" },
  "settings.passwordChanged": { ru: "Пароль успешно изменён", en: "Password changed successfully" },
  "settings.logoutAll": { ru: "Выйти со всех устройств", en: "Log out of all devices" },
  "settings.logoutAllDesc": { ru: "Завершить все активные сессии", en: "End all active sessions" },
  "settings.logoutAllConfirmTitle": { ru: "Выйти со всех устройств?", en: "Log out of all devices?" },
  "settings.logoutAllConfirmDesc": { ru: "Все активные сессии будут завершены. Вам придётся войти заново.", en: "All active sessions will be terminated. You'll need to log in again." },
  "settings.loggedOutAll": { ru: "Вы вышли со всех устройств", en: "Logged out of all devices" },
  "settings.exportData": { ru: "Экспорт данных", en: "Export data" },
  "settings.exportDataDesc": { ru: "Скачать все ваши данные в формате JSON", en: "Download all your data as JSON" },
  "settings.dataExported": { ru: "Данные подготовлены к скачиванию", en: "Data ready for download" },
  "settings.dangerZone": { ru: "Опасная зона", en: "Danger Zone" },
  "settings.logout": { ru: "Выйти из аккаунта", en: "Log out" },
  "settings.logoutDesc": { ru: "Выйти из текущей сессии", en: "Sign out of your current session" },
  "settings.logoutConfirmTitle": { ru: "Выйти из аккаунта?", en: "Log out?" },
  "settings.logoutConfirmDesc": { ru: "Вы уверены, что хотите выйти?", en: "Are you sure you want to log out?" },
  "settings.loggedOut": { ru: "Вы вышли из аккаунта", en: "You have been logged out" },
  "settings.deleteAccount": { ru: "Удалить аккаунт", en: "Delete account" },
  "settings.deleteAccountDesc": { ru: "Навсегда удалить аккаунт и все данные", en: "Permanently delete your account and all data" },
  "settings.deleteConfirmTitle": { ru: "Удалить аккаунт навсегда?", en: "Delete account permanently?" },
  "settings.deleteConfirmDesc": { ru: "Это действие необратимо. Все ваши данные, прогресс и настройки будут удалены безвозвратно.", en: "This action cannot be undone. All your data, progress, and settings will be permanently deleted." },
  "settings.deleteForever": { ru: "Удалить навсегда", en: "Delete forever" },
  "settings.accountDeleted": { ru: "Аккаунт удалён", en: "Account deleted" },
  "settings.cancel": { ru: "Отмена", en: "Cancel" },
  "settings.confirm": { ru: "Подтвердить", en: "Confirm" },

  // Grammar
  "grammar.title": { ru: "Грамматика", en: "Grammar Quest" },
  "grammar.subtitle": { ru: "Проверьте свои знания грамматики", en: "Test your grammar knowledge" },
  "grammar.next": { ru: "Далее", en: "Next" },
  "grammar.finish": { ru: "Завершить", en: "Finish" },
  "grammar.complete": { ru: "Квест завершён!", en: "Quest Complete!" },
  "grammar.score": { ru: "Ваш результат", en: "You scored" },
  "grammar.tryAgain": { ru: "Попробовать снова", en: "Try Again" },

  // Pronunciation
  "pronunciation.title": { ru: "Произношение", en: "Pronunciation" },
  "pronunciation.subtitle": { ru: "Слушайте, повторяйте и совершенствуйте акцент", en: "Listen, repeat, and perfect your accent" },
  "pronunciation.listening": { ru: "Слушаю...", en: "Listening..." },
  "pronunciation.attempts": { ru: "попыток записано", en: "attempt(s) recorded" },

  // Writing
  "writing.title": { ru: "Письменный наставник", en: "Writing Mentor" },
  "writing.subtitle": { ru: "Практикуйте письмо с обратной связью от ИИ", en: "Practice writing with AI-powered feedback" },
  "writing.placeholder": { ru: "Начните писать здесь...", en: "Start writing here..." },
  "writing.words": { ru: "слов", en: "words" },
  "writing.getFeedback": { ru: "Получить отзыв", en: "Get Feedback" },
  "writing.aiFeedback": { ru: "Отзыв ИИ", en: "AI Feedback" },

  // Not found
  "notFound.title": { ru: "Страница не найдена", en: "Oops! Page not found" },
  "notFound.back": { ru: "Вернуться на главную", en: "Return to Home" },

  // Skill Map
  "skills.title": { ru: "Карта навыков", en: "Skill Map" },
  "skills.subtitle": { ru: "Отслеживайте прогресс по каждому навыку", en: "Track your progress across every skill" },
  "skills.overallLevel": { ru: "Общий уровень CEFR", en: "Overall CEFR Level" },
  "skills.avgLevel": { ru: "Средний уровень", en: "Avg level" },
  "skills.yourSkills": { ru: "Ваши навыки", en: "Your Skills" },
  "skills.vocabulary": { ru: "Словарный запас", en: "Vocabulary" },
  "skills.grammar": { ru: "Грамматика", en: "Grammar" },
  "skills.fluency": { ru: "Беглость речи", en: "Fluency" },
  "skills.listening": { ru: "Аудирование", en: "Listening" },
  "skills.pronunciation": { ru: "Произношение", en: "Pronunciation" },
  "skills.writing": { ru: "Письмо", en: "Writing" },
  "skills.lvl": { ru: "Ур.", en: "Lvl" },
  "skills.easiestGoal": { ru: "⚡ Ближайшая цель", en: "⚡ Easiest goal" },
  "skills.tipTitle": { ru: "Совет дня", en: "Tip of the day" },
  "skills.tipDesc": { ru: "Сфокусируйтесь на навыке с отметкой «Ближайшая цель» — он ближе всего к повышению уровня. Маленькие победы мотивируют продолжать!", en: "Focus on the skill marked 'Easiest goal' — it's closest to leveling up. Small wins keep you motivated!" },

  // Mood / Energy
  "mood.title": { ru: "Как вы себя чувствуете?", en: "How are you feeling?" },
  "mood.subtitle": { ru: "Мы подстроим сложность под ваше состояние", en: "We'll adapt difficulty to your current state" },
  "mood.peak": { ru: "На пике! 🔥", en: "Peak energy! 🔥" },
  "mood.normal": { ru: "Нормально 😊", en: "Feeling good 😊" },
  "mood.tired": { ru: "Устал 😴", en: "A bit tired 😴" },
  "mood.exhausted": { ru: "Без сил 🥱", en: "Exhausted 🥱" },
  "mood.recommendation.peak": { ru: "Отлично! Время для сложных заданий — грамматика или дебаты.", en: "Great! Time for challenging tasks — grammar quests or debates." },
  "mood.recommendation.normal": { ru: "Хороший настрой! Попробуйте свободный диалог или новые слова.", en: "Good mood! Try a free conversation or learn new words." },
  "mood.recommendation.tired": { ru: "Не перегружайтесь. Лёгкие карточки со словами или короткое видео.", en: "Take it easy. Light vocab cards or a short video." },
  "mood.recommendation.exhausted": { ru: "Отдохните! Послушайте лёгкое аудио или повторите знакомые слова.", en: "Rest up! Listen to easy audio or review familiar words." },
} as const;

type TranslationKey = keyof typeof t;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  tr: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ru",
  setLang: () => {},
  tr: (key) => t[key]?.ru || key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("lingua-lang");
    return (saved === "en" || saved === "ru") ? saved : "ru";
  });

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("lingua-lang", newLang);
  };

  const tr = (key: TranslationKey) => t[key]?.[lang] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, tr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
