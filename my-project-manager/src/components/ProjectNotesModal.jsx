import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectNotesModal({
  project,
  onClose,
  onAddNote,
  onDeleteNote,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onEditNote,
  onEditSubtask,
}) {
  if (!project) return null;

  const [noteText, setNoteText] = useState("");
  const [subtaskText, setSubtaskText] = useState("");

  // state edit
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editText, setEditText] = useState("");

  const handleAddNote = () => {
    if (noteText.trim()) {
      onAddNote(project.id, noteText);
      setNoteText("");
    }
  };

  const handleAddSubtask = () => {
    if (subtaskText.trim()) {
      onAddSubtask(project.id, subtaskText);
      setSubtaskText("");
    }
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    if (editingNoteId) {
      onEditNote(project.id, editingNoteId, editText);
      setEditingNoteId(null);
    }
    if (editingSubtaskId) {
      onEditSubtask(project.id, editingSubtaskId, editText);
      setEditingSubtaskId(null);
    }
    setEditText("");
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg w-full max-w-lg"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-bold mb-2">
            Catatan & Checklist - {project.name}
          </h2>

          {/* Catatan */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">📝 Catatan</h3>
            <div className="flex mb-2">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Tulis catatan..."
                className="border p-2 flex-1 mr-2 dark:bg-gray-700"
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
              <button
                onClick={handleAddNote}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Tambah
              </button>
            </div>
            {(!project.notes || project.notes.length === 0) && (
              <p className="text-sm text-gray-500">Belum ada catatan</p>
            )}
            <ul className="space-y-1">
              {project.notes?.map((n) => (
                <li
                  key={n.id}
                  className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded"
                >
                  {editingNoteId === n.id ? (
                    <div className="flex w-full gap-2">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="border p-1 flex-1 dark:bg-gray-600"
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-500 text-white px-2 rounded"
                      >
                        ✔
                      </button>
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="bg-gray-500 text-white px-2 rounded"
                      >
                        ✖
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm">{n.text}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingNoteId(n.id);
                            setEditText(n.text);
                          }}
                          className="text-yellow-600 hover:underline text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteNote(project.id, n.id)}
                          className="text-red-500 hover:underline text-xs"
                        >
                          Hapus
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Checklist */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">✅ Checklist</h3>
            <div className="flex mb-2">
              <input
                value={subtaskText}
                onChange={(e) => setSubtaskText(e.target.value)}
                placeholder="Tulis subtask..."
                className="border p-2 flex-1 mr-2 dark:bg-gray-700"
                onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
              />
              <button
                onClick={handleAddSubtask}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Tambah
              </button>
            </div>
            {(!project.subtasks || project.subtasks.length === 0) && (
              <p className="text-sm text-gray-500">Belum ada checklist</p>
            )}
            <ul className="space-y-1">
              {project.subtasks?.map((st) => (
                <li
                  key={st.id}
                  className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => onToggleSubtask(project.id, st.id)}
                      className="mr-2"
                    />
                    {editingSubtaskId === st.id ? (
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="border p-1 dark:bg-gray-600"
                      />
                    ) : (
                      <span
                        className={`text-sm ${
                          st.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {st.text}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingSubtaskId === st.id ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="bg-green-500 text-white px-2 rounded"
                        >
                          ✔
                        </button>
                        <button
                          onClick={() => setEditingSubtaskId(null)}
                          className="bg-gray-500 text-white px-2 rounded"
                        >
                          ✖
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingSubtaskId(st.id);
                            setEditText(st.text);
                          }}
                          className="text-yellow-600 hover:underline text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteSubtask(project.id, st.id)}
                          className="text-red-500 hover:underline text-xs"
                        >
                          Hapus
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Tombol Tutup */}
          <div className="text-right">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
