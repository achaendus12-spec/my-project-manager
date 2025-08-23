import React from "react";
import { useDrag } from "react-dnd";

export default function KanbanCard({ project, onEdit, onDelete, onToggleStatus, onOpenNotes, progress }) {
  const [{ isDragging }, drag] = useDrag({
    type: "PROJECT",
    item: { id: project.id },
    collect: monitor => ({ isDragging: !!monitor.isDragging() }),
  });

  // Warna status
  const statusStyles = {
    "Not Started": { bg: "bg-blue-50", badge: "bg-blue-500", toggleText: "Mulai",  toggleColor: "bg-blue-500" },
    "In Progress": { bg: "bg-green-50", badge: "bg-green-500", toggleText: "Selesai", toggleColor: "bg-green-500" },
    "Completed":   { bg: "bg-orange-50", badge: "bg-orange-500", toggleText: "Reset", toggleColor: "bg-orange-500" }
  };
  const statusStyle = statusStyles[project.status] || statusStyles["Not Started"];

  // Warna prioritas
  const priorityColors = {
    High: "bg-red-500 text-white",
    Medium: "bg-yellow-400 text-black",
    Low: "bg-green-500 text-white",
  };

  // Warna progress bar
  const progressColor =
    progress >= 70 ? "bg-green-500" :
    progress >= 30 ? "bg-yellow-400" : "bg-red-500";

  return (
    <div
      ref={drag}
      className={`p-3 rounded shadow mb-2 relative border ${statusStyle.bg}`}
      style={{ opacity: isDragging ? 0.5 : 1, cursor: "grab" }}
    >
      {/* Badge Status */}
      <span className={`absolute top-1 right-1 px-2 py-0.5 text-xs rounded text-white font-semibold ${statusStyle.badge}`}>
        {project.status}
      </span>

      {/* Judul + Badge Progress */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{project.name}</h3>
        <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
          progress >= 70 ? "bg-green-500 text-white" : progress >= 30 ? "bg-yellow-400 text-black" : "bg-red-500 text-white"
        }`}>
          {progress}%
        </span>
      </div>

      {/* Kategori & Prioritas */}
      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">{project.category}</span>
      {project.priority && (
        <span className={`inline-block mt-1 ml-2 px-2 py-0.5 text-xs rounded ${priorityColors[project.priority] || "bg-gray-500 text-white"}`}>
          {project.priority}
        </span>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
        <div className={`${progressColor} h-2 rounded-full`} style={{ width: `${progress}%` }}></div>
      </div>

      {/* Aksi */}
      <div className="flex flex-wrap gap-1 mt-2">
        <button onClick={() => onToggleStatus(project.id)} className={`${statusStyle.toggleColor} text-white px-2 py-1 text-xs rounded`}>
          {statusStyle.toggleText}
        </button>
        <button onClick={() => onEdit(project)} className="bg-blue-500 text-white px-2 py-1 text-xs rounded">Edit</button>
        <button onClick={() => onOpenNotes(project)} className="bg-indigo-600 text-white px-2 py-1 text-xs rounded">Catatan</button>
        <button onClick={() => onDelete(project.id)} className="bg-red-500 text-white px-2 py-1 text-xs rounded">Hapus</button>
      </div>
    </div>
  );
}





