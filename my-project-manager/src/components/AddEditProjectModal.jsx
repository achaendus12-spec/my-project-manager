import React, { useState, useEffect } from "react";
import useProjects from "../hooks/useProjects";

export default function AddEditProjectModal() {
  const {
    addOrUpdateProject,
    clearForm,
    editId,
    name,
    category,
    description,
    deadline,
    priority,
    setName,
    setCategory,
    setDescription,
    setDeadline,
    setPriority,
    isAddModalOpen,
    setIsAddModalOpen,
  } = useProjects();

  const [show, setShow] = useState(false);

  // sinkron dengan state modal global
  useEffect(() => {
    setShow(isAddModalOpen);
  }, [isAddModalOpen]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addOrUpdateProject();
    setIsAddModalOpen(false);
  };

  const handleClose = () => {
    clearForm();
    setIsAddModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        {/* Tombol close */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">
          {editId ? "✏️ Edit Proyek" : "➕ Tambah Proyek"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Proyek"
            className="border p-2 w-full rounded dark:bg-gray-700"
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Kategori"
            className="border p-2 w-full rounded dark:bg-gray-700"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi"
            className="border p-2 w-full rounded dark:bg-gray-700"
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="border p-2 w-full rounded dark:bg-gray-700"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border p-2 w-full rounded dark:bg-gray-700"
          >
            <option value="High">Tinggi</option>
            <option value="Medium">Sedang</option>
            <option value="Low">Rendah</option>
          </select>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {editId ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
