import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ModeCardProps {
  emoji: string;
  title: string;
  description: string;
  to: string;
}

const ModeCard = ({ emoji, title, description, to }: ModeCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(to)}
      className="card-hover cursor-pointer flex items-center gap-4 p-5 shadow-card border-0 bg-card"
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{description}</p>
      </div>
      <ChevronRight size={20} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
    </Card>
  );
};

export default ModeCard;
