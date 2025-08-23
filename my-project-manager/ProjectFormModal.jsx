import React from "react";

export default function ProjectFormModal({
  name,
  category,
  description,
  deadline,
  priority,
  editId,

  setName,
  setCategory,
  setDescription,
  setDeadline,
  setPriority,

  addOrUpdateProject,
  clearForm,
  showTambahModal,
  setShowTambahModal,
}) {
  if (!showTambahModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addOrUpdateProject(); // pakai langsung dari hook
    setShowTambahModal(false); // tutup modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">
          {editId ? "✏️ Edit Proyek" : "➕ Tambah Proyek"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Nama Proyek"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded dark:bg-gray-700"
          />

          <input
            type="text"
            placeholder="Kategori"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border px-3 py-2 rounded dark:bg-gray-700"
          />

          <textarea
            placeholder="Deskripsi"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded dark:bg-gray-700"
          />

          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border px-3 py-2 rounded dark:bg-gray-700"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border px-3 py-2 rounded dark:bg-gray-700"
          >
            <option value="Low">Prioritas Rendah</option>
            <option value="Medium">Prioritas Sedang</option>
            <option value="High">Prioritas Tinggi</option>
          </select>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                clearForm();
                setShowTambahModal(false);
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
