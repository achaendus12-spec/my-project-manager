import React from "react";

export default function ProjectCard({
  project,
  index,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 border">
      {/* Judul dan Deskripsi */}
      <h2 className="font-bold text-lg mb-1">
        {index + 1}. {project.name}
      </h2>
      <p className="text-gray-700">{project.description}</p>

      {/* Deadline (jika ada) */}
      {project.deadline && (
        <p className="text-gray-600 mt-1">
          Deadline: {new Date(project.deadline).toLocaleDateString("id-ID")}
        </p>
      )}

      {/* Status */}
      <p
        className={`mt-1 font-medium ${
          project.active ? "text-green-600" : "text-gray-500"
        }`}
      >
        Status: {project.active ? "Aktif" : "Tidak Aktif"}
      </p>

      {/* Tombol Aksi */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onEdit(project.id)}
          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
        >
          Hapus
        </button>
        <button
          onClick={() => onToggleStatus(project.id)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
        >
          {project.active ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </div>
    </div>
  );
}