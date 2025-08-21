// src/components/ProjectTable.jsx
import React, { useState } from "react";

export default function ProjectTable({
  projects,
  onEdit,
  onDelete,
  onNext,
  onOpenNotes,
  getProgress,
  isOverdue,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const sortedProjects = React.useMemo(() => {
    let sortable = [...projects];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let valA = a[sortConfig.key] || "";
        let valB = b[sortConfig.key] || "";

        // khusus deadline → urutkan sebagai tanggal
        if (sortConfig.key === "deadline") {
          valA = new Date(valA);
          valB = new Date(valB);
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [projects, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  if (!projects.length) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Belum ada proyek. Klik **+ Tambah Proyek** untuk mulai 🚀
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-left">
            <th className="p-2 border cursor-pointer" onClick={() => handleSort("name")}>
              Nama {sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="p-2 border cursor-pointer" onClick={() => handleSort("category")}>
              Kategori {sortConfig.key === "category" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="p-2 border cursor-pointer" onClick={() => handleSort("description")}>
              Deskripsi {sortConfig.key === "description" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="p-2 border cursor-pointer" onClick={() => handleSort("deadline")}>
              Deadline {sortConfig.key === "deadline" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="p-2 border cursor-pointer" onClick={() => handleSort("priority")}>
              Prioritas {sortConfig.key === "priority" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="p-2 border cursor-pointer" onClick={() => handleSort("status")}>
              Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="p-2 border">Progress</th>
            <th className="p-2 border">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {sortedProjects.map((p) => {
            const progress = getProgress(p);
            return (
              <tr
                key={p.id}
                className={`${isOverdue(p) ? "bg-red-100 dark:bg-red-900" : ""}`}
              >
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border">{p.category}</td>
                <td className="p-2 border">{p.description}</td>
                <td className="p-2 border">{p.deadline}</td>
                <td className="p-2 border">{p.priority}</td>
                <td className="p-2 border">{p.status}</td>
                <td className="p-2 border">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded h-4">
                    <div
                      className="bg-blue-600 h-4 rounded"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs">{progress}%</span>
                </td>
                <td className="p-2 border flex flex-wrap gap-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onNext(p.id)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  >
                    {p.status === "Completed" ? "Reset" : "Next"}
                  </button>
                  <button
                    onClick={() => onOpenNotes(p)}
                    className="px-2 py-1 bg-purple-500 text-white rounded text-xs"
                  >
                    Catatan
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
