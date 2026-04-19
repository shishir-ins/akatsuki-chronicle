import { useMemo } from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface DeadlineCardProps {
  title: string;
  dueDate: string;
}

export default function DeadlineCard({ title, dueDate }: DeadlineCardProps) {
  const { label, urgent, expired } = useMemo(() => {
    const diff = new Date(dueDate).getTime() - Date.now();
    if (diff <= 0) return { label: "Expired", urgent: false, expired: true };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    const isUrgent = hours <= 24;
    const text = days > 0 ? `${days}d ${remainingHours}h left` : `${hours}h ${minutes}m left`;
    return { label: text, urgent: isUrgent, expired: false };
  }, [dueDate]);

  return (
    <div className={`surface p-4 transition-all duration-300 ${urgent ? "border-primary/40 glow-accent" : ""} ${expired ? "opacity-40" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">Due: {new Date(dueDate).toLocaleDateString()}</p>
        </div>
        <div className={`flex items-center gap-1.5 shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-lg ${
          expired ? "bg-muted text-muted-foreground" : urgent ? "bg-primary/15 text-primary border border-primary/20" : "bg-secondary text-secondary-foreground"
        }`}>
          {expired ? <CheckCircle className="w-3 h-3" /> : urgent ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {label}
        </div>
      </div>
    </div>
  );
}
