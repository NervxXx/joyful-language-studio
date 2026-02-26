import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-6 rounded-2xl">
        <h1 className="text-xl font-bold mb-4">Регистрация</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
          />
          <Input
            type="text"
            placeholder="Имя (необязательно)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-12"
          />
          <Input
            type="password"
            placeholder="Пароль (минимум 8 символов, заглавная, строчная, цифра)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground text-center">
          Уже есть аккаунт?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-primary hover:underline"
          >
            Вход
          </button>
        </p>
      </Card>
    </div>
  );
}
