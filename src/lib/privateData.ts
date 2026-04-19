import type { PersonalTask, ProjectPlan } from "@/lib/store";

const TASKS_KEY = "bloody_hell_tasks_";
const PROJECTS_KEY = "bloody_hell_projects_";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getStored<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function setStored<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- PERSONAL TASKS ---

export async function fetchPersonalTasks(userId: string): Promise<PersonalTask[]> {
  await delay(200);
  return getStored<PersonalTask>(TASKS_KEY + userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createPersonalTask(userId: string, text: string): Promise<void> {
  await delay(100);
  const tasks = getStored<PersonalTask>(TASKS_KEY + userId);
  tasks.push({
    id: crypto.randomUUID(),
    userId,
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  });
  setStored(TASKS_KEY + userId, tasks);
}

export async function togglePersonalTask(taskId: string, completed: boolean): Promise<void> {
  // Since we don't pass userId here easily, we'd have to search all keys realistically, 
  // but it's simpler if the app passes the current user so let's just find the key that has this task.
  await delay(50);
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(TASKS_KEY)) {
      const tasks = getStored<PersonalTask>(key);
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks[index].completed = completed;
        setStored(key, tasks);
        return;
      }
    }
  }
}

export async function deletePersonalTask(taskId: string): Promise<void> {
  await delay(50);
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(TASKS_KEY)) {
      const tasks = getStored<PersonalTask>(key);
      const newTasks = tasks.filter(t => t.id !== taskId);
      if (newTasks.length !== tasks.length) {
        setStored(key, newTasks);
        return;
      }
    }
  }
}

// --- PROJECT PLANS ---

export async function fetchProjectPlans(userId: string): Promise<ProjectPlan[]> {
  await delay(200);
  return getStored<ProjectPlan>(PROJECTS_KEY + userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createProjectPlan(
  project: Omit<ProjectPlan, "id" | "createdAt">,
): Promise<void> {
  await delay(100);
  const plans = getStored<ProjectPlan>(PROJECTS_KEY + project.userId);
  plans.push({
    ...project,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  setStored(PROJECTS_KEY + project.userId, plans);
}

export async function deleteProjectPlan(projectId: string): Promise<void> {
  await delay(50);
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PROJECTS_KEY)) {
      const plans = getStored<ProjectPlan>(key);
      const newPlans = plans.filter(p => p.id !== projectId);
      if (newPlans.length !== plans.length) {
        setStored(key, newPlans);
        return;
      }
    }
  }
}
