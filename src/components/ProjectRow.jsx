import React from "react";

export default function ProjectRow({ project, onEdit, onDelete, onToggle }) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-2 px-4">{project.name}</td>
      <td className="py-2 px-4">{project.deadline}</td>
      <td className="py-2 px-4 text-center">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.active ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
          }`}
        >
          {project.active ? "Aktif" : "Nonaktif"}
        </span>
      </td>
      <td className="py-2 px-4 text-center space-x-2">
        <button
          onClick={() => onToggle(project.id)}
          className={`px-3 py-1 rounded ${
            project.active
              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {project.active ? "Nonaktifkan" : "Aktifkan"}
        </button>
        <button
          onClick={() => onEdit(project.id)}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
        >
          Hapus
        </button>
      </td>
    </tr>
  );
}