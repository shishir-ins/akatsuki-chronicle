import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, FolderKanban, LockKeyhole, Trash2 } from "lucide-react";
import { toast } from "sonner";
import frankyImg from "@/assets/franky.png";
import AuthPanel from "@/components/AuthPanel";
import { useAuth } from "@/hooks/useAuth";
import { getAllSubjects } from "@/lib/academics";
import {
  createProjectPlan,
  deleteProjectPlan,
  fetchProjectPlans,
} from "@/lib/privateData";
import { type ProjectPlan } from "@/lib/store";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: Array<ProjectPlan["status"]> = [
  "idea",
  "in-progress",
  "review",
  "submitted",
];

const STATUS_LABELS: Record<ProjectPlan["status"], string> = {
  idea: "Idea",
  "in-progress": "In progress",
  review: "Review",
  submitted: "Submitted",
};

export default function ProjectsPage() {
  const { user, loading } = useAuth();
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [status, setStatus] = useState<ProjectPlan["status"]>("idea");
  const [projects, setProjects] = useState<ProjectPlan[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setProjects([]);
      return;
    }

    try {
      setProjects(await fetchProjectPlans(user.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load project plans");
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const subjects = useMemo(
    () => getAllSubjects(projects.map((project) => project.subject)),
    [projects],
  );

  if (loading) {
    return <div className="min-h-screen pb-24" />;
  }

  if (!user) {
    return (
      <div className="min-h-screen pb-24">
        <div className="container pt-20 animate-fade-in-up">
          <AuthPanel
            title="Sign in for your private projects space"
            description="Projects are now stored against your student account so only you can see your planner entries across devices."
          />
        </div>
      </div>
    );
  }

  const addProject = async () => {
    if (!subject.trim() || !title.trim() || !details.trim() || !submissionDate) {
      toast.error("Fill in all project details");
      return;
    }

    try {
      await createProjectPlan({
        userId: user.id,
        subject: subject.trim(),
        title: title.trim(),
        details: details.trim(),
        submissionDate,
        status,
      });

      setSubject("");
      setTitle("");
      setDetails("");
      setSubmissionDate("");
      setStatus("idea");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save project");
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="container pt-20 space-y-6 animate-fade-in-up">
        <section
          className="hero-panel relative overflow-hidden rounded-[2rem] p-7 md:p-9"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(244, 248, 242, 0.96), rgba(230, 238, 232, 0.94)), url(${frankyImg})`,
          }}
        >
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <LockKeyhole className="h-4 w-4" />
              Private student planner
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Plan projects privately before the admin submission sheet catches up.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
              Your projects are now tied to your signed-in student account, not only this browser.
            </p>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.2fr]">
          <section className="surface p-6 md:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Add project</h2>
                <p className="text-sm text-muted-foreground">
                  Create a personal entry for your own planning.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <input
                placeholder="Subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                list="project-subjects"
                className="input-soft"
              />
              <datalist id="project-subjects">
                {subjects.map((subjectOption) => (
                  <option key={subjectOption} value={subjectOption} />
                ))}
              </datalist>

              <input
                placeholder="Project title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="input-soft"
              />

              <textarea
                placeholder="Project details, milestones, materials, reminders..."
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={5}
                className="input-soft resize-none"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="date"
                  value={submissionDate}
                  onChange={(event) => setSubmissionDate(event.target.value)}
                  className="input-soft"
                />
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ProjectPlan["status"])}
                  className="input-soft"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {STATUS_LABELS[option]}
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={() => void addProject()} className="btn-primary w-full">
                Save project to private planner
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <div className="surface p-6 md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">My project planner</h2>
                  <p className="text-sm text-muted-foreground">
                    {projects.length} saved project{projects.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  Visible only to {user.email}
                </div>
              </div>
            </div>

            <div className="space-y-3 stagger-children">
              {projects.map((project) => (
                <article key={project.id} className="surface-interactive rounded-[1.5rem] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                        {project.subject}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-foreground">{project.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          project.status === "submitted" && "bg-emerald-100 text-emerald-700",
                          project.status === "review" && "bg-amber-100 text-amber-700",
                          project.status === "in-progress" && "bg-primary/10 text-primary",
                          project.status === "idea" && "bg-secondary text-muted-foreground",
                        )}
                      >
                        {STATUS_LABELS[project.status]}
                      </span>
                      <button
                        onClick={async () => {
                          try {
                            await deleteProjectPlan(project.id);
                            await refresh();
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Unable to delete project");
                          }
                        }}
                        className="rounded-xl border border-border bg-card p-2 text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive"
                        aria-label={`Delete ${project.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                    {project.details}
                  </p>

                  <div className="mt-4 text-xs text-muted-foreground">
                    Submission date: {new Date(project.submissionDate).toLocaleDateString()}
                  </div>
                </article>
              ))}

              {projects.length === 0 && (
                <div className="surface p-8 text-center text-sm text-muted-foreground">
                  No private projects yet. Add your first project plan on the left.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
