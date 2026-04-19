import ExamCentrePanel from "@/components/ExamCentrePanel";
import frankyImg from "@/assets/franky.png";
import { ArrowRight } from "lucide-react";

interface ExamCentrePageProps {
  onPageChange?: (page: string) => void;
}

export default function ExamCentrePage({ onPageChange }: ExamCentrePageProps) {
  return (
    <div className="min-h-screen pb-24">
      <div className="container pt-20 space-y-6 animate-fade-in-up">
        <section
          className="hero-panel relative overflow-hidden rounded-[2rem] p-7 md:p-9"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(244, 248, 242, 0.95), rgba(231, 238, 231, 0.92)), url(${frankyImg})`,
          }}
        >
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Next Stop: Projects Planner
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Organize your academic goals visually.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
              Plan your individual projects securely and effectively. Tie tasks right into your private workspace to avoid distractions.
            </p>
            {onPageChange && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => onPageChange("projects")} className="btn-primary inline-flex items-center gap-2 px-5">
                  Go to Projects
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="surface p-6 md:p-7">
          <ExamCentrePanel />
        </section>
      </div>
    </div>
  );
}
