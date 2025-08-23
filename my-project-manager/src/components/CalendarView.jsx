// src/components/CalendarView.jsx
import React, { useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import useProjectsSupabase from "../hooks/useProjectsSupabase";
import "./CalendarView.css";

const localizer = momentLocalizer(moment);

export default function CalendarView({ user, onEditProject }) {
  const { displayedProjects, theme, getProgress } = useProjectsSupabase(user);
  const [selected, setSelected] = useState(null);

  // Warna progress berdasarkan persentase
  const progressColor = (pr) =>
    pr >= 70 ? "#10B981" : pr >= 30 ? "#FACC15" : "#EF4444";

  // Warna outline berdasarkan prioritas
  const priorityColors = {
    High: "#DC2626",
    Medium: "#FBBF24",
    Low: "#22C55E",
  };

  // Mapping projects → events
  const events = useMemo(() => {
    if (!Array.isArray(displayedProjects)) return [];

    return displayedProjects
      .filter((p) => p.deadline)
      .map((p) => {
        const pr = getProgress(p);
        let date = moment(p.deadline, ["YYYY-MM-DD", moment.ISO_8601]);

        if (!date.isValid()) {
          date = moment(); // fallback ke hari ini
        }

        return {
          id: p.id,
          title: `${p.name} (${pr}%)`,
          progress: pr,
          category: p.category,
          status: p.status,
          priority: p.priority || "Medium",
          description: p.description,
          start: date.hour(12).toDate(),
          end: date.hour(12).toDate(),
          allDay: true,
          resource: p,
        };
      });
  }, [displayedProjects, getProgress]);

  // Style event di kalender
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: progressColor(event.progress),
      color: event.progress >= 30 && event.progress < 70 ? "black" : "white",
      borderRadius: "6px",
      border: `2px solid ${priorityColors[event.priority] || "#9CA3AF"}`,
      padding: "4px 6px",
      fontSize: "0.85rem",
      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
    };
    return { style };
  };

  // Komponen custom untuk event
  const EventComponent = ({ event }) => (
    <div>
      <div className="flex items-center gap-1">
        <span className="font-semibold">{event.title}</span>
        {event.category && (
          <span className="px-1 py-0.5 text-[10px] bg-gray-200 text-gray-700 rounded">
            {event.category}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
        <div
          className="h-1 rounded-full"
          style={{
            width: `${event.progress}%`,
            backgroundColor: progressColor(event.progress),
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <div
      className={`calendar-wrapper p-4 rounded-xl shadow bg-white dark:bg-gray-800 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block w-[14px] h-[14px] rounded bg-green-500"></span>
          <span>≥ 70% (Hijau)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-[14px] h-[14px] rounded bg-yellow-400"></span>
          <span>30% – 69% (Kuning)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-[14px] h-[14px] rounded bg-red-500"></span>
          <span>&lt; 30% (Merah)</span>
        </div>
        {Object.entries(priorityColors).map(([prio, color]) => (
          <div key={prio} className="flex items-center gap-2">
            <span
              className="inline-block w-[14px] h-[14px] rounded"
              style={{ backgroundColor: color }}
            ></span>
            <span>{prio} Priority</span>
          </div>
        ))}
      </div>

      {/* Kalender */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={(event) => setSelected(event.resource)}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
        }}
      />

      {/* Modal Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-[400px]">
            <h2 className="text-lg font-bold mb-2">
              {selected.name} ({getProgress(selected)}%)
            </h2>
            <p className="mb-1">📂 {selected.category} | ⭐ {selected.priority}</p>
            <p className="mb-1">📅 Deadline: {selected.deadline}</p>
            <p className="mb-1">📊 Status: {selected.status}</p>
            <p className="mb-2">
              📝 {selected.description || "Tidak ada deskripsi"}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${getProgress(selected)}%`,
                  backgroundColor: progressColor(getProgress(selected)),
                }}
              />
            </div>
            <span className="text-xs">{getProgress(selected)}% selesai</span>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1 bg-gray-500 text-white rounded"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  onEditProject(selected);
                  setSelected(null);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Edit Proyek
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
