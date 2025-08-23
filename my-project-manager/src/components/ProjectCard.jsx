import React from "react";

export default function ProjectCard({ project, index, onEdit, onDelete, onToggleStatus }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-between transition hover:shadow-lg border border-gray-100">
      <div className="mb-4">
        <h2 className="font-bold text-xl text-gray-800">
          {index + 1}. {project.name}
        </h2>
        <p className="text-gray-600 mt-1">{project.description}</p>

        <div className="mt-3 space-y-1 text-sm">
          <p>
            <span className="font-semibold">Deadline:</span>{" "}
            {project.deadline || "Tidak ditentukan"}
          </p>
          <p>
            <span className="font-semibold">Kategori:</span> {project.category}
          </p>
          <p
            className={`font-semibold ${
              project.active ? "text-green-600" : "text-red-600"
            }`}
          >
            Status: {project.active ? "Aktif" : "Nonaktif"}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onEdit(project.id)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => onToggleStatus(project.id)}
          className={`flex-1 px-3 py-2 rounded-lg text-sm text-white ${
            project.active
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {project.active ? "Nonaktifkan" : "Aktifkan"}
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}