import { Smile, Shield, Heart, Laugh, Clock, Zap, Briefcase, Coffee, CircleDot, Pencil, type LucideIcon } from "lucide-react";

export type CoachType =
  | "friendly"
  | "strict"
  | "calm"
  | "humorous"
  | "patient"
  | "motivating"
  | "professional"
  | "casual"
  | "neutral"
  | "custom";

export const COACH_ICONS: Record<CoachType, LucideIcon> = {
  friendly: Smile,
  strict: Shield,
  calm: Heart,
  humorous: Laugh,
  patient: Clock,
  motivating: Zap,
  professional: Briefcase,
  casual: Coffee,
  neutral: CircleDot,
  custom: Pencil,
};
