import { useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, MessageCircle, BarChart3, User } from "lucide-react";

const tabs = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BookOpen, label: "Library", path: "/vocabulary" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: BarChart3, label: "Stats", path: "/stats" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 px-3 py-2 transition-colors"
            >
              <tab.icon
                size={22}
                strokeWidth={1.5}
                className={isActive ? "text-primary" : "text-muted-foreground"}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "gradient-text" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
