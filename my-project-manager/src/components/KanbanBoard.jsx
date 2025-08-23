// src/components/KanbanBoard.jsx
import React, { useState } from "react";
import { useDrop, useDrag } from "react-dnd";
import { supabase } from "../supabaseClient";

const ItemTypes = { PROJECT: "project" };

// Draggable Project Card
function DraggableProject({
  project,
  onEdit,
  onDelete,
  onOpenNotes,
  onNext,
  getProgress,
  isOverdue,
  onOpenDetail,   // 🔥 tambahin
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PROJECT,
    item: { id: project.id },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  const pr = getProgress(project);

  return (
    <div
      ref={drag}
      className={`p-3 mb-3 rounded-xl shadow-md bg-white dark:bg-gray-800 border 
        ${isDragging ? "opacity-50" : ""} 
        hover:shadow-lg transition-shadow cursor-pointer`}
      onClick={() => onOpenDetail(project)} // 🔥 buka modal detail
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold">{project.name}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            project.priority === "High"
              ? "bg-red-500 text-white"
              : project.priority === "Medium"
              ? "bg-yellow-400 text-black"
              : "bg-green-500 text-white"
          }`}
        >
          {project.priority}
        </span>
      </div>

      {/* Kategori */}
      <p className="text-xs text-gray-500">{project.category}</p>

      {/* Deadline */}
      <div className="mt-1 text-xs">
        <span className="text-gray-600 dark:text-gray-300">
          Deadline: {project.deadline}
        </span>
        {isOverdue && isOverdue(project) && project.status !== "Completed" && (
          <span className="ml-2 text-red-600 font-semibold">⚠ Terlambat</span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${
              project.status === "Completed"
                ? "bg-gray-400"
                : pr >= 70
                ? "bg-green-500"
                : pr >= 30
                ? "bg-yellow-400"
                : "bg-red-500"
            }`}
            style={{ width: `${pr}%` }}
          />
        </div>
        <span className="text-xs">{pr}%</span>
      </div>
    </div>
  );
}

// Column
function Column({
  status,
  projects,
  setProjects,
  onEdit,
  onDelete,
  onOpenNotes,
  onNext,
  getProgress,
  isOverdue,
  onOpenDetail,   // 🔥 lempar ke card
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.PROJECT,
    drop: async (item) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status } : p))
      );
      const { error } = await supabase
        .from("projects")
        .update({ status })
        .eq("id", item.id);
      if (error) {
        console.error("Gagal update status di Supabase:", error.message);
      }
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const filtered = projects.filter((p) => p.status === status);

  return (
    <div
      ref={drop}
      className={`flex-1 p-3 rounded-xl min-h-[500px] border-2 transition-colors 
        ${
          isOver
            ? "bg-green-50 border-green-400"
            : "bg-gray-50 dark:bg-gray-900 border-gray-200"
        }`}
    >
      <h2 className="font-bold text-lg mb-3">{status}</h2>
      {filtered.map((p) => (
        <DraggableProject
          key={p.id}
          project={p}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenNotes={onOpenNotes}
          onNext={onNext}
          getProgress={getProgress}
          isOverdue={isOverdue}
          onOpenDetail={onOpenDetail} // 🔥 lempar
        />
      ))}
    </div>
  );
}

// Kanban Board
export default function KanbanBoard({
  projects,
  setProjects,
  onEdit,
  onDelete,
  onOpenNotes,
  onNext,
  getProgress,
  isOverdue,
}) {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Column
          status="Not Started"
          projects={projects}
          setProjects={setProjects}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenNotes={onOpenNotes}
          onNext={onNext}
          getProgress={getProgress}
          isOverdue={isOverdue}
          onOpenDetail={setSelected}
        />
        <Column
          status="In Progress"
          projects={projects}
          setProjects={setProjects}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenNotes={onOpenNotes}
          onNext={onNext}
          getProgress={getProgress}
          isOverdue={isOverdue}
          onOpenDetail={setSelected}
        />
        <Column
          status="Completed"
          projects={projects}
          setProjects={setProjects}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenNotes={onOpenNotes}
          onNext={onNext}
          getProgress={getProgress}
          isOverdue={isOverdue}
          onOpenDetail={setSelected}
        />
      </div>

      {/* 🔥 Modal detail */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-[400px]">
            <h2 className="text-lg font-bold mb-2">
              {selected.name} ({getProgress(selected)}%)
            </h2>
            <p className="mb-1">📂 {selected.category} | ⭐ {selected.priority}</p>
            <p className="mb-1">📅 Deadline: {selected.deadline}</p>
            <p className="mb-1">📊 Status: {selected.status}</p>
            <p className="mb-2">📝 {selected.description || "Tidak ada deskripsi"}</p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${getProgress(selected)}%` }}
              />
            </div>
            <span className="text-xs">{getProgress(selected)}% selesai</span>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1 bg-gray-500 text-white rounded"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  onEdit(selected);   // 🔥 panggil form edit
                  setSelected(null);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Edit Proyek
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
