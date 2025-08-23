// src/hooks/useProjectsSupabase.js
import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { checkSomething, daysLeft } from "../utils";
import { supabase } from "../supabaseClient";

export default function useProjectsSupabase(user) {
  // ================== State utama ==================
  const [projects, setProjects] = useState([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [editId, setEditId] = useState(null);

  // UI state
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterDeadline, setFilterDeadline] = useState(null);
  const [filterProgress, setFilterProgress] = useState(null);
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

  const [quickSubtasks, setQuickSubtasks] = useState({});

  // ===================== Effects =====================
  // Fetch projects milik user ini
  useEffect(() => {
    if (!user) {
      setProjects([]);
      return;
    }
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Gagal ambil projects:", error.message);
        return;
      }
      setProjects(data || []);
    };
    fetchProjects();
  }, [user]);

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

  // Simpan ke localStorage (cache/UI)
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
    localStorage.setItem(
      "shownNotifications",
      JSON.stringify(shownNotifications)
    );
  }, [projects, shownNotifications]);

  // Tema
  useEffect(() => {
    localStorage.setItem("pm_theme", theme);
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  // Notifikasi deadline real-time (cek tiap menit)
  useEffect(() => {
    const interval = setInterval(() => {
      projects.forEach((p) => {
        if (!p.deadline) return;
        const left = daysLeft(p.deadline);
        if (left === 1 && !shownNotifications[p.id]) {
          Swal.fire({
            toast: true,
            icon: "warning",
            title: `Deadline besok untuk ${p.name}`,
            position: "top-end",
            timer: 3000,
            showConfirmButton: false,
          });
          setShownNotifications((prev) => ({ ...prev, [p.id]: true }));
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [projects, shownNotifications]);

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
    if (!user) {
      Swal.fire("Error", "Silakan login terlebih dulu.", "error");
      return;
    }

    if (projectFromModal) {
      const toSave = { ...projectFromModal, user_id: user.id };
      const { data, error } = await supabase
        .from("projects")
        .upsert(toSave)
        .select();
      if (error) {
        console.error(error);
        Swal.fire("Error", error.message, "error");
        return;
      }
      if (data?.length) {
        setProjects((prev) => {
          const exists = prev.some((p) => p.id === data[0].id);
          return exists
            ? prev.map((p) => (p.id === data[0].id ? data[0] : p))
            : [data[0], ...prev];
        });
      }
      Swal.fire("Sukses", "Proyek disimpan!", "success");
      return;
    }

    // Form state
    checkSomething(!!name, "Nama proyek wajib diisi");
    checkSomething(!!category, "Kategori wajib diisi");
    checkSomething(!!description, "Deskripsi wajib diisi");
    checkSomething(!!deadline, "Deadline wajib diisi");
    checkSomething(!!priority, "Prioritas wajib diisi");

    if (editId !== null) {
      const updated = {
        id: editId,
        name,
        category,
        description,
        deadline,
        priority,
        user_id: user.id,
      };
      const { data, error } = await supabase
        .from("projects")
        .upsert(updated)
        .eq("user_id", user.id)
        .select();
      if (error) {
        console.error(error);
        Swal.fire("Error", error.message, "error");
        return;
      }
      if (data?.length) {
        setProjects((prev) => prev.map((p) => (p.id === editId ? data[0] : p)));
      }
      setEditId(null);
      Swal.fire("Sukses", "Proyek diperbarui!", "success");
    } else {
      const newProj = {
        id: Date.now(), // masih ada untuk kompatibilitas lama
        name,
        category,
        description,
        deadline,
        priority,
        status: "Not Started",
        notes: [],
        subtasks: [],
        attachments: [], // tambahkan field attachments default
        user_id: user.id,
      };
      const { data, error } = await supabase
        .from("projects")
        .insert([newProj])
        .select();
      if (error) {
        console.error(error);
        Swal.fire("Error", error.message, "error");
        return;
      }
      if (data?.length) setProjects((prev) => [data[0], ...prev]);
      Swal.fire("Sukses", "Proyek ditambahkan!", "success");
    }
    clearForm();
  };

  const confirmDelete = (id) => {
    Swal.fire({
      title: "Hapus proyek?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (res) => {
      if (!res.isConfirmed || !user) return;
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) {
        Swal.fire("Error", error.message, "error");
        return;
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
      Swal.fire("Dihapus!", "Proyek telah dihapus.", "success");
    });
  };

  // ===================== Notes & Subtasks =====================
  const addNote = async (projectId, text) => {
    if (!user) return;
    const base = projects.find((p) => p.id === projectId);
    if (!base) return;

    const note = { id: Date.now() + Math.random(), text, ts: new Date().toISOString() };
    const updated = { ...base, notes: [...(base.notes || []), note] };

    const { data, error } = await supabase
      .from("projects")
      .update({ notes: updated.notes })
      .eq("id", projectId)
      .eq("user_id", user.id)
      .select();

    if (error) {
      Swal.fire("Error", error.message, "error");
      return;
    }
    if (data?.length) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? data[0] : p)));
    }
  };

  const deleteNote = async (projectId, noteId) => {
    if (!user) return;
    const base = projects.find((p) => p.id === projectId);
    if (!base) return;
    const newNotes = (base.notes || []).filter((n) => n.id !== noteId);

    const { data, error } = await supabase
      .from("projects")
      .update({ notes: newNotes })
      .eq("id", projectId)
      .eq("user_id", user.id)
      .select();

    if (error) {
      Swal.fire("Error", error.message, "error");
      return;
    }
    if (data?.length) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? data[0] : p)));
    }
  };

  const addSubtask = async (projectId, text) => {
    if (!user) return;
    const base = projects.find((p) => p.id === projectId);
    if (!base) return;
    const subtask = { id: Date.now() + Math.random(), text, completed: false };
    const updated = { ...base, subtasks: [...(base.subtasks || []), subtask] };

    const { data, error } = await supabase
      .from("projects")
      .update({ subtasks: updated.subtasks })
      .eq("id", projectId)
      .eq("user_id", user.id)
      .select();

    if (error) {
      Swal.fire("Error", error.message, "error");
      return;
    }
    if (data?.length) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? data[0] : p)));
      setQuickSubtasks((qs) => ({ ...qs, [projectId]: "" }));
    }
  };

  const toggleSubtask = async (projectId, subtaskId) => {
    if (!user) return;
    const base = projects.find((p) => p.id === projectId);
    if (!base) return;

    const toggled = (base.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const { data, error } = await supabase
      .from("projects")
      .update({ subtasks: toggled })
      .eq("id", projectId)
      .eq("user_id", user.id)
      .select();

    if (error) {
      Swal.fire("Error", error.message, "error");
      return;
    }
    if (data?.length) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? data[0] : p)));
    }
  };

  const deleteSubtask = async (projectId, subtaskId) => {
    if (!user) return;
    const base = projects.find((p) => p.id === projectId);
    if (!base) return;

    const filtered = (base.subtasks || []).filter((st) => st.id !== subtaskId);

    const { data, error } = await supabase
      .from("projects")
      .update({ subtasks: filtered })
      .eq("id", projectId)
      .eq("user_id", user.id)
      .select();

    if (error) {
      Swal.fire("Error", error.message, "error");
      return;
    }
    if (data?.length) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? data[0] : p)));
    }
  };

  // ===================== Lampiran =====================
  const uploadAttachment = async (projectId, file) => {
    if (!user || !file) return;

    const filePath = `${user.id}/${projectId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("project-files")
      .upload(filePath, file);

    if (uploadError) {
      Swal.fire("Error", uploadError.message, "error");
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("project-files")
      .getPublicUrl(filePath);

    const base = projects.find((p) => p.id === projectId);
    const updated = {
      ...base,
      attachments: [...(base.attachments || []), { url: publicUrl, name: file.name }]
    };

    const { data, error } = await supabase
      .from("projects")
      .update({ attachments: updated.attachments })
      .eq("id", projectId)
      .eq("user_id", user.id)
      .select();

    if (error) {
      Swal.fire("Error", error.message, "error");
      return;
    }

    if (data?.length) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? data[0] : p)));
    }

    Swal.fire("Sukses", "Lampiran berhasil diupload!", "success");
  };

  // ===================== Extra Actions =====================
  const editProject = (project) => {
    if (!project) return;
    setEditId(project.id);
    setName(project.name);
    setCategory(project.category);
    setDescription(project.description);
    setDeadline(project.deadline);
    setPriority(project.priority);
  };

  const openNotes = (project) => {
    if (!project) return;
    setNotesProjectId(project.id);
  };

  const resetProject = async (id) => {
    if (!user) return;
    try {
      const project = projects.find((p) => p.id === id);
      if (!project) return;

      let newStatus;
      if (project.status === "Not Started") newStatus = "In Progress";
      else if (project.status === "In Progress") newStatus = "Completed";
      else newStatus = "Not Started";

      const { data, error } = await supabase
        .from("projects")
        .update({ status: newStatus })
        .eq("id", id)
        .eq("user_id", user.id)
        .select();

      if (error) throw error;
      if (data?.length) {
        setProjects((prev) => prev.map((p) => (p.id === id ? data[0] : p)));
      }
    } catch (err) {
      console.error("Gagal reset project:", err.message);
    }
  };

  // ===================== Export / Deadline =====================
  const exportCSV = () => {
    if (!projects.length) {
      Swal.fire("Info", "Tidak ada data proyek untuk diekspor.", "info");
      return;
    }
    const headers = ["id","name","category","description","deadline","priority","status","progress"];
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = projects.map((p) => {
      const progress = getProgress(p);
      return [
        p.id,
        escape(p.name),
        escape(p.category),
        escape(p.description || ""),
        p.deadline || "",
        p.priority || "",
        p.status || "",
        progress,
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `projects-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `projects-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const checkDeadlinesNow = () => {
    const urgent = projects.filter((p) => {
      if (!p.deadline) return false;
      return daysLeft(p.deadline) <= 1 && getProgress(p) < 100;
    });

    if (!urgent.length) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Tidak ada deadline mendesak 👍",
        showConfirmButton: false,
        timer: 1800,
      });
      return;
    }

    urgent.forEach((p) => {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: `Deadline segera: ${p.name} (sisa ${Math.max(
           0,
           daysLeft(p.deadline)
        )} hari)`,
        showConfirmButton: false,
        timer: 3000,
      });
    });
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

  // ===================== Return =====================
  return {
    projects,
    setProjects,
    name,
    category,
    description,
    deadline,
    priority,
    editId,
    editingProject,
    filterStatus,
    filterPriority,
    filterDeadline,
    filterProgress,
    query,
    theme,
    viewMode,
    sortProgress,
    hideCompletedProjects,
    notesProjectId,
    notesProject,
    quickSubtasks,
    displayedProjects,
    fileInputRef,
    showTambahModal,

    setName,
    setCategory,
    setDescription,
    setDeadline,
    setPriority,
    setEditId,
    setFilterStatus,
    setFilterPriority,
    setFilterDeadline,
    setFilterProgress,
    setQuery,
    setTheme,
    setViewMode,
    setSortProgress,
    setHideCompletedProjects,
    setNotesProjectId,
    setShowTambahModal,

    getProgress,
    daysLeft,
    isOverdue,

    clearForm,
    addOrUpdateProject,
    confirmDelete,
    addNote,
    deleteNote,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    editProject,
    openNotes,
    resetProject,

    exportCSV,
    exportJSON,
    checkDeadlinesNow,

    uploadAttachment, // 🔥 fitur baru
  };
}

// ======================================================
// 🔥 Tambahan: versi baru addProjectSupabaseOnly
// ======================================================
export async function addProjectSupabaseOnly({
  name,
  category,
  description,
  deadline,
  priority,
  user,
  setProjects,
}) {
  if (!user) return;

  const newProj = {
    name,
    category,
    description,
    deadline,
    priority,
    status: "Not Started",
    notes: [],
    subtasks: [],
    attachments: [],
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert([newProj])
    .select();

  if (error) {
    console.error("Error insert:", error.message);
    return null;
  }

  if (data?.length) {
    setProjects((prev) => [data[0], ...prev]);
    return data[0];
  }

  return null;
}
