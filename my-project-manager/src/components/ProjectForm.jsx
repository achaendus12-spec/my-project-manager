// src/components/ProjectForm.jsx
import React from "react";
import useProjectsSupabase, { addProjectSupabaseOnly } from "../hooks/useProjectsSupabase";

export default function ProjectForm({ user }) {
  const {
    name, category, description, deadline, priority, editId,
    setName, setCategory, setDescription, setDeadline, setPriority,
    addOrUpdateProject, clearForm, setProjects
  } = useProjectsSupabase(user);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      // kalau sedang edit, tetap pakai fungsi lama
      addOrUpdateProject();
    } else {
      // kalau tambah baru, pakai versi tanpa id manual
      await addProjectSupabaseOnly({
        name,
        category,
        description,
        deadline,
        priority,
        user,
        setProjects,
      });

      // reset form setelah tambah
      setName("");
      setCategory("");
      setDescription("");
      setDeadline("");
      setPriority("Medium");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4"
    >
      <h2 className="text-lg font-bold mb-3">
        {editId ? "✏️ Edit Proyek" : "➕ Tambah Proyek"}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          type="text"
          placeholder="Nama Proyek"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Kategori"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <textarea
          placeholder="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border px-3 py-2 rounded w-full md:col-span-2"
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="High">Tinggi</option>
          <option value="Medium">Sedang</option>
          <option value="Low">Rendah</option>
        </select>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {editId ? "Simpan Perubahan" : "Tambah"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={clearForm}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Batal Edit
          </button>
        )}
      </div>
    </form>
  );
}
