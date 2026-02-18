import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const SubscriptionPage = () => {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      id: "free",
      icon: Zap,
      name: tr("sub.freeName"),
      price: { monthly: "$0", yearly: "$0" },
      period: tr("sub.forever"),
      desc: tr("sub.freeDesc"),
      features: [
        tr("sub.freeFeat1"),
        tr("sub.freeFeat2"),
        tr("sub.freeFeat3"),
        tr("sub.freeFeat4"),
      ],
      cta: tr("sub.currentPlan"),
      current: true,
      accent: false,
    },
    {
      id: "pro",
      icon: Sparkles,
      name: tr("sub.proName"),
      price: { monthly: "$9", yearly: "$79" },
      period: billing === "monthly" ? tr("sub.perMonth") : tr("sub.perYear"),
      desc: tr("sub.proDesc"),
      badge: tr("sub.popular"),
      features: [
        tr("sub.proFeat1"),
        tr("sub.proFeat2"),
        tr("sub.proFeat3"),
        tr("sub.proFeat4"),
        tr("sub.proFeat5"),
      ],
      cta: tr("sub.upgrade"),
      current: false,
      accent: true,
    },
    {
      id: "premium",
      icon: Crown,
      name: tr("sub.premiumName"),
      price: { monthly: "$19", yearly: "$149" },
      period: billing === "monthly" ? tr("sub.perMonth") : tr("sub.perYear"),
      desc: tr("sub.premiumDesc"),
      features: [
        tr("sub.premiumFeat1"),
        tr("sub.premiumFeat2"),
        tr("sub.premiumFeat3"),
        tr("sub.premiumFeat4"),
        tr("sub.premiumFeat5"),
        tr("sub.premiumFeat6"),
      ],
      cta: tr("sub.upgrade"),
      current: false,
      accent: false,
    },
  ];

  const handleSubscribe = (planId: string) => {
    toast({ title: "🎉", description: `${tr("sub.subscribed")} ${planId.toUpperCase()}` });
  };

  return (
    <motion.div
      className="p-5 md:p-8 lg:p-12 max-w-5xl mx-auto space-y-8 pb-32"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="space-y-4">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          {tr("sub.backToSettings")}
        </button>
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading tracking-tight">
            {tr("sub.title")}
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {tr("sub.subtitle")}
          </p>
        </div>
      </motion.div>

      {/* Billing Toggle */}
      <motion.div variants={item} className="flex justify-center">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              billing === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tr("sub.monthly")}
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              billing === "yearly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tr("sub.yearly")}
            <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
              -30%
            </Badge>
          </button>
        </div>
      </motion.div>

      {/* Plans */}
      <motion.div variants={item} className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative p-6 rounded-2xl flex flex-col transition-all ${
              plan.accent
                ? "border-primary/40 bg-primary/[0.03] shadow-md ring-1 ring-primary/20"
                : "bg-card shadow-sm"
            }`}
          >
            {plan.badge && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-3">
                {plan.badge}
              </Badge>
            )}

            <div className="flex items-center gap-2.5 mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  plan.accent ? "bg-primary/10" : "bg-muted"
                }`}
              >
                <plan.icon
                  size={18}
                  className={plan.accent ? "text-primary" : "text-muted-foreground"}
                />
              </div>
              <h3 className="font-bold text-foreground">{plan.name}</h3>
            </div>

            <div className="mb-1">
              <span className="text-3xl font-extrabold text-foreground">
                {plan.price[billing]}
              </span>
              <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-5">{plan.desc}</p>

            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <Check
                    size={15}
                    className={`mt-0.5 shrink-0 ${
                      plan.accent ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  {feat}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => !plan.current && handleSubscribe(plan.id)}
              variant={plan.current ? "outline" : plan.accent ? "default" : "secondary"}
              className="w-full rounded-xl"
              disabled={plan.current}
            >
              {plan.cta}
            </Button>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default SubscriptionPage;
