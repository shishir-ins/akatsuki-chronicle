export const APP_NAME = "Bloody Hell";
export const APP_TAGLINE = "Dhairye sahase manchu laxmi";
export const STUDENT_ID_STORAGE_KEY = "akatsuki_active_student_id";

export const ACADEMIC_PERIODS = [
  { id: "2-2", label: "2nd Year · 2nd Semester" },
  { id: "3-1", label: "3rd Year · 1st Semester" },
  { id: "3-2", label: "3rd Year · 2nd Semester" },
  { id: "4-1", label: "4th Year · 1st Semester" },
  { id: "4-2", label: "4th Year · 2nd Semester" },
] as const;

export const CORE_SUBJECTS = [
  "SSTT",
  "Analog Circuits",
  "Electrical Machines",
  "Economics",
  "GUEE",
];

export function getPeriodLabel(periodId: string): string {
  return ACADEMIC_PERIODS.find((period) => period.id === periodId)?.label || periodId;
}

export function getAllSubjects(...collections: Array<Array<string | undefined>>): string[] {
  return Array.from(
    new Set(
      [CORE_SUBJECTS, ...collections]
        .flat()
        .map((subject) => subject?.trim())
        .filter((subject): subject is string => Boolean(subject)),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

export function getActiveStudentId(): string {
  if (typeof window === "undefined") {
    return "student-local";
  }

  return localStorage.getItem(STUDENT_ID_STORAGE_KEY) || "student-local";
}

export function setActiveStudentId(studentId: string): string {
  const normalized = studentId.trim() || "student-local";
  if (typeof window !== "undefined") {
    localStorage.setItem(STUDENT_ID_STORAGE_KEY, normalized);
  }
  return normalized;
}
