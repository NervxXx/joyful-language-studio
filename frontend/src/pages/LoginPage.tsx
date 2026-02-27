import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Zap, LogIn } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { hasGoogleAuth } from "@/components/auth/GoogleOAuthWrapper";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      setError((err as Error).message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string; clientId?: string }) => {
    if (!credentialResponse.credential) return;
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential, credentialResponse.clientId);
      navigate("/");
    } catch (err: unknown) {
      setError((err as Error).message || "Ошибка входа через Google");
    } finally {
      setLoading(false);
    }
  };

  const showGoogle = hasGoogleAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="bg-decoration">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
        <div className="bg-blob bg-blob-4" />
        <div className="bg-blob bg-blob-5" />
        <div className="bg-particle bg-particle--sm" style={{ top: "18%", left: "22%", animationDelay: "0s" }} />
        <div className="bg-particle bg-particle--md" style={{ top: "45%", right: "15%", animationDelay: "1.5s" }} />
        <div className="bg-particle bg-particle--lg" style={{ bottom: "22%", left: "40%", animationDelay: "0.5s" }} />
        <div className="bg-particle bg-particle--sm" style={{ top: "65%", right: "35%", animationDelay: "2s" }} />
        <div className="bg-particle bg-particle--md" style={{ bottom: "35%", left: "15%", animationDelay: "3s" }} />
        <span className="floating-letter" style={{ top: "12%", left: "8%", fontSize: "clamp(2rem, 4vw, 3.5rem)", animation: "float-letter 9s ease-in-out infinite" }}>A</span>
        <span className="floating-letter" style={{ top: "22%", right: "10%", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", animation: "float-letter-reverse 10s ease-in-out 1s infinite" }}>B</span>
        <span className="floating-letter" style={{ bottom: "18%", left: "12%", fontSize: "clamp(1.8rem, 3.5vw, 3rem)", animation: "float-letter 11s ease-in-out 2s infinite" }}>C</span>
        <span className="floating-letter" style={{ bottom: "28%", right: "8%", fontSize: "clamp(1rem, 2vw, 1.8rem)", animation: "float-letter-reverse 8s ease-in-out 0.5s infinite" }}>✦</span>
        <span className="floating-letter" style={{ top: "50%", left: "5%", fontSize: "clamp(0.8rem, 1.5vw, 1.3rem)", animation: "float-letter 7s ease-in-out 3s infinite" }}>◇</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 md:p-10 space-y-7">
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-blue">
              <Zap size={24} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold font-heading gradient-text">LinguaAI</h1>
            <p className="text-sm text-muted-foreground">Войдите в свой аккаунт</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-2xl bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10 focus:border-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Пароль</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-2xl bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10 focus:border-primary/50 transition-all"
              />
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5"
              >
                {error}
              </motion.p>
            )}
            <Button
              type="submit"
              className="w-full h-12 btn-gradient text-sm gap-2"
              disabled={loading}
            >
              <LogIn size={16} />
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>

          {showGoogle && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-3 text-muted-foreground" style={{ background: "var(--glass-bg, hsl(var(--background)))" }}>или</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Не удалось войти через Google")}
                  shape="pill"
                  theme="outline"
                  size="large"
                  width="100%"
                  text="signin_with"
                  locale="ru"
                />
              </div>
            </>
          )}

          {!showGoogle && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 text-muted-foreground" style={{ background: "var(--glass-bg, hsl(var(--background)))" }}>или</span>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center">
            Нет аккаунта?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-primary font-medium hover:underline transition-colors"
            >
              Регистрация
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
