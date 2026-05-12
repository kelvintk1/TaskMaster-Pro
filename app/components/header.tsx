"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GradientText from "./gradient-text";
import Notification from "./notification";
import ProfileDropdown from "./profileDropdown";
import MobileMenu from "./mobileMenu";
import { useTasks } from "../context/TaskContext";

interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  dueDate?: string | Date;
  completed?: boolean;
  priority?: boolean;
}

export default function Header() {
  const router = useRouter();
  const { tasks: allTasks, loading: loadingTasks } = useTasks();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Task[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter tasks as user types
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearchOpen(false);
      return;
    }
    const q = query.toLowerCase();
    const matched = allTasks
      .filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      )
      .slice(0, 6);
    setResults(matched);
    setSearchOpen(true);
  }, [query, allTasks]);

  // Close results when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleResultClick = (task: Task) => {
    const taskId = task._id || task.id;
    const due = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = due && due < new Date() && !task.completed;
    
    let targetHref = "/";
    if (task.completed) targetHref = "/completed";
    else if (isOverdue) targetHref = "/uncompleted";
    
    // Clear search
    setQuery("");
    setSearchOpen(false);

    // Navigate and scroll
    router.push(`${targetHref}#task-${taskId}`);
    
    setTimeout(() => {
        const el = document.getElementById(`task-${taskId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  return (
    <header className="relative z-50 w-full min-h-[4.25rem] border-b border-[#1e3246] shadow-sm shadow-black/40 px-4 py-3 bg-[#101922]">
      <div className="flex items-center justify-between gap-2 lg:gap-4">

        {/* Logo & Title */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="bg-blue-700 p-1.5 rounded-lg md:rounded-xl">
            <Image src="/logo.png" alt="logo" width={20} height={20} className="md:w-[25px] md:h-[25px]" priority />
          </span>
          <span className="hidden sm:flex flex-col">
            <GradientText
              colors={["#2563EB", "#FFFFFF", "#2563EB", "#9CA3AF"]}
              animationSpeed={6}
              className="text-xl md:text-3xl font-extrabold tracking-tight"
            >
              TaskMaster Pro
            </GradientText>
            <p className="text-[10px] md:text-sm italic font-semibold text-[#92adc9]">
              Management & Productivity
            </p>
          </span>
        </div>

        {/* Search bar */}
        <div ref={searchRef} className="relative flex-1 max-w-sm lg:max-w-md mx-2">
          <div className="flex items-center gap-2 border border-[#324d67] w-full py-1.5 px-3 md:px-4 rounded-3xl bg-[#152232] focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600/40 transition-all duration-200">
            <Image
              src="/searchIcon.png"
              alt="search"
              width={16}
              height={16}
              className="flex-shrink-0 opacity-60"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (results.length > 0) setSearchOpen(true); }}
              placeholder="Search tasks..."
              className="flex-1 bg-transparent focus:outline-none text-xs md:text-sm text-white placeholder:text-[#92adc9]/60 min-w-0"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setSearchOpen(false); }}
                className="text-[#92adc9] hover:text-white text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchOpen && (
            <div className="absolute top-11 left-0 right-0 bg-[#152232] border border-[#233648] rounded-2xl shadow-2xl shadow-black/60 z-[998] overflow-hidden max-w-[calc(100vw-2rem)]">
              {loadingTasks ? (
                <div className="p-4 text-center text-sm text-[#92adc9]">Loading…</div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-sm text-[#92adc9]">
                  No tasks found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="flex flex-col">
                  <p className="text-xs text-[#92adc9] px-4 pt-3 pb-1 font-semibold uppercase tracking-wider">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </p>
                  {results.map((task) => {
                    const taskId = task._id || task.id;
                    const due = task.dueDate ? new Date(task.dueDate) : null;
                    const isOverdue = due && due < new Date() && !task.completed;
                    return (
                      <button
                        key={taskId}
                        onClick={() => handleResultClick(task)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-[#233648] transition-colors text-left w-full group"
                      >
                        <span className="text-base mt-0.5 flex-shrink-0">
                          {task.completed ? (
                            <Image src="/checkIcon.png" alt="done" width={16} height={16} />
                          ) : task.priority ? (
                            <Image src="/star.png" alt="priority" width={16} height={16} />
                          ) : isOverdue ? (
                            <Image src="/alert.png" alt="overdue" width={16} height={16} />
                          ) : (
                            <Image src="/task.png" alt="task" width={16} height={16} />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-[#92adc9] truncate">{task.description}</p>
                          )}
                          {due && (
                            <p className={`text-xs mt-0.5 ${isOverdue ? "text-red-400" : "text-[#92adc9]"}`}>
                              {isOverdue ? "Overdue · " : "Due · "}
                              {due.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span className={`text-[10px] mt-1 flex-shrink-0 px-2 py-0.5 rounded-full font-semibold ${
                          task.completed
                            ? "bg-green-500/20 text-green-400"
                            : isOverdue
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {task.completed ? "Done" : isOverdue ? "Overdue" : "Active"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-3 lg:gap-5 flex-shrink-0">
          <div className="hidden lg:flex items-center gap-5">
            <Notification />
            <ProfileDropdown />
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}