import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import SetupPage from "./pages/SetupPage";
import ChatPage from "./pages/ChatPage";
import VocabularyPage from "./pages/VocabularyPage";
import VocabularyChatPage from "./pages/VocabularyChatPage";
import ListeningPage from "./pages/ListeningPage";
import SettingsPage from "./pages/SettingsPage";
import GrammarQuestPage from "./pages/GrammarQuestPage";
import PronunciationPage from "./pages/PronunciationPage";
import WritingMentorPage from "./pages/WritingMentorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
            <Route path="/listening" element={<ListeningPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/grammar" element={<GrammarQuestPage />} />
            <Route path="/pronunciation" element={<PronunciationPage />} />
            <Route path="/writing" element={<WritingMentorPage />} />
          </Route>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/vocabulary-chat" element={<VocabularyChatPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
