import { useCallback, useEffect, useState } from "react";
import { Check, Plus, SquarePen, Target, Trash2 } from "lucide-react";
import AuthPanel from "@/components/AuthPanel";
import { useAuth } from "@/hooks/useAuth";
import {
  createPersonalTask,
  deletePersonalTask,
  fetchPersonalTasks,
  togglePersonalTask,
} from "@/lib/privateData";
import { type PersonalTask } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PlannerPage() {
  const { user, loading } = useAuth();
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<PersonalTask[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setTasks([]);
      return;
    }

    try {
      setTasks(await fetchPersonalTasks(user.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load planner tasks");
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading) {
    return <div className="min-h-screen pb-24" />;
  }

  if (!user) {
    return (
      <div className="min-h-screen pb-24">
        <div className="container mx-auto max-w-3xl pt-20 animate-fade-in-up">
          <AuthPanel
            title="Sign in for your private planner"
            description="Planner tasks are now tied to your student account so they stay private to you across sessions."
          />
        </div>
      </div>
    );
  }

  const addTask = async () => {
    if (!task.trim()) {
      return;
    }

    try {
      await createPersonalTask(user.id, task.trim());
      setTask("");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add task");
    }
  };

  const completedCount = tasks.filter((currentTask) => currentTask.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto max-w-3xl pt-20 animate-fade-in-up">
        <div className="surface p-7 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <SquarePen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Personal planner</h1>
              <p className="text-sm text-muted-foreground">
                A quiet checklist space for your own day-to-day planning.
              </p>
            </div>
          </div>

          {tasks.length > 0 && (
            <div className="mt-6 rounded-[1.5rem] border border-border bg-secondary/70 p-5">
              <div className="mb-3 flex justify-between text-sm text-muted-foreground">
                <span>
                  {completedCount} of {tasks.length} complete
                </span>
                <span className="font-semibold text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-2 rounded-[1.5rem] border border-border bg-card p-2">
            <input
              placeholder="Add a private planner task..."
              value={task}
              onChange={(event) => setTask(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && void addTask()}
              className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button onClick={() => void addTask()} className="btn-primary flex items-center gap-2 px-4">
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          <div className="mt-6 space-y-3 stagger-children">
            {tasks.map((currentTask) => (
              <div
                key={currentTask.id}
                className={cn(
                  "surface-interactive flex items-center gap-3 rounded-[1.25rem] p-4",
                  currentTask.completed && "opacity-60",
                )}
              >
                <button
                  onClick={async () => {
                    try {
                      await togglePersonalTask(currentTask.id, !currentTask.completed);
                      await refresh();
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Unable to update task");
                    }
                  }}
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all",
                    currentTask.completed
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/35 hover:border-primary",
                  )}
                >
                  {currentTask.completed && <Check className="h-3 w-3" />}
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm text-foreground",
                    currentTask.completed && "line-through text-muted-foreground",
                  )}
                >
                  {currentTask.text}
                </span>
                <button
                  onClick={async () => {
                    try {
                      await deletePersonalTask(currentTask.id);
                      await refresh();
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Unable to delete task");
                    }
                  }}
                  className="rounded-xl border border-border bg-card p-2 text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="rounded-[1.5rem] border border-dashed border-border p-10 text-center">
                <Target className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No planner tasks yet. Add one above to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
