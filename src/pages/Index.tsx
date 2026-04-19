import { useState } from "react";
import NavBar from "@/components/NavBar";
import DashboardPage from "@/pages/DashboardPage";
import AdminPage from "@/pages/AdminPage";
import PlannerPage from "@/pages/PlannerPage";
import EnquiryPage from "@/pages/EnquiryPage";
import AiChatPage from "@/pages/AiChatPage";
import Footer from "@/components/Footer";
import ProjectsPage from "@/pages/ProjectsPage";
import ExamCentrePage from "@/pages/ExamCentrePage";

export type AppPage =
  | "dashboard"
  | "exam"
  | "projects"
  | "planner"
  | "ai"
  | "enquiry"
  | "admin";

const Index = () => {
  const [page, setPage] = useState<AppPage>("dashboard");

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="app-shell-background" />

      <NavBar currentPage={page} onPageChange={(nextPage) => setPage(nextPage as AppPage)} />

      <main className="animate-fade-in flex-1">
        {page === "dashboard" && <DashboardPage onPageChange={setPage} />}
        {page === "exam" && <ExamCentrePage />}
        {page === "projects" && <ProjectsPage />}
        {page === "planner" && <PlannerPage />}
        {page === "enquiry" && <EnquiryPage />}
        {page === "ai" && <AiChatPage />}
        {page === "admin" && <AdminPage />}
      </main>

      {page !== "ai" && <Footer onPageChange={(nextPage) => setPage(nextPage as AppPage)} />}
    </div>
  );
};

export default Index;
