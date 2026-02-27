import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import RequireAuth from "./components/RequireAuth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import SetupPage from "./pages/SetupPage";
import ChatPage from "./pages/ChatPage";
import VocabularyPage from "./pages/VocabularyPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { RedirectToChat } from "./components/RedirectToChat";
import { GoogleOAuthWrapper } from "./components/auth/GoogleOAuthWrapper";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
                <Route path="/" element={<HomePage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/setup" element={<SetupPage />} />
                <Route path="/vocabulary" element={<VocabularyPage />} />
                <Route path="/audio" element={<ChatPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="/vocabulary-chat" element={<RedirectToChat />} />
              <Route path="/login" element={<GoogleOAuthWrapper><LoginPage /></GoogleOAuthWrapper>} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
