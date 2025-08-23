// src/components/TambahProyekModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TambahProyekModal({ editData, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    priority: "Medium",
    deadline: "",
    status: "Not Started",
  });

  // Saat edit data
  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        description: editData.description || "",
        category: editData.category || "",
        priority: editData.priority || "Medium",
        deadline: editData.deadline || "",
        status: editData.status || "Not Started",
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...editData,
      ...form,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-[400px]"
          initial={{ scale: 0.8, opacity: 0, y: -50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="text-lg font-bold mb-4">
            {editData ? "✏️ Edit Proyek" : "➕ Tambah Proyek"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              name="name"
              placeholder="Nama Proyek"
              className="border p-2 rounded w-full"
              value={form.name}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Deskripsi"
              className="border p-2 rounded w-full"
              value={form.description}
              onChange={handleChange}
            />

            <input
              type="text"
              name="category"
              placeholder="Kategori"
              className="border p-2 rounded w-full"
              value={form.category}
              onChange={handleChange}
            />

            <select
              name="priority"
              className="border p-2 rounded w-full"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="High">Tinggi</option>
              <option value="Medium">Sedang</option>
              <option value="Low">Rendah</option>
            </select>

            <input
              type="date"
              name="deadline"
              className="border p-2 rounded w-full"
              value={form.deadline}
              onChange={handleChange}
            />

            <select
              name="status"
              className="border p-2 rounded w-full"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Not Started">Belum Mulai</option>
              <option value="In Progress">Sedang Berjalan</option>
              <option value="Completed">Selesai</option>
            </select>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 bg-gray-500 text-white rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                {editData ? "Simpan" : "Tambah"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
