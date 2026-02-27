import { Smile, Shield, Heart, Laugh, Clock, Zap, Briefcase, Coffee, type LucideIcon } from "lucide-react";

export type CoachType =
  | "friendly"
  | "strict"
  | "calm"
  | "humorous"
  | "patient"
  | "motivating"
  | "professional"
  | "casual";

export const COACH_ICONS: Record<CoachType, LucideIcon> = {
  friendly: Smile,
  strict: Shield,
  calm: Heart,
  humorous: Laugh,
  patient: Clock,
  motivating: Zap,
  professional: Briefcase,
  casual: Coffee,
};
