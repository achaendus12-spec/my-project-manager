// 🎨 Warna default kategori yang sudah dikenal
const defaultCategoryColors = {
  "Software": "#2563eb",  // biru
  "Bisnis": "#16a34a",    // hijau
  "Keuangan": "#f59e0b",  // kuning
  "Marketing": "#dc2626", // merah
};

// 🎨 Pilihan warna acak untuk kategori baru
const randomColors = [
  "#0ea5e9", "#22c55e", "#eab308", "#ef4444", "#8b5cf6",
  "#14b8a6", "#f97316", "#ec4899", "#6366f1", "#84cc16"
];

// Map warna kategori yang bisa diupdate
const categoryColorMap = { ...defaultCategoryColors };

// ✅ Ambil warna kategori (buat warna baru kalau belum ada)
export function getCategoryColor(category) {
  if (!categoryColorMap[category]) {
    categoryColorMap[category] =
      randomColors[Math.floor(Math.random() * randomColors.length)];
  }
  return categoryColorMap[category];
}

// ✅ Ambil semua kategori dan warna (untuk legend)
export function getAllCategoryColors() {
  return categoryColorMap;
}