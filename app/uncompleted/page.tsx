"use client";

import { useEffect, useState } from "react";
import { GlowCard } from "../components/spotlight-card";
import { CountUp } from "../components/count-up";
import { BorderBeam } from '../components/borderBeam';
import Checkbox from "../components/checkBox";
import Image from "next/image";
import CompleteTask from "../components/completeTask";
import { getTasks } from '@/lib/api';
import RippleLoader from "../components/ripple-loader";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completingTask, setCompletingTask] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    weekly: 0,
    overdue: 0,
    priority: 0
  });

  const fetchTasks = async () => {
    try {
      const data = await getTasks();

      // Only active/uncompleted tasks
      const active = data.filter((t: any) =>
        t.completed === false || t.status !== "completed"
      );

      const tasksWithDates = active.map((task: any) => ({
        ...task,
        dateCreated: new Date(task.dateCreated),
        dueDate: new Date(task.dueDate),
        reminderDate: task.reminderDate ? new Date(task.reminderDate) : null
      }));

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // ✅ ONLY OVERDUE TASKS
      const overdueTasks = tasksWithDates.filter(task => {
        const due = new Date(task.dueDate);
        due.setHours(0, 0, 0, 0);
        return due < now;
      });

      // ✅ SORT: NEWEST OVERDUE FIRST
      overdueTasks.sort((a, b) =>
        new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      );

      setTasks(overdueTasks);

      // START OF WEEK
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      // END OF WEEK
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      setStats({
        total: overdueTasks.length,

        // ✅ overdue tasks within this week
        weekly: overdueTasks.filter(task => {
          const due = new Date(task.dueDate);
          due.setHours(0, 0, 0, 0);
          return due >= startOfWeek && due <= endOfWeek;
        }).length,

        overdue: overdueTasks.length,
        priority: overdueTasks.filter(t => t.priority).length
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Listen for task completion events from other tabs/windows
  useEffect(() => {
    const handleTaskUpdate = (event: StorageEvent) => {
      if (event.key === 'taskCompleted' || event.key === 'taskUndone') {
        fetchTasks(); // Refresh uncompleted tasks
      }
    };
    
    window.addEventListener('storage', handleTaskUpdate);
    return () => window.removeEventListener('storage', handleTaskUpdate);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

  // ✅ SIMPLE SORT (NEWEST OVERDUE FIRST)
  const sortTasks = (tasks: any[]) => {
    return [...tasks].sort((a, b) =>
      new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );
  };

  // ✅ GROUPING (kept your UI logic, but clean sorting)
  const groupTasksByDate = () => {
    const groups: { [key: string]: any[] } = {};
    const orderMap: { [key: string]: number } = {};

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    tasks.forEach(task => {
      const due = new Date(task.dueDate);

      let key;
      let order;

      if (due.toDateString() === today.toDateString()) {
        key = "Today";
        order = 0;
      } else if (due.toDateString() === yesterday.toDateString()) {
        key = "Yesterday";
        order = 1;
      } else {
        key = due.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric"
        });

        order = due.getTime();
      }

      if (!groups[key]) {
        groups[key] = [];
        orderMap[key] = order;
      }

      groups[key].push(task);
    });

    // ✅ apply new sorting inside each group
    Object.keys(groups).forEach(key => {
      groups[key] = sortTasks(groups[key]);
    });

    return Object.keys(groups)
      .sort((a, b) => orderMap[a] - orderMap[b])
      .map(key => ({
        title: key,
        tasks: groups[key]
      }));
  };

  const groupedTasks = groupTasksByDate();

  const handleCompleteTask = async (taskId: string) => {
    try {
      const taskToComplete = tasks.find(t => (t._id || t.id) === taskId);
      if (!taskToComplete) return;

      const updatedTask = {
        ...taskToComplete,
        completed: true,
        status: "completed",
        completedAt: new Date().toISOString()
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });

      if (!response.ok) throw new Error('Failed to complete task');
      
      // Dispatch event to notify other components/pages
      localStorage.setItem('taskCompleted', Date.now().toString());
      localStorage.removeItem('taskCompleted');
      
      // Refresh the current page
      await fetchTasks();
      
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task');
    }
  };

  return (
    <div className="p-2">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <span>
          <p className="text-3xl font-bold">Uncompleted Tasks</p>
          <p className="text-orange-400">
            Stay consistent. Small steps today lead to big wins tomorrow.
          </p>
        </span>
      </div>

      {/* CARDS */}
      <div className="flex w-full items-center justify-around gap-4 mt-4 flex-wrap">

        <GlowCard glowColor="orange" className="w-[200px] h-[120px] bg-[#233648]">
          <div className="flex flex-col">
            <span className="flex justify-between">
              <p className="text-sm">This Week</p>
              <Image src="/week.png" width={20} height={20} alt="" />
            </span>
            <span className="text-3xl text-center font-bold text-orange-400 mt-1">
              <CountUp value={stats.weekly} />
            </span>
          </div>
        </GlowCard>

        <GlowCard glowColor="red" className="w-[200px] h-[120px] bg-[#233648]">
          <div className="flex flex-col">
            <span className="flex justify-between">
              <p className="text-sm">Overdue</p>
              <Image src="/calendar.png" width={20} height={20} alt="" />
            </span>
            <span className="text-3xl text-center font-bold text-red-400 mt-1">
              <CountUp value={stats.overdue} />
            </span>
          </div>
        </GlowCard>

        <GlowCard glowColor="blue" className="w-[200px] h-[120px] bg-[#233648]">
          <div className="flex flex-col">
            <span className="flex justify-between">
              <p className="text-sm">Priority</p>
              <Image src="/star.png" width={20} height={20} alt="" />
            </span>
            <span className="text-3xl text-center font-bold text-blue-400 mt-1">
              <CountUp value={stats.priority} />
            </span>
          </div>
        </GlowCard>

      </div>

      {/* TASK LIST */}
      <div className="flex flex-col gap-4 p-6 mt-4 overflow-y-auto no-scrollbar h-[calc(100vh-320px)]">

        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <RippleLoader />
            <span className="text-[#92adc9] text-xl font-semibold mt-4">Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Image src="/emptyFolder.png" width={300} height={300} alt="" />
            <span className="text-gray-400">You're all caught up 🎉</span>
          </div>
        ) : (
          groupedTasks.map(group => (
            <div key={group.title} className="flex flex-col gap-2">

              {/* HEADER */}
              <div className="flex items-center gap-4">
                <span className="w-30 font-bold italic">{group.title}</span>
                <div className="flex-1 border-t border-gray-500"></div>
                <span>
                  <p className="font-bold bg-black/60 rounded-full px-2">
                    {group.tasks.length}
                  </p>
                </span>
              </div>

              {/* TASKS */}
              {group.tasks.map(task => (
                <div key={task._id}
                  className="relative grid grid-cols-[1fr_auto_auto_auto] gap-4 bg-[#233648] rounded-xl p-4 px-6"
                >
                  <BorderBeam />

                  {task.priority && (
                    <Image
                      src="/star.gif"
                      width={40}
                      height={40}
                      alt=""
                      className="absolute -top-4 -left-3"
                    />
                  )}

                  <div className="flex gap-3 items-center">
                    <Checkbox
                      checked={false}
                      onChange={() => {
                        setCompletingTask(task);
                        setIsCompleteModalOpen(true);
                      }}
                    />
                    <div>
                      <p className="text-xl font-bold">{task.title}</p>
                      <p className="text-sm text-[#92adc9]">
                        {task.description || "No description"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-sm text-[#92adc9]">
                    <p>Created {task.dateCreated.toLocaleDateString()}</p>
                    <p>Due {task.dueDate.toLocaleDateString()}</p>
                    <p>@ {task.dueDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                  </div>

                  <div className="text-sm text-[#c99292] text-center">
                    Overdue
                  </div>

                  <div className="text-sm text-[#92adc9] text-center">
                    {task.reminderDate ? (
                      <>
                        <p>Reminds</p>
                        <p>{task.reminderDate.toLocaleDateString()}</p>
                      </>
                    ) : (
                      <p>No Reminder</p>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {isCompleteModalOpen && completingTask && (
        <CompleteTask
          task={completingTask}
          onClose={() => {
            setIsCompleteModalOpen(false);
            setCompletingTask(null);
          }}
          onConfirm={handleCompleteTask}
          action="complete"
        />
      )}
    </div>
  );
}