// LocalStorage-based data store

export interface Note {
  id: string;
  subject: string;
  title: string;
  periodId: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
}

export interface ExamResource {
  id: string;
  subject: string;
  title: string;
  resourceType: "important_questions" | "teacher_pdf";
  description?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

export interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  createdAt: string;
}

export interface Task {
  id: string;
  text: string;
  createdAt: string;
}

export interface PersonalTask {
  id: string;
  text: string;
  userId: string;
  completed: boolean;
  createdAt: string;
}

export interface ProjectPlan {
  id: string;
  userId: string;
  subject: string;
  title: string;
  details: string;
  submissionDate: string;
  status: "idea" | "in-progress" | "review" | "submitted";
  createdAt: string;
}

export interface ProjectRegistryEntry {
  id: string;
  subject: string;
  batchNumber: string;
  studentNames: string;
  rollNumbers: string;
  projectTitle: string;
  submissionDate: string;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  reply?: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getStore<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function sortNewest<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

function normalizeNote(raw: Partial<Note> & { unit?: string }): Note {
  return {
    id: raw.id || generateId(),
    subject: raw.subject || "General",
    title: raw.title || (raw.unit ? `Unit ${raw.unit}` : raw.fileName || "Study material"),
    periodId: raw.periodId || "3-2",
    fileUrl: raw.fileUrl || "",
    fileName: raw.fileName || "notes.pdf",
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

// Notes library
export const notesStore = {
  getAll: (): Note[] => sortNewest(getStore<Partial<Note> & { unit?: string }>("bh_notes").map(normalizeNote)),
  add: (note: Omit<Note, "id" | "createdAt">): Note => {
    const items = notesStore.getAll();
    const newItem: Note = {
      ...note,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    setStore("bh_notes", items);
    return newItem;
  },
  delete: (id: string) => {
    setStore(
      "bh_notes",
      notesStore.getAll().filter((note) => note.id !== id),
    );
  },
};

// Exam centre
export const examResourcesStore = {
  getAll: (): ExamResource[] => sortNewest(getStore<ExamResource>("bh_exam_resources")),
  add: (resource: Omit<ExamResource, "id" | "createdAt">): ExamResource => {
    const items = examResourcesStore.getAll();
    const newItem: ExamResource = {
      ...resource,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    setStore("bh_exam_resources", items);
    return newItem;
  },
  delete: (id: string) => {
    setStore(
      "bh_exam_resources",
      examResourcesStore.getAll().filter((resource) => resource.id !== id),
    );
  },
};

// Deadlines
export const deadlinesStore = {
  getAll: (): Deadline[] => sortNewest(getStore<Deadline>("bh_deadlines")),
  add: (deadline: Omit<Deadline, "id" | "createdAt">): Deadline => {
    const items = deadlinesStore.getAll();
    const newItem: Deadline = {
      ...deadline,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    setStore("bh_deadlines", items);
    return newItem;
  },
  delete: (id: string) => {
    setStore(
      "bh_deadlines",
      deadlinesStore.getAll().filter((deadline) => deadline.id !== id),
    );
  },
};

// Tasks (public dashboard tasks)
export const tasksStore = {
  getAll: (): Task[] => sortNewest(getStore<Task>("bh_tasks")),
  add: (text: string): Task => {
    const items = tasksStore.getAll();
    const newItem: Task = {
      id: generateId(),
      text,
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    setStore("bh_tasks", items);
    return newItem;
  },
  delete: (id: string) => {
    setStore(
      "bh_tasks",
      tasksStore.getAll().filter((task) => task.id !== id),
    );
  },
};

// Announcement
export const announcementStore = {
  get: (): string => localStorage.getItem("bh_announcement") || "",
  set: (text: string) => localStorage.setItem("bh_announcement", text),
};

// Personal tasks
export const personalTasksStore = {
  getAll: (userId: string): PersonalTask[] =>
    sortNewest(getStore<PersonalTask>("bh_personal_tasks")).filter((task) => task.userId === userId),
  add: (text: string, userId: string): PersonalTask => {
    const items = getStore<PersonalTask>("bh_personal_tasks");
    const newItem: PersonalTask = {
      id: generateId(),
      text,
      userId,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    setStore("bh_personal_tasks", items);
    return newItem;
  },
  toggle: (id: string) => {
    const items = getStore<PersonalTask>("bh_personal_tasks");
    const index = items.findIndex((task) => task.id === id);
    if (index >= 0) {
      items[index].completed = !items[index].completed;
    }
    setStore("bh_personal_tasks", items);
  },
  delete: (id: string) => {
    setStore(
      "bh_personal_tasks",
      getStore<PersonalTask>("bh_personal_tasks").filter((task) => task.id !== id),
    );
  },
};

// Private student project planner
export const projectPlansStore = {
  getAll: (userId: string): ProjectPlan[] =>
    sortNewest(getStore<ProjectPlan>("bh_project_plans")).filter((project) => project.userId === userId),
  add: (project: Omit<ProjectPlan, "id" | "createdAt">): ProjectPlan => {
    const items = getStore<ProjectPlan>("bh_project_plans");
    const newItem: ProjectPlan = {
      ...project,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    setStore("bh_project_plans", items);
    return newItem;
  },
  delete: (id: string) => {
    setStore(
      "bh_project_plans",
      getStore<ProjectPlan>("bh_project_plans").filter((project) => project.id !== id),
    );
  },
};

// Admin project registry
export const projectRegistryStore = {
  getAll: (): ProjectRegistryEntry[] => sortNewest(getStore<ProjectRegistryEntry>("bh_project_registry")),
  add: (entry: Omit<ProjectRegistryEntry, "id" | "createdAt">): ProjectRegistryEntry => {
    const items = projectRegistryStore.getAll();
    const newItem: ProjectRegistryEntry = {
      ...entry,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    setStore("bh_project_registry", items);
    return newItem;
  },
  delete: (id: string) => {
    setStore(
      "bh_project_registry",
      projectRegistryStore.getAll().filter((entry) => entry.id !== id),
    );
  },
};

// Enquiries
export const enquiriesStore = {
  getAll: (): Enquiry[] => sortNewest(getStore<Enquiry>("bh_enquiries")),
  add: (name: string, message: string): Enquiry => {
    const items = getStore<Enquiry>("bh_enquiries");
    const newItem: Enquiry = {
      id: generateId(),
      name,
      message,
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    setStore("bh_enquiries", items);
    return newItem;
  },
  reply: (id: string, reply: string) => {
    const items = getStore<Enquiry>("bh_enquiries");
    const index = items.findIndex((enquiry) => enquiry.id === id);
    if (index >= 0) {
      items[index].reply = reply;
    }
    setStore("bh_enquiries", items);
  },
  delete: (id: string) => {
    setStore(
      "bh_enquiries",
      getStore<Enquiry>("bh_enquiries").filter((enquiry) => enquiry.id !== id),
    );
  },
};
