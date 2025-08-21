// src/components/Toolbar.jsx
import React from "react";

export default function Toolbar({
  query,
  setQuery,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  hideCompletedProjects,
  setHideCompletedProjects,
  setViewMode,
  exportCSV,
  exportJSON,
  handleImportFile,
  fileInputRef,
  theme,
  setTheme,
  setShowTambahModal,
  testNotification,
  checkDeadlinesNow,
  // 🔥 filter tambahan
  filterDeadline,
  setFilterDeadline,
  filterProgress,
  setFilterProgress,
}) {
  return (
    <div className="p-4 border rounded mb-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex flex-wrap gap-2 mb-2">
        {/* Cari proyek */}
        <input
          type="text"
          placeholder="Cari proyek..."
          className="border p-2 rounded flex-1 min-w-[200px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Filter Status */}
        <select
          className="border p-2 rounded"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {/* Filter Prioritas */}
        <select
          className="border p-2 rounded"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">Semua Prioritas</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* 🔥 Filter tambahan */}
        <input
          type="date"
          className="border p-2 rounded"
          value={filterDeadline}
          onChange={(e) => setFilterDeadline(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={filterProgress}
          onChange={(e) => setFilterProgress(e.target.value)}
        >
          <option value="all">Semua Progress</option>
          <option value="0">0%</option>
          <option value="25">25%</option>
          <option value="50">50%</option>
          <option value="75">75%</option>
          <option value="100">100%</option>
        </select>

        <label className="flex items-center gap-1 ml-2">
          <input
            type="checkbox"
            checked={hideCompletedProjects}
            onChange={(e) => setHideCompletedProjects(e.target.checked)}
          />
          Sembunyikan selesai
        </label>
      </div>

      {/* Tombol Aksi */}
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={exportCSV}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          ⬇️ CSV
        </button>
        <button
          onClick={exportJSON}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          ⬇️ JSON
        </button>

        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-purple-500 text-white px-3 py-1 rounded"
        >
          📂 Impor
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImportFile}
        />

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          {theme === "dark" ? "☀️ Terang" : "🌙 Gelap"}
        </button>

        <button
          onClick={() => setShowTambahModal(true)}
          className="bg-orange-500 text-white px-3 py-1 rounded"
        >
          ➕ Tambah
        </button>

        <button
          onClick={checkDeadlinesNow}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          🔍 Cek Deadline
        </button>

        {/* Pilihan Tampilan */}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setViewMode("table")}
            className="border px-3 py-1 rounded"
          >
            📋 Tabel
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className="border px-3 py-1 rounded"
          >
            🗂️ Kanban
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className="border px-3 py-1 rounded"
          >
            📅 Kalender
          </button>
        </div>
      </div>
    </div>
  );
}
