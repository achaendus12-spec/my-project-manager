// src/utils.js
import * as invariant from "invariant";

// Utility untuk validasi kondisi
export function checkSomething(condition, message) {
  if (typeof invariant === "function") {
    invariant(condition, message);
  } else if (invariant && typeof invariant.default === "function") {
    invariant.default(condition, message);
  } else {
    throw new Error("Invariant tidak tersedia.");
  }
}

// Utility untuk menghitung sisa hari menuju deadline
export function daysLeft(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const deadline = new Date(dateStr + "T23:59:59");
  return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
}

// Utility untuk gabung className (mirip Tailwind merge sederhana)
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
