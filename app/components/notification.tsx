"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTasks } from "../context/TaskContext";

interface Alert {
  id: string;
  title: string;
  type: "overdue" | "due-soon" | "reminder";
  message: string;
  time: string;
}

export default function Notification() {
  const { tasks, loading, error } = useTasks();
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const built: Alert[] = [];

    tasks.forEach((task: any) => {
      if (task.completed) return;

      const due = task.dueDate ? new Date(task.dueDate) : null;
      if (!due) return;

      const dueDay = new Date(due);
      dueDay.setHours(0, 0, 0, 0);

      const diffMs = due.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (dueDay < today) {
        // Overdue
        built.push({
          id: task._id || task.id,
          title: task.title,
          type: "overdue",
          message: `Overdue since ${due.toLocaleDateString()}`,
          time: due.toLocaleDateString(),
        });
      } else if (diffHours <= 24 && diffHours >= 0) {
        // Due within 24 hours
        const hrs = Math.floor(diffHours);
        const mins = Math.floor((diffHours - hrs) * 60);
        built.push({
          id: task._id || task.id,
          title: task.title,
          type: "due-soon",
          message: hrs > 0 ? `Due in ${hrs}h ${mins}m` : `Due in ${mins} minutes`,
          time: due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      } else if (task.remind && task.reminderDate) {
        const reminderDue = new Date(task.reminderDate);
        const reminderDiff = (reminderDue.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (reminderDiff >= 0 && reminderDiff <= 48) {
          built.push({
            id: `${task._id || task.id}-reminder`,
            title: task.title,
            type: "reminder",
            message: `Reminder set for ${reminderDue.toLocaleDateString()}`,
            time: task.reminderTime || reminderDue.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
        }
      }
    });

    setAlerts(built);
  }, [tasks]);

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const typeStyles: Record<string, { bg: string; dot: string; icon: string }> = {
    overdue: { bg: "bg-red-500/10 border-red-500/30", dot: "bg-red-500", icon: "/alert.png" },
    "due-soon": { bg: "bg-orange-500/10 border-orange-500/30", dot: "bg-orange-400", icon: "/time.png" },
    reminder: { bg: "bg-blue-500/10 border-blue-500/30", dot: "bg-blue-400", icon: "/notify.png" },
  };

  return (
    <div ref={panelRef} className="relative inline-flex items-center justify-center">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative flex items-center justify-center cursor-pointer group"
        aria-label="Notifications"
      >
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs bg-red-500 font-bold z-10 ring-2 ring-[#101922]">
            {alerts.length > 9 ? "9+" : alerts.length}
          </span>
        )}
        <Image
          src="/notification.png"
          alt="notifications"
          width={30}
          height={30}
          className="group-hover:scale-110 transition-transform duration-200"
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute top-10 right-0 w-80 bg-[#152232] border border-[#233648] rounded-2xl shadow-2xl shadow-black/60 z-[999] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#233648]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Notifications</span>
              {alerts.length > 0 && (
                <span className="bg-red-500 text-xs font-bold px-2 py-0.5 rounded-full">
                  {alerts.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-[#92adc9] hover:text-white text-xs cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[400px] overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#92adc9] text-xs font-medium">Checking tasks...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 px-6 text-center">
                <div className="bg-red-500/10 p-3 rounded-2xl">
                  <Image src="/notify.png" alt="error" width={32} height={32} className="opacity-80" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Connection Issue</p>
                  <p className="text-[#92adc9] text-[11px] mt-1 leading-relaxed">We couldn't reach the server. Please check your network or database whitelist.</p>
                </div>
                <button 
                  onClick={() => refreshTasks()}
                  className="mt-2 w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="bg-[#233648]/30 p-4 rounded-full">
                  <Image src="/completedWhite.png" alt="all clear" width={40} height={40} className="opacity-20" />
                </div>
                <p className="text-[#92adc9] text-sm font-medium">You're all caught up!</p>
              </div>
            ) : (
              <div className="flex flex-col p-2 gap-1.5">
                {alerts.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => {
                        const taskId = alert.id.split('-')[0]; // Handle reminder IDs like taskid-reminder
                        router.push(`/#task-${taskId}`);
                        setTimeout(() => {
                            const el = document.getElementById(`task-${taskId}`);
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 100);
                        setOpen(false);
                    }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#233648]/60 transition-all text-left cursor-pointer group"
                  >
                    <div className={`p-2 rounded-xl flex-shrink-0 ${
                      alert.type === 'overdue' ? 'bg-red-500/10' : 
                      alert.type === 'due-soon' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                    }`}>
                      <Image 
                        src={alert.type === 'overdue' ? '/calendar.png' : 
                             alert.type === 'due-soon' ? '/time.png' : '/remind1.png'} 
                        alt="type" 
                        width={20} 
                        height={20} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                          {alert.title}
                        </p>
                        <span className="text-[10px] font-medium text-[#92adc9] whitespace-nowrap">
                          {alert.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#92adc9] mt-0.5 line-clamp-2">
                        {alert.message}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-[#233648] text-center">
            <p className="text-xs text-[#92adc9]">Updates every minute</p>
          </div>
        </div>
      )}
    </div>
  );
}