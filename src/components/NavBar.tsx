import { useState } from "react";
import {
  BookOpenCheck,
  Bot,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Shield,
  SquarePen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME, APP_TAGLINE } from "@/lib/academics";
import logoImg from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";

interface NavBarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "exam", label: "Exam Centre", icon: BookOpenCheck },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "planner", label: "Planner", icon: SquarePen },
  { id: "notes", label: "Notes", icon: GraduationCap },
  { id: "ai", label: "Jiraiya Sensei", icon: Bot },
  { id: "enquiry", label: "Enquiry", icon: MessageCircle },
  { id: "admin", label: "Admin", icon: Shield },
];

export default function NavBar({ currentPage, onPageChange }: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <>
      <nav className="fixed left-0 top-0 z-50 hidden w-full items-center justify-between border-b border-border bg-background/85 px-4 py-3 shadow-none backdrop-blur-xl md:flex md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 p-1">
            <img src={logoImg} alt={APP_NAME} className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">{APP_NAME}</h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {APP_TAGLINE}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "flex items-center gap-2 rounded-[1rem] px-4 py-2 text-sm font-medium transition-all duration-200",
                currentPage === item.id
                  ? "bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(114,138,120,0.22)]"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
          {user ? (
            <button
              onClick={() => void signOut()}
              className="rounded-[1rem] px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              title={user.user_metadata.display_name || "Signed in"}
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={() => onPageChange("projects")}
              className="rounded-[1rem] px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      <button
        onClick={() => setMobileOpen((open) => !open)}
        className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card/92 text-foreground shadow-[0_18px_50px_rgba(84,93,86,0.14)] backdrop-blur-xl md:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fade-in">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-4 top-16 min-w-[240px] rounded-[1.5rem] border border-border bg-card p-2 shadow-[0_24px_60px_rgba(84,93,86,0.18)] animate-slide-in-right">
            <div className="px-4 py-3 text-sm font-semibold text-foreground">{APP_NAME}</div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setMobileOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[1rem] px-4 py-3 text-sm font-medium transition-all",
                  currentPage === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
            {user ? (
              <button
                onClick={() => {
                  void signOut();
                  setMobileOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-[1rem] px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => {
                  onPageChange("projects");
                  setMobileOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-[1rem] px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
