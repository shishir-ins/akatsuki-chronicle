import { HelpCircle } from "lucide-react";
import jiraiyaImg from "@/assets/jiraiya.png";
import { AppPage } from "@/pages/Index";

interface FloatingActionButtonsProps {
  onPageChange: (page: string) => void;
  currentPage: AppPage;
}

export default function FloatingActionButtons({ onPageChange, currentPage }: FloatingActionButtonsProps) {
  // If we are already on AI page, maybe we shouldn't show the AI floater?
  // Let's hide the floaters conditionally, or maybe just show them everywhere for ease of access.

  return (
    <div className="fixed bottom-6 sm:bottom-10 right-4 sm:right-8 z-50 flex flex-col gap-4 animate-fade-in-up items-center">
      {currentPage !== "enquiry" && (
        <button
          onClick={() => onPageChange("enquiry")}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-foreground/90 text-background shadow-lg hover:bg-foreground hover:scale-110 transition-all border-2 border-background/20 backdrop-blur-sm"
          title="Enquiry / Support"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      )}

      {currentPage !== "ai" && (
        <button
          onClick={() => onPageChange("ai")}
          className="relative group flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:scale-110 transition-all border-4 border-foreground overflow-hidden animate-bounce-soft"
          title="Jiraiya Sensei (AI Guide)"
        >
          <img
            src={jiraiyaImg}
            alt="Jiraiya Sensei"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Subtle glow inside the button */}
          <div className="absolute inset-0 bg-red-600/10 mix-blend-overlay group-hover:bg-red-500/30 transition-colors pointer-events-none" />
          
          <div className="absolute -inset-1 rounded-full animate-ping bg-red-500 opacity-20 pointer-events-none" />
        </button>
      )}
    </div>
  );
}
