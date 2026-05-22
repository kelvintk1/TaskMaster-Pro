"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { GlowCard } from "../components/spotlight-card";
import { ProgressBar } from "../components/progress-bar";
import { CountUp } from "../components/count-up";
import { BorderBeam } from '../components/borderBeam';
import Checkbox from "../components/checkBox";
import Image from "next/image";
import CompleteTask from "../components/completeTask";
import RippleLoader from "../components/ripple-loader";
import { useTasks } from "../context/TaskContext";
import { getTasksWithDates } from "../../lib/taskUtils";

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

export default function CompletedPage() {
  const { refreshTasks } = useTasks();
  const [completedTasksData, setCompletedTasksData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUndoModalOpen, setIsUndoModalOpen] = useState(false);
  const [undoingTask, setUndoingTask] = useState(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchCompletedTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks?completed=true');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setCompletedTasksData(data);
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const dispatchUpdate = (key: string) => {
    localStorage.setItem(key, Date.now().toString());
    localStorage.removeItem(key);
    refreshTasks();
  };

  const { completedTasks, stats, monthlyTotalTasks } = useMemo(() => {
    if (!completedTasksData) return { completedTasks: [], stats: { total: 0, weekly: 0, priority: 0, monthly: 0 }, monthlyTotalTasks: 0 };

    const tasksWithDates = getTasksWithDates(completedTasksData);

    tasksWithDates.sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyCompleted = tasksWithDates.filter(task => {
      const completedDate = new Date(task.completedAt);
      return completedDate >= startOfWeek;
    }).length;

    const monthlyCompleted = tasksWithDates.filter(task => {
      const completedDate = new Date(task.completedAt);
      return completedDate.getMonth() === currentMonth &&
        completedDate.getFullYear() === currentYear;
    }).length;

    const priorityCompleted = tasksWithDates.filter(task => task.priority === true).length;

    // Note: for a truly accurate monthlyTotalTasks including uncompleted, 
    // we would need a separate API call or more data. 
    // For now, we use the completed ones which are the most relevant here.
    const totalTasksThisMonth = completedTasksData.length;

    return {
      completedTasks: tasksWithDates,
      stats: {
        total: tasksWithDates.length,
        weekly: weeklyCompleted,
        priority: priorityCompleted,
        monthly: monthlyCompleted
      },
      monthlyTotalTasks: totalTasksThisMonth
    };
  }, [completedTasksData]);

  const groupedTasks = useMemo(() => {
    const groups: { title: string; tasks: any[] }[] = [];
    const map: { [key: string]: any[] } = {};

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    completedTasks.forEach(task => {
      const completedDate = new Date(task.completedAt);
      const compStr = completedDate.toDateString();

      let key;
      if (compStr === todayStr) {
        key = "Today";
      } else if (compStr === yesterdayStr) {
        key = "Yesterday";
      } else {
        key = completedDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        });
      }

      if (!map[key]) map[key] = [];
      map[key].push(task);
    });

    const sortedKeys = Object.keys(map).sort((a, b) => {
      if (a === "Today") return -1;
      if (b === "Today") return 1;
      if (a === "Yesterday") return -1;
      if (b === "Yesterday") return 1;
      return new Date(b).getTime() - new Date(a).getTime();
    });

    sortedKeys.forEach(key => {
      groups.push({
        title: key,
        tasks: map[key],
      });
    });

    return groups;
  }, [completedTasks]);

  const handleUndoTask = async (taskId: string) => {
    try {
      const taskToUndo = completedTasks.find(t => (t._id || t.id) === taskId);
      if (!taskToUndo) return;

      const updatedTask = {
        ...taskToUndo,
        completed: false,
        status: "pending",
        completedAt: null
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });

      if (!response.ok) throw new Error('Failed to undo task');

      showToast('Task moved back to active tasks!');
      dispatchUpdate('taskUndone');

    } catch (error) {
      console.error('Error undoing task:', error);
      showToast('Failed to undo task', 'error');
    }
  };

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
  }, [completedTasks, isMobile]);

  const progressValue = stats.monthly || 0;
  const progressMax = monthlyTotalTasks || 1;

  return (
    <div className="p-2">
      <div className="flex items-center justify-between">
        <span className=''>
          <p className='text-3xl font-bold'> Completed Tasks</p>
          <p className="text-blue-400">Every checkmark ✓ is a milestone. Browse your archive of accomplished tasks.</p>
        </span>

        <div className="flex items-center gap-4">
          <div className="flex flex-col justify-center gap-2">
            <span className="flex items-center justify-center gap-3 w-full">
              <span className="text-xl font-semibold">
                <CountUp
                  value={stats.monthly || 0}
                  duration={1.5}
                  colorScheme="custom"
                  customColor="#1814ee"
                  animationStyle="spring"
                  className="text-3xl"
                  numberClassName="text-3xl font-bold"
                />
              </span>
              <span className="text-sm italic">out of</span>
              <span className="text-xl font-semibold">
                <CountUp
                  value={monthlyTotalTasks}
                  duration={1.5}
                  colorScheme="custom"
                  customColor="#1814ee"
                  animationStyle="spring"
                  className="text-2xl"
                  numberClassName="text-2xl font-semibold"
                />
              </span>
            </span>
            <span className="text-center text-sm text-gray-500">
              Tasks completed for this month ({new Date().toLocaleString('default', { month: 'long' })})
            </span>
          </div>

          {/* Progress Bar with correct values */}
          {!loading && monthlyTotalTasks > 0 && (
            <div className="">
              <ProgressBar
                max={progressMax}
                min={0}
                value={progressValue}
                gaugePrimaryColor="#0804f3"
                gaugeSecondaryColor="#aebcfc54"
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

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
            glowColor='purple'
            size='lg'
            customSize
            focused={isTablet || (isMobile && focusedIndex === 0)}
            className='w-[200px] h-[120px] rounded-xl bg-[#233648]'
          >
            <div className="w-full h-full flex flex-col">
              <span className="flex justify-between">
                <p className="text-sm">Total</p>
                <Image src="/all.png" alt="all icon" width={20} height={20} />
              </span>
              <span className="text-3xl text-center font-bold text-blue-700 mt-1">
                <CountUp
                  value={stats.total || 0}
                  interactive={true}
                  colorScheme="custom"
                  customColor="#1814ee"
                  animationStyle="spring"
                />
              </span>
              <span className="text-sm text-center mt-1">Tasks Completed</span>
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
            glowColor='orange'
            size='lg'
            customSize
            focused={isTablet || (isMobile && focusedIndex === 1)}
            className='w-[200px] h-[120px] rounded-xl bg-[#233648]'
          >
            <div className="w-full h-full flex flex-col">
              <span className="flex justify-between">
                <p className="text-sm">This week</p>
                <Image src="/week.png" alt="all icon" width={20} height={20} />
              </span>
              <span className="text-3xl text-center font-bold text-blue-700 mt-1">
                <CountUp
                  value={stats.weekly || 0}
                  interactive={true}
                  colorScheme="custom"
                  customColor="#1814ee"
                  animationStyle="spring"
                />
              </span>
              <span className="text-sm text-center mt-1">Tasks Completed</span>
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
            glowColor='blue'
            size='lg'
            customSize
            focused={isTablet || (isMobile && focusedIndex === 2)}
            className='w-[200px] h-[120px] rounded-xl bg-[#233648]'
          >
            <div className="w-full h-full flex flex-col">
              <span className="flex justify-between">
                <p className="text-sm">Priority</p>
                <Image src="/star.png" alt="all icon" width={20} height={20} />
              </span>
              <span className="text-3xl text-center font-bold text-blue-700 mt-1">
                <CountUp
                  value={stats.priority || 0}
                  interactive={true}
                  colorScheme="custom"
                  customColor="#1814ee"
                  animationStyle="spring"
                />
              </span>
              <span className="text-sm text-center mt-1">Tasks Completed</span>
            </div>
          </GlowCard>
        </motion.div>
      </div>

      <div className="flex flex-col gap-4 p-6 mt-4 overflow-y-auto no-scrollbar h-[calc(100vh-350px)]">
        {loading ? (
          <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
            <RippleLoader />
            <span className="text-[#92adc9] text-xl font-semibold mt-4">Loading tasks...</span>
          </div>
        ) : completedTasks.length === 0 ? (
          <div className="w-full h-full flex flex-col gap-5 items-center justify-center">
            <span className="text-[#92adc9] text-2xl font-semibold">No completed tasks yet</span>
            <span>
              <Image src="/emptyFolder.png" alt="Blank list" width={300} height={300} />
            </span>
            <span className="text-gray-400">Complete tasks to see them here!</span>
          </div>
        ) : (
          groupedTasks.map(({ title, tasks }) => (
            <div key={title} className="flex flex-col gap-2">
              {/* Date header */}
              <div className="flex items-center gap-4">
                <span className="w-30 font-bold italic">
                  {title}
                </span>
                <div className="flex-1 border-t border-gray-500 flex justify-center" aria-hidden="true"></div>
                <span className="pl-26 flex items-center justify-end">
                  <p className="font-bold bg-black/60 rounded-full px-2">{tasks.length}</p>
                </span>
              </div>

              {/* Completed tasks for this date */}
              {(tasks || []).map(task => (
                <div
                  key={task._id}
                  id={`task-${task._id || task.id}`}
                  className="relative flex flex-col md:grid md:grid-cols-[1fr_auto_auto] gap-4 bg-[#152232] border border-[#233648] hover:border-blue-600/30 rounded-2xl p-4 md:p-6 transition-all duration-300 group scroll-mt-24 target:ring-2 target:ring-blue-500 target:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                  <BorderBeam
                    colorFrom="#2563EB"
                    colorTo="#2563EB"
                    size={50}
                    duration={6}
                    borderThickness={2}
                    glowIntensity={3}
                  />

                  {task.priority && (
                    <Image
                      src="/star.gif"
                      alt=""
                      width={32}
                      height={32}
                      unoptimized
                      className="absolute -top-3 -left-3 rotate-12 z-10"
                    />
                  )}

                  {/* Info side */}
                  <div className="flex gap-4 items-start">
                    <div className="mt-1">
                      <Checkbox
                        checked={true}
                        onChange={() => {
                          setUndoingTask(task);
                          setIsUndoModalOpen(true);
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg md:text-xl text-gray-500 font-bold group-hover:text-blue-400/70 transition-colors leading-tight line-through truncate">
                        {task.title}
                      </p>
                      <p className="text-sm text-[#92adc9]/60 mt-1 line-clamp-1">{task.description || 'No description'}</p>

                      {/* Mobile-only completion stats */}
                      <div className="flex flex-wrap gap-3 mt-3 md:hidden">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                          <Image src="/stopwatch.png" alt="" width={12} height={12} />
                          <span className="text-[10px] font-semibold text-blue-400">
                            {Math.ceil((new Date(task.completedAt).getTime() - new Date(task.dateCreated).getTime()) / (1000 * 60 * 60 * 24))}d effort
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates side (Desktop) */}
                  <div className="hidden md:flex flex-col items-center justify-center px-6 border-x border-[#233648]">
                    <div className="flex items-center gap-1.5 mb-1 opacity-60">
                      <Image src="/calendar.png" alt="" width={14} height={14} />
                      <span className="text-[10px] font-medium text-[#92adc9]">
                        Created {new Date(task.dateCreated).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs font-bold text-[#92adc9]">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      {task.dueTime && (
                        <span className="text-[10px] text-[#92adc9]/60">
                          @ {(() => { const [h, m] = task.dueTime.split(':'); const d = new Date(); d.setHours(+h, +m); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); })()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Completion side (Responsive) */}
                  <div className="flex items-center justify-between md:justify-end gap-6 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#233648]">
                    <div className="flex flex-col items-center">
                      <p className="text-[10px] font-bold text-[#92adc9] uppercase tracking-wider mb-1">Completed At</p>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-blue-400">
                          {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-blue-400/60">
                          {new Date(task.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-center">
                      <p className="text-[10px] font-bold text-[#92adc9] uppercase tracking-wider mb-1">Duration</p>
                      <span className="text-sm font-bold text-blue-400">
                        {Math.ceil((new Date(task.completedAt).getTime() - new Date(task.dateCreated).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {isUndoModalOpen && undoingTask &&
        <CompleteTask
          task={undoingTask}
          onClose={() => {
            setIsUndoModalOpen(false);
            setUndoingTask(null);
          }}
          onConfirm={handleUndoTask}
          action="undo"
        />
      }
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}