"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { GlowCard } from "../components/spotlight-card";
import { CountUp } from "../components/count-up";
import { BorderBeam } from '../components/borderBeam';
import Checkbox from "../components/checkBox";
import Image from "next/image";
import CompleteTask from "../components/completeTask";
import RippleLoader from "../components/ripple-loader";
import { useTasks } from "../context/TaskContext";

// ─── Simple toast ──────────────────────────────────────────────────────────
function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white font-semibold text-sm transition-all
            ${type === 'success' ? 'bg-blue-700' : 'bg-red-600'}`}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  );
}

export default function TasksPage() {
  const { tasks: allTasks, loading, refreshTasks } = useTasks();
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completingTask, setCompletingTask] = useState(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const dispatchUpdate = (key: string) => {
    localStorage.setItem(key, Date.now().toString());
    localStorage.removeItem(key);
    refreshTasks();
  };

  const { tasks, stats } = useMemo(() => {
    if (!allTasks) return { tasks: [], stats: { total: 0, weekly: 0, overdue: 0, priority: 0 } };

    const active = allTasks.filter((t: any) =>
      t.completed === false || t.status !== "completed"
    );

    const tasksWithDates = active.map((task: any) => ({
      ...task,
      dateCreated: new Date(task.dateCreated),
      dueDate: new Date(task.dueDate),
      reminderDate: task.reminderDate ? new Date(task.reminderDate) : null
    }));

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const overdueTasks = tasksWithDates.filter(task => {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      if (task.dueTime) {
        const [hours, minutes] = task.dueTime.split(':');
        due.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else {
        due.setHours(23, 59, 59, 999);
      }
      return due.getTime() < Date.now();
    });

    overdueTasks.sort((a, b) =>
      new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );

    const startOfWeek = new Date(todayStart);
    startOfWeek.setDate(todayStart.getDate() - todayStart.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      tasks: overdueTasks,
      stats: {
        total: overdueTasks.length,
        weekly: overdueTasks.filter(task => {
          const due = new Date(task.dueDate);
          due.setHours(0, 0, 0, 0);
          return due >= startOfWeek && due <= endOfWeek;
        }).length,
        overdue: overdueTasks.length,
        priority: overdueTasks.filter(t => t.priority).length
      }
    };
  }, [allTasks]);

  const [focusedIndex, setFocusedIndex] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    if (scrollRef.current && isMobile) {
      const container = scrollRef.current;
      const middleCard = container.children[1] as HTMLElement;
      if (middleCard) {
        const scrollPos = middleCard.offsetLeft - (container.offsetWidth / 2) + (middleCard.offsetWidth / 2);
        container.scrollTo({ left: scrollPos, behavior: 'instant' });
      }
    }
  }, [tasks, isMobile]);

  const groupedTasks = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    const orderMap: { [key: string]: number } = {};

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    tasks.forEach(task => {
      const due = new Date(task.dueDate);
      const dueStr = due.toDateString();

      let key;
      let order;

      if (dueStr === todayStr) {
        key = "Today";
        order = 0;
      } else if (dueStr === yesterdayStr) {
        key = "Yesterday";
        order = 1;
      } else {
        key = due.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric"
        });
        order = -due.getTime(); // Negative for newest first sorting
      }

      if (!groups[key]) {
        groups[key] = [];
        orderMap[key] = order;
      }

      groups[key].push(task);
    });

    return Object.keys(groups)
      .sort((a, b) => orderMap[a] - orderMap[b])
      .map(key => ({
        title: key,
        tasks: groups[key].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      }));
  }, [tasks]);

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

      showToast('Task marked as completed! 🎉');
      dispatchUpdate('taskCompleted');

    } catch (error) {
      console.error('Error completing task:', error);
      showToast('Failed to complete task', 'error');
    }
  };

  return (
    <div className="p-2">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

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
      <div 
        ref={scrollRef}
        className="flex w-full items-center md:justify-around gap-8 md:gap-4 mt-8 overflow-x-auto md:overflow-visible no-scrollbar pb-10 md:pb-0 flex-nowrap md:flex-wrap snap-x snap-mandatory py-4 px-[15%] md:px-0"
      >
        <motion.div 
          className="snap-center flex-shrink-0"
          initial={isMobile ? { scale: 0.9 } : { scale: 1 }}
          whileInView={isMobile ? { scale: 1.1 } : { scale: 1 }}
          onViewportEnter={() => isMobile && setFocusedIndex(0)}
          viewport={{ amount: 0.6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <GlowCard 
            glowColor="orange" 
            focused={isTablet || (isMobile && focusedIndex === 0)}
            className="w-[200px] h-[120px] bg-[#233648]"
          >
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
        </motion.div>

        <motion.div 
          className="snap-center flex-shrink-0"
          initial={isMobile ? { scale: 0.9 } : { scale: 1 }}
          whileInView={isMobile ? { scale: 1.1 } : { scale: 1 }}
          onViewportEnter={() => isMobile && setFocusedIndex(1)}
          viewport={{ amount: 0.6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <GlowCard 
            glowColor="red" 
            focused={isTablet || (isMobile && focusedIndex === 1)}
            className="w-[200px] h-[120px] bg-[#233648]"
          >
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
        </motion.div>

        <motion.div 
          className="snap-center flex-shrink-0"
          initial={isMobile ? { scale: 0.9 } : { scale: 1 }}
          whileInView={isMobile ? { scale: 1.1 } : { scale: 1 }}
          onViewportEnter={() => isMobile && setFocusedIndex(2)}
          viewport={{ amount: 0.6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <GlowCard 
            glowColor="blue" 
            focused={isTablet || (isMobile && focusedIndex === 2)}
            className="w-[200px] h-[120px] bg-[#233648]"
          >
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
        </motion.div>
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
            <span className="text-gray-400">You&apos;re all caught up 🎉</span>
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
                <div
                  key={task._id}
                  id={`task-${task._id || task.id}`}
                  className="relative flex flex-col md:grid md:grid-cols-[1fr_auto_auto] gap-4 bg-[#152232] border border-[#233648] hover:border-red-600/30 rounded-2xl p-4 md:p-6 transition-all duration-300 group scroll-mt-24 target:ring-2 target:ring-red-500 target:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                >
                  <BorderBeam
                    colorFrom="#EF4444"
                    colorTo="#EF4444"
                    size={50}
                    duration={6}
                    borderThickness={2}
                    glowIntensity={3}
                  />

                  {task.priority && (
                    <Image
                      src="/star.gif"
                      width={32}
                      height={32}
                      alt=""
                      unoptimized
                      className="absolute -top-3 -left-3 rotate-12 z-10"
                    />
                  )}

                  <div className="flex gap-4 items-start">
                    <div className="mt-1">
                      <Checkbox
                        checked={false}
                        onChange={() => {
                          setCompletingTask(task);
                          setIsCompleteModalOpen(true);
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg md:text-xl font-bold text-white group-hover:text-red-400 transition-colors leading-tight truncate">
                        {task.title}
                      </p>
                      <p className="text-sm text-[#92adc9] mt-1 line-clamp-1">
                        {task.description || "No description"}
                      </p>

                      {/* Mobile-only status tags */}
                      <div className="flex flex-wrap gap-3 mt-3 md:hidden">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                          <span className="text-[10px] font-bold text-red-500 uppercase">Overdue</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                          <Image src="/calendar.png" alt="" width={12} height={12} />
                          <span className="text-[10px] font-semibold text-blue-400">
                            {task.dueDate.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Dates side */}
                  <div className="hidden md:flex flex-col items-center justify-center px-6 border-x border-[#233648]">
                    <div className="flex items-center gap-1.5 mb-1 opacity-60">
                      <Image src="/calendar.png" alt="" width={14} height={14} />
                      <span className="text-[10px] font-medium text-[#92adc9]">
                        Created {task.dateCreated.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-sm font-bold text-red-500">
                        Due {task.dueDate.toLocaleDateString()}
                      </span>
                      {task.dueTime && (
                        <span className="text-[10px] text-red-500/60 font-medium">
                          @ {(() => { const [h, m] = task.dueTime.split(':'); const d = new Date(); d.setHours(+h, +m); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); })()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#233648]">
                    <div className="flex flex-col items-center">
                      <p className="text-[10px] font-bold text-[#92adc9] uppercase tracking-wider mb-1">Status</p>
                      <span className="text-sm font-bold text-red-500 animate-pulse">OVERDUE</span>
                    </div>

                    <div className="flex flex-col items-center min-w-[80px]">
                      <p className="text-[10px] font-bold text-[#92adc9] uppercase tracking-wider mb-1">Reminder</p>
                      {task.reminderDate ? (
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#92adc9]">{task.reminderDate.toLocaleDateString()}</span>
                          <span className="text-[10px] text-[#92adc9]/60">Set</span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-[#92adc9]/40 italic">None</span>
                      )}
                    </div>
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