"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getTasks as apiGetTasks } from "@/lib/api";

interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  dueDate: string | Date;
  completed: boolean;
  priority: boolean;
  dateCreated: string | Date;
  completedAt?: string | Date;
  [key: string]: any;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: boolean;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refreshTasks = useCallback(async () => {
    try {
      const data = await apiGetTasks();
      setTasks(data);
      setError(false);
    } catch (err) {
      console.error("TaskContext: Failed to fetch tasks", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTasks();
    
    // Sync tasks across tabs
    const handleStorageChange = (e: StorageEvent) => {
      const syncKeys = ["taskCreated", "taskUpdated", "taskDeleted", "taskCompleted", "taskUndone"];
      if (syncKeys.includes(e.key || "")) {
        refreshTasks();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshTasks]);

  return (
    <TaskContext.Provider value={{ tasks, loading, error, refreshTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
