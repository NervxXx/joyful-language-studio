import { useEnergy, type EnergyState } from "@/contexts/EnergyContext";
import { Battery, BatteryFull, BatteryLow, BatteryMedium } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";

const config: Record<EnergyState, { icon: typeof Battery; color: string; bg: string }> = {
  peak: { icon: BatteryFull, color: "text-success", bg: "bg-success/10" },
  normal: { icon: BatteryMedium, color: "text-primary", bg: "bg-primary/10" },
  tired: { icon: BatteryLow, color: "text-warning", bg: "bg-warning/10" },
  exhausted: { icon: Battery, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function EnergyIndicator({ onClick }: { onClick?: () => void }) {
  const { energy, moodChecked } = useEnergy();
  const { tr } = useLanguage();
  const c = config[energy];

  if (!moodChecked) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={onClick} className={`p-2 rounded-xl ${c.bg} transition-colors`}>
          <c.icon size={18} strokeWidth={1.6} className={c.color} />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{tr(`mood.${energy}` as any)}</p>
      </TooltipContent>
    </Tooltip>
  );
}
