import { APP_NAME, APP_TAGLINE } from "@/lib/academics";
import logoImg from "@/assets/logo.png";

interface FooterProps {
  onPageChange: (page: string) => void;
}

export default function Footer({ onPageChange }: FooterProps) {
  return (
    <footer className="mt-12 border-t border-border bg-card/60 backdrop-blur-xl">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 p-1.5">
                <img src={logoImg} alt={APP_NAME} className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{APP_NAME}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {APP_TAGLINE}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
              Built to stay useful through the remaining semesters with a calm light theme,
              semester-wise notes, an exam centre, and project planning spaces for both students
              and admins.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Explore
            </h4>
            <div className="mt-4 space-y-3">
              {[
                { label: "Dashboard", page: "dashboard" },
                { label: "Exam Centre", page: "exam" },
                { label: "Projects", page: "projects" },
                { label: "Planner", page: "planner" },
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => onPageChange(item.page)}
                  className="block text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Utility
            </h4>
            <div className="mt-4 space-y-3">
              {[
                { label: "Ask admin", page: "enquiry" },
                { label: "AI guide", page: "ai" },
                { label: "Admin panel", page: "admin" },
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => onPageChange(item.page)}
                  className="block text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. Semester support through the finish line.
          </p>
          <p className="text-xs text-muted-foreground">
            Theme: light matte sage green and soft grey
          </p>
        </div>
      </div>
    </footer>
  );
}
