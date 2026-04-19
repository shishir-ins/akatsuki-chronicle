import { supabase } from "@/integrations/supabase/client";
import type { PersonalTask, ProjectPlan } from "@/lib/store";

export async function fetchPersonalTasks(userId: string): Promise<PersonalTask[]> {
  const { data, error } = await supabase
    .from("personal_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((task) => ({
    id: task.id,
    text: task.text,
    userId: task.user_id,
    completed: task.completed,
    createdAt: task.created_at,
  }));
}

export async function createPersonalTask(userId: string, text: string): Promise<void> {
  const { error } = await supabase.from("personal_tasks").insert({
    user_id: userId,
    text,
  });

  if (error) {
    throw error;
  }
}

export async function togglePersonalTask(taskId: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from("personal_tasks")
    .update({ completed })
    .eq("id", taskId);

  if (error) {
    throw error;
  }
}

export async function deletePersonalTask(taskId: string): Promise<void> {
  const { error } = await supabase.from("personal_tasks").delete().eq("id", taskId);
  if (error) {
    throw error;
  }
}

export async function fetchProjectPlans(userId: string): Promise<ProjectPlan[]> {
  const { data, error } = await supabase
    .from("project_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((project) => ({
    id: project.id,
    userId: project.user_id,
    subject: project.subject,
    title: project.title,
    details: project.details,
    submissionDate: project.submission_date,
    status: project.status as ProjectPlan["status"],
    createdAt: project.created_at,
  }));
}

export async function createProjectPlan(
  project: Omit<ProjectPlan, "id" | "createdAt">,
): Promise<void> {
  const { error } = await supabase.from("project_plans").insert({
    user_id: project.userId,
    subject: project.subject,
    title: project.title,
    details: project.details,
    submission_date: project.submissionDate,
    status: project.status,
  });

  if (error) {
    throw error;
  }
}

export async function deleteProjectPlan(projectId: string): Promise<void> {
  const { error } = await supabase.from("project_plans").delete().eq("id", projectId);
  if (error) {
    throw error;
  }
}
