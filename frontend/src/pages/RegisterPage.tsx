import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Zap, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.register(email, password, fullName || undefined);
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      setError((err as Error).message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Seamless adaptive background */}
      <div className="bg-decoration">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
        <div className="bg-blob bg-blob-4" />
        <div className="bg-blob bg-blob-5" />
        <div className="bg-particle bg-particle--sm" style={{ top: "20%", left: "25%", animationDelay: "0s" }} />
        <div className="bg-particle bg-particle--md" style={{ top: "50%", right: "18%", animationDelay: "1.2s" }} />
        <div className="bg-particle bg-particle--lg" style={{ bottom: "20%", left: "38%", animationDelay: "2s" }} />
        <div className="bg-particle bg-particle--sm" style={{ bottom: "40%", right: "28%", animationDelay: "3s" }} />
        <span className="floating-letter" style={{ top: "10%", right: "12%", fontSize: "clamp(2rem, 4vw, 3.5rem)", animation: "float-letter 9s ease-in-out infinite" }}>A</span>
        <span className="floating-letter" style={{ bottom: "15%", left: "8%", fontSize: "clamp(1.6rem, 3vw, 2.5rem)", animation: "float-letter-reverse 10s ease-in-out 1s infinite" }}>B</span>
        <span className="floating-letter" style={{ top: "38%", left: "6%", fontSize: "clamp(1rem, 2vw, 1.6rem)", animation: "float-letter 8s ease-in-out 2s infinite" }}>◇</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 md:p-10 space-y-7">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-blue">
              <Zap size={24} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold font-heading gradient-text">LinguaAI</h1>
            <p className="text-sm text-muted-foreground">Создайте аккаунт</p>
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
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Имя (необязательно)</label>
              <Input
                type="text"
                placeholder="Ваше имя"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-2xl bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10 focus:border-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Пароль</label>
              <Input
                type="password"
                placeholder="Минимум 8 символов"
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
              <UserPlus size={16} />
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3 text-muted-foreground" style={{ background: "var(--glass-bg)" }}>или</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Уже есть аккаунт?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-primary font-medium hover:underline transition-colors"
            >
              Вход
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
