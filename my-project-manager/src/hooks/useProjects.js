import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { checkSomething, daysLeft } from "@/utils";
import { supabase } from "@/supabaseClient";

export default function useProjects() {
  // ===================== State utama =====================
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("projects");
    return saved ? JSON.parse(saved) : [];
  });

  // Form lama (masih dipakai buat edit)
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [editId, setEditId] = useState(null);

  // UI state
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("pm_theme") || "light"
  );
  const [viewMode, setViewMode] = useState("table");
  const [sortProgress, setSortProgress] = useState(null);
  const [hideCompletedProjects, setHideCompletedProjects] = useState(false);
  const [notesProjectId, setNotesProjectId] = useState(null);
  const [showTambahModal, setShowTambahModal] = useState(false);

  // Notifications
  const fileInputRef = useRef();
  const [shownNotifications, setShownNotifications] = useState(() => {
    const saved = localStorage.getItem("shownNotifications");
    return saved ? JSON.parse(saved) : {};
  });

  // Quick-subtask inputs
  const [quickSubtasks, setQuickSubtasks] = useState({});

  const fetchProjects = async () => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Fetch error:", error.message);
      Swal.fire("Error", "Gagal memuat proyek dari server", "error");
    } else {
      setProjects(data || []);
      localStorage.setItem("projects", JSON.stringify(data || []));
    }
  };
  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);
  // ===================== Effects =====================
  // Reset notifikasi harian
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const lastReset = localStorage.getItem("lastNotificationReset");
    if (lastReset !== today) {
      localStorage.setItem("shownNotifications", JSON.stringify({}));
      setShownNotifications({});
      localStorage.setItem("lastNotificationReset", today);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: "Notifikasi direset otomatis hari ini",
        showConfirmButton: false,
        timer: 1800,
      });
    }
  }, []);

  // Simpan ke localStorage
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
    localStorage.setItem("shownNotifications", JSON.stringify(shownNotifications));
  }, [projects, shownNotifications]);

  // ===================== 🔥 Auto Backup Harian =====================
  useEffect(() => {
    if (!projects.length) return;

    const today = new Date().toISOString().split("T")[0];
    const lastBackup = localStorage.getItem("lastBackupDate");

    if (lastBackup === today) return; // hanya sekali per hari

    const data = JSON.stringify(projects, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `projects-backup-${today}.json`;
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    localStorage.setItem("lastBackupDate", today);
  }, [projects]);

  // Simpan tema
  useEffect(() => {
    localStorage.setItem("pm_theme", theme);
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  // Migrasi struktur lama → baru
  useEffect(() => {
    const needMigration = projects.some(
      (p) => (p.notes && !Array.isArray(p.notes)) || !p.subtasks
    );
    if (needMigration) {
      setProjects((prev) =>
        prev.map((p) => ({
          ...p,
          notes: Array.isArray(p.notes)
            ? p.notes
            : p.notes
            ? [
                {
                  id: Date.now() + Math.random(),
                  text: String(p.notes),
                  ts: new Date().toISOString(),
                },
              ]
            : [],
          subtasks: Array.isArray(p.subtasks) ? p.subtasks : [],
        }))
      );
    }
  }, []);

  // Permission notifikasi browser
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Cek deadline otomatis (sekali render)
  useEffect(() => {
    projects.forEach((p) => {
      if (!p.deadline) return;
      const diffDays = daysLeft(p.deadline);

      if (shownNotifications[p.id]) return;

      if (diffDays < 0) {
        Swal.fire({
          icon: "error",
          title: "❌ Deadline Terlewat!",
          text: `Proyek "${p.name}" sudah melewati tenggat waktu!`,
        });
        setShownNotifications((prev) => ({ ...prev, [p.id]: true }));
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Deadline Terlewat!", {
            body: `${p.name} sudah lewat tenggat waktu.`,
          });
        }
      } else if (diffDays <= 1) {
        Swal.fire({
          icon: "warning",
          title: "⚠️ Deadline Hari Ini atau Besok",
          text: `Proyek "${p.name}" berakhir dalam ${diffDays} hari!`,
        });
        setShownNotifications((prev) => ({ ...prev, [p.id]: true }));
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Deadline Mendekat", {
            body: `${p.name} berakhir dalam ${diffDays} hari.`,
          });
        }
      }
    });
  }, [projects]);

  // ===================== Helpers =====================
  const getProgress = (project) => {
    if (!project.subtasks || project.subtasks.length === 0) return 0;
    const done = project.subtasks.filter((st) => st.completed).length;
    return Math.round((done / project.subtasks.length) * 100);
  };

  const isOverdue = (p) => {
    if (!p.deadline) return false;
    return daysLeft(p.deadline) < 0 && getProgress(p) < 100;
  };

  // ===================== CRUD =====================
  const clearForm = () => {
    setName("");
    setCategory("");
    setDescription("");
    setDeadline("");
    setPriority("Medium");
    setEditId(null);
  };

  const addOrUpdateProject = async (projectFromModal) => {
    if (!currentUser) {
      Swal.fire("Error", "Anda harus login untuk menyimpan proyek", "error");
      return;
    }

    if (projectFromModal) {
      // Cek duplicate
      const exists = projects.some(
        (p) => p.name === projectFromModal.name && p.category === projectFromModal.category && p.deadline === projectFromModal.deadline && p.id !== projectFromModal.id
      );
      if (exists) {
        Swal.fire("Gagal", "Proyek dengan nama, kategori, dan deadline sama sudah ada!", "error");
        return;
      }

      if (projectFromModal.id) {
        // Update
        const { data, error } = await supabase
          .from("projects")
          .update(projectFromModal)
          .eq("id", projectFromModal.id)
          .eq("user_id", currentUser.id)
          .select();
        if (error) {
          console.error(error);
          Swal.fire("Error", "Gagal update proyek", "error");
        } else {
          setProjects((prev) => prev.map((p) => (p.id === projectFromModal.id ? data[0] : p)));
          Swal.fire("Sukses", "Proyek diperbarui!", "success");
        }
      } else {
        // Insert baru
        const newProject = {
          ...projectFromModal,
          user_id: currentUser.id,
          created_at: new Date().toISOString(),
        };
        const { data, error } = await supabase.from("projects").insert([newProject]).select();
        if (error) {
          console.error(error);
          Swal.fire("Error", "Gagal menambah proyek", "error");
        } else {
          setProjects((prev) => [data[0], ...prev]);
          Swal.fire("Sukses", "Proyek disimpan!", "success");
        }
      }
      return;
    }

    // fallback form lama
    checkSomething(!!name, "Nama proyek wajib diisi");
    checkSomething(!!category, "Kategori wajib diisi");
    checkSomething(!!description, "Deskripsi wajib diisi");
    checkSomething(!!deadline, "Deadline wajib diisi");
    checkSomething(!!priority, "Prioritas wajib diisi");

    if (editId !== null) {
      const exists = projects.some(
        (p) =>
          p.name === name &&
          p.category === category &&
          p.deadline === deadline &&
          p.id !== editId
      );
      if (exists) {
        Swal.fire("Gagal", "Proyek dengan nama, kategori, dan deadline sama sudah ada!", "error");
        return;
      }

      setProjects((prev) =>
        prev.map((p) =>
          p.id === editId
            ? { ...p, name, category, description, deadline, priority }
            : p
        )
      );
      setEditId(null);
      Swal.fire("Sukses", "Proyek diperbarui!", "success");
    } else {
      const exists = projects.some(
        (p) => p.name === name && p.category === category && p.deadline === deadline
      );

      if (exists) {
        Swal.fire("Gagal", "Proyek dengan nama, kategori, dan deadline sama sudah ada!", "error");
        return;
      }

      setProjects((prev) => [
        ...prev,
        {
          id: Date.now(),
          name,
          category,
          description,
          deadline,
          priority,
          status: "Not Started",
          notes: [],
          subtasks: [],
        },
      ]);
      Swal.fire("Sukses", "Proyek ditambahkan!", "success");
    }
    clearForm();
  };

  const editProject = (p) => {
    setEditId(p.id);
    setName(p.name);
    setCategory(p.category);
    setDescription(p.description);
    setDeadline(p.deadline);
    setPriority(p.priority || "Medium");
    setViewMode("table");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleStatus = (id) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? p.status === "Completed"
            ? { ...p, status: "Not Started" }
            : p.status === "Not Started"
            ? { ...p, status: "In Progress" }
            : { ...p, status: "Completed" }
          : p
      )
    );
  };

  const confirmDelete = (id) => {
    Swal.fire({
      title: "Hapus proyek?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then((res) => {
      if (res.isConfirmed) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        Swal.fire("Dihapus!", "Proyek telah dihapus.", "success");
      }
    });
  };

  // ===================== Export / Import =====================
  const exportCSV = () => {
    if (!projects.length) {
      Swal.fire("Info", "Tidak ada data untuk diekspor!", "info");
      return;
    }
    const header = [
      "id",
      "name",
      "category",
      "description",
      "deadline",
      "priority",
      "status",
      "notes_count",
      "subtask_count",
      "progress_%",
    ];
    const rows = projects.map((p) => [
      p.id,
      p.name,
      p.category,
      `"${(p.description || "").replace(/"/g, '""')}"`,
      p.deadline,
      p.priority,
      p.status,
      p.notes.length,
      p.subtasks.length,
      getProgress(p),
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = JSON.stringify(projects, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const safeValidateProjectsArray = (arr) => {
    return (
      Array.isArray(arr) &&
      arr.every((p) => p && (p.id || typeof p.id === "number") && typeof p.name === "string")
    );
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!safeValidateProjectsArray(parsed)) throw new Error("invalid structure");

        Swal.fire({
          title: "Impor data proyek",
          text: `File berisi ${parsed.length} proyek. Pilih tindakan:`,
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: "Ganti (replace)",
          denyButtonText: "Gabungkan (merge)",
        }).then((res) => {
          if (res.isConfirmed) {
            setProjects(parsed);
            Swal.fire("Sukses", "Data berhasil diimpor (replace)!", "success");
          } else if (res.isDenied) {
            setProjects((prev) => {
              const existingById = new Set(prev.map((p) => p.id));
              const toAdd = parsed.filter((p) => !existingById.has(p.id));
              return [...prev, ...toAdd];
            });
            Swal.fire("Sukses", "Data berhasil digabungkan (merge)!", "success");
          }
        });
      } catch {
        Swal.fire("Error", "File tidak valid atau struktur tidak cocok!", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ===================== Notes & Subtasks =====================
  const openNotes = (project) => setNotesProjectId(project.id);

  const addNote = (projectId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const note = {
      id: Date.now() + Math.random(),
      text: trimmed,
      ts: new Date().toISOString(),
    };
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, notes: [...(p.notes || []), note] } : p
      )
    );
  };

  const deleteNote = (projectId, noteId) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, notes: p.notes.filter((n) => n.id !== noteId) }
          : p
      )
    );
  };

  const addSubtask = (projectId, text) => {
    if (!text.trim()) return;
    const subtask = {
      id: Date.now() + Math.random(),
      text: text.trim(),
      completed: false,
    };
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, subtasks: [...p.subtasks, subtask] }
          : p
      )
    );
    setQuickSubtasks((qs) => ({ ...qs, [projectId]: "" }));
  };

  const toggleSubtask = (projectId, subtaskId) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subtasks: p.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
              ),
            }
          : p
      )
    );
  };

  const deleteSubtask = (projectId, subtaskId) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, subtasks: p.subtasks.filter((st) => st.id !== subtaskId) }
          : p
      )
    );
  };

  // ===================== Testing Notifikasi =====================
  const testNotification = () => {
    if (!("Notification" in window)) {
      Swal.fire("Error", "Browser kamu tidak mendukung Notification API", "error");
      return;
    }

    if (Notification.permission === "denied") {
      Swal.fire("Error", "Izin notifikasi ditolak, cek setting browser", "error");
      return;
    }

    if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification("✅ Notifikasi Aktif", {
            body: "Contoh notifikasi berhasil dikirim.",
          });
          Swal.fire("Sukses", "Notifikasi test berhasil!", "success");
        } else {
          Swal.fire("Error", "Kamu menolak izin notifikasi", "error");
        }
      });
      return;
    }

    // ✅ kalau sudah granted
    new Notification("🔔 Tes Notifikasi", {
      body: "Notifikasi browser berfungsi dengan baik!",
    });
    Swal.fire("Sukses", "Notifikasi test berhasil!", "success");
  };

  // ===================== Cek Deadline Manual =====================
  const checkDeadlinesNow = () => {
    if (!projects.length) {
      Swal.fire("Info", "Belum ada proyek untuk dicek.", "info");
      return;
    }

    const lines = [];

    projects.forEach((p) => {
      if (!p.deadline) return;
      const diffDays = daysLeft(p.deadline);

      if (diffDays < 0) {
        lines.push(`❌ <b>${p.name}</b> — terlewat ${Math.abs(diffDays)} hari`);
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Deadline Terlewat!", { body: `${p.name} sudah lewat tenggat waktu.` });
        }
      } else if (diffDays <= 1) {
        lines.push(
          `⚠️ <b>${p.name}</b> — ${diffDays === 0 ? "deadline <b>hari ini</b>" : "deadline <b>besok</b>"}`
        );
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Deadline Mendekat", { body: `${p.name} berakhir dalam ${diffDays} hari.` });
        }
      }
    });

    if (lines.length) {
      Swal.fire({
        icon: "info",
        title: "Hasil cek deadline",
        html: lines.map((l) => `<div style="text-align:left;margin:.25rem 0">${l}</div>`).join(""),
      });
    } else {
      Swal.fire("Aman 🎉", "Tidak ada proyek yang terlewat atau jatuh tempo hari ini/besok.", "success");
    }
  };

  // ===================== Derived values =====================
  const editingProject = editId ? projects.find((p) => p.id === editId) : null;
  const notesProject = notesProjectId
    ? projects.find((p) => p.id === notesProjectId)
    : null;

  let displayedProjects = projects
    .filter((p) => (filterStatus ? p.status === filterStatus : true))
    .filter((p) => (filterPriority ? p.priority === filterPriority : true))
    .filter((p) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    });

  if (hideCompletedProjects)
    displayedProjects = displayedProjects.filter((p) => getProgress(p) < 100);

  if (sortProgress) {
    displayedProjects = [...displayedProjects].sort((a, b) =>
      sortProgress === "asc"
        ? getProgress(a) - getProgress(b)
        : getProgress(b) - getProgress(a)
    );
  }

  // ===================== Return all state & actions =====================
  return {
    projects, name, category, description, deadline, priority, editId, editingProject,
    filterStatus, filterPriority, query, theme, viewMode, sortProgress,
    hideCompletedProjects, notesProjectId, notesProject, quickSubtasks,
    displayedProjects, fileInputRef, showTambahModal,
    setProjects, setName, setCategory, setDescription, setDeadline, setPriority,
    setEditId, setFilterStatus, setFilterPriority, setQuery, setTheme, setViewMode,
    setSortProgress, setHideCompletedProjects, setNotesProjectId, setShowTambahModal,
    getProgress, daysLeft, isOverdue,
    clearForm, addOrUpdateProject, editProject, toggleStatus, confirmDelete,
    exportCSV, exportJSON, handleImportFile, openNotes, addNote, deleteNote,
    addSubtask, toggleSubtask, deleteSubtask,
    testNotification, checkDeadlinesNow,
    fetchProjects, // ✅ expose fetch manual
  };
}