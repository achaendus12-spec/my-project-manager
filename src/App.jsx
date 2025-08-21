// src/App.jsx
import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Hooks
import useAuth from "./hooks/useAuth";
import useProjectsSupabase from "./hooks/useProjectsSupabase";

// Komponen
import Dashboard from "./components/Dashboard";
import Toolbar from "./components/Toolbar";
import ProjectTable from "./components/ProjectTable";
import KanbanBoard from "./components/KanbanBoard";
import CalendarView from "./components/CalendarView";
import ProjectNotesModal from "./components/ProjectNotesModal";
import TambahProyekModal from "./components/TambahProyekModal";

export default function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const projectsState = useProjectsSupabase(user);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (loading) return <div className="p-4">Loading...</div>;

  // ================= Jika belum login =================
  if (!user) {
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (authMode === "login") {
          await signIn(email, password);
        } else {
          await signUp(email, password);
        }
      } catch (err) {
        alert(err.message);
      }
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md w-80"
        >
          <h2 className="text-lg font-bold mb-4">
            {authMode === "login" ? "Login" : "Register"}
          </h2>
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 mb-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 mb-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            {authMode === "login" ? "Login" : "Register"}
          </button>
          <p
            className="mt-3 text-sm text-blue-600 cursor-pointer"
            onClick={() =>
              setAuthMode(authMode === "login" ? "signup" : "login")
            }
          >
            {authMode === "login"
              ? "Belum punya akun? Daftar"
              : "Sudah punya akun? Login"}
          </p>
        </form>
      </div>
    );
  }

  // ================= Jika sudah login =================
  const {
    projects,
    viewMode,
    displayedProjects,
    notesProjectId,
    theme,
    showTambahModal,
    editingProject,

    // actions
    addOrUpdateProject,
    clearForm,
    editProject,
    toggleStatus,
    confirmDelete,
    openNotes,
    addNote,
    deleteNote,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    setShowTambahModal,
    setNotesProjectId,
    setEditId,
    getProgress,
    isOverdue,
    resetProject,

    // toolbar utils
    query,
    setQuery,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    hideCompletedProjects,
    setHideCompletedProjects,
    setViewMode,
    exportCSV,
    exportJSON,
    handleImportFile,
    fileInputRef,
    setTheme,
    testNotification,
    checkDeadlinesNow,

    // 🔥 filter tambahan
    filterDeadline,
    setFilterDeadline,
    filterProgress,
    setFilterProgress,
  } = projectsState;

  return (
    <div
      className={`p-4 min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📋 Manajemen Proyek</h1>
        <button
          onClick={signOut}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* Dashboard Ringkasan */}
      <Dashboard projects={projects} />

      {/* Toolbar */}
      <Toolbar
        query={query}
        setQuery={setQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        hideCompletedProjects={hideCompletedProjects}
        setHideCompletedProjects={setHideCompletedProjects}
        setViewMode={setViewMode}
        exportCSV={exportCSV}
        exportJSON={exportJSON}
        handleImportFile={handleImportFile}
        fileInputRef={fileInputRef}
        theme={theme}
        setTheme={setTheme}
        setShowTambahModal={setShowTambahModal}
        testNotification={testNotification}
        checkDeadlinesNow={checkDeadlinesNow}
        filterDeadline={filterDeadline}
        setFilterDeadline={setFilterDeadline}
        filterProgress={filterProgress}
        setFilterProgress={setFilterProgress}
      />

      {/* Mode Tabel */}
      {viewMode === "table" && (
        <ProjectTable
          {...projectsState}
          projects={displayedProjects}
          onEdit={(p) => {
            editProject(p);
            setShowTambahModal(true);
          }}
          onDelete={confirmDelete}
          onToggleStatus={toggleStatus}
          onOpenNotes={openNotes}
          onNext={resetProject}
          getProgress={getProgress}
          isOverdue={isOverdue}
        />
      )}

      {/* Mode Kanban */}
      {viewMode === "kanban" && (
        <DndProvider backend={HTML5Backend}>
          <KanbanBoard
            projects={displayedProjects}
            setProjects={projectsState.setProjects}
            onEdit={(p) => {
              editProject(p);
              setShowTambahModal(true);
            }}
            onDelete={confirmDelete}
            onOpenNotes={openNotes}
            onNext={resetProject}
            getProgress={getProgress}
          />
        </DndProvider>
      )}

      {/* Mode Kalender */}
      {viewMode === "calendar" && (
        <CalendarView user={user} onEditProject={(p) => {
          editProject(p);
          setShowTambahModal(true);
        }} />
      )}

      {/* Modal Catatan */}
      {notesProjectId && (
        <ProjectNotesModal
          project={projects.find((p) => p.id === notesProjectId)}
          onClose={() => setNotesProjectId(null)}
          onAddNote={addNote}
          onDeleteNote={deleteNote}
          onAddSubtask={addSubtask}
          onToggleSubtask={toggleSubtask}
          onDeleteSubtask={deleteSubtask}
        />
      )}

      {/* Modal Tambah / Edit Proyek */}
      {(showTambahModal || editingProject) && (
        <TambahProyekModal
          editData={editingProject}
          onSubmit={addOrUpdateProject}
          onClose={() => {
            setShowTambahModal(false);
            setEditId(null);
            clearForm();
          }}
        />
      )}
    </div>
  );
}
