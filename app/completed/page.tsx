"use client";

import { useEffect, useState } from "react";
import { GlowCard } from "../components/spotlight-card";
import { ProgressBar } from "../components/progress-bar";
import { CountUp } from "../components/count-up"; 
import { BorderBeam } from '../components/borderBeam';
import Checkbox from "../components/checkBox";
import Image from "next/image";
import CompleteTask from "../components/completeTask";
import { getTasks } from '@/lib/api';
import RippleLoader from "../components/ripple-loader";

export default function CompletedPage() {
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUndoModalOpen, setIsUndoModalOpen] = useState(false);
  const [undoingTask, setUndoingTask] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    weekly: 0,
    priority: 0,
    monthly: 0
  });
  const [monthlyTotalTasks, setMonthlyTotalTasks] = useState(0);

  const fetchCompletedTasks = async () => {
    try {
      const tasksData = await getTasks();
      
      const completed = tasksData.filter((task: any) => 
        task.completed === true || task.status === 'completed'
      );
      
      const tasksWithDates = completed.map((task: any) => ({
        ...task,
        dateCreated: task.dateCreated ? new Date(task.dateCreated) : new Date(),
        dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
        reminderDate: task.reminderDate ? new Date(task.reminderDate) : null,
        completedAt: task.completedAt ? new Date(task.completedAt) : new Date()
      }));

      // ✅ SORT: NEWEST COMPLETED FIRST
      tasksWithDates.sort((a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
      
      setCompletedTasks(tasksWithDates);
      
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
      
      const totalTasksThisMonth = tasksData.filter((task: any) => {
        const createdDate = task.dateCreated ? new Date(task.dateCreated) : new Date();
        return createdDate.getMonth() === currentMonth && 
               createdDate.getFullYear() === currentYear;
      }).length;
      
      setMonthlyTotalTasks(totalTasksThisMonth);
      
      setStats({
        total: tasksWithDates.length,
        weekly: weeklyCompleted,
        priority: priorityCompleted,
        monthly: monthlyCompleted
      });
      
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for task completion/undo events from other tabs/windows
  useEffect(() => {
    const handleTaskUpdate = (event: StorageEvent) => {
      if (event.key === 'taskCompleted' || event.key === 'taskUndone') {
        fetchCompletedTasks(); // Refresh completed tasks
      }
    };
    
    window.addEventListener('storage', handleTaskUpdate);
    return () => window.removeEventListener('storage', handleTaskUpdate);
  }, []);

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

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

      setCompletedTasks(prev => prev.filter(task => (task._id || task.id) !== taskId));
      
      // Dispatch event to notify other components/pages
      localStorage.setItem('taskUndone', Date.now().toString());
      localStorage.removeItem('taskUndone');
      
      alert('Task moved back to active tasks!');
      
    } catch (error) {
      console.error('Error undoing task:', error);
      alert('Failed to undo task');
    }
  };

  // ✅ GROUP + KEEP ORDER (NEWEST FIRST)
  const groupTasksByDate = () => {
    const groups: { title: string; tasks: any[] }[] = [];

    const map: { [key: string]: any[] } = {};

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    completedTasks.forEach(task => {
        const completedDate = new Date(task.completedAt);

        let key;

        if (completedDate.toDateString() === today.toDateString()) {
        key = "Today";
        } else if (completedDate.toDateString() === yesterday.toDateString()) {
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

    // 🔥 ORDER GROUPS PROPERLY
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
    };

  const groupedTasks = groupTasksByDate();

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
      
      <div className="flex w-full items-center justify-around gap-4 mt-4 flex-wrap">
        <GlowCard glowColor='purple' size='lg' customSize className='w-[200px] h-[120px] rounded-xl bg-[#233648]'>
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
        <GlowCard glowColor='orange' size='lg' customSize className='w-[200px] h-[120px] rounded-xl bg-[#233648]'>
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
        <GlowCard glowColor='blue' size='lg' customSize className='w-[200px] h-[120px] rounded-xl bg-[#233648]'>
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
                <div key={task._id} className="relative grid grid-cols-[1fr_auto_auto_auto] gap-4 bg-[#233648] rounded-xl p-4 px-6">
                  <BorderBeam 
                      colorFrom="#2563EB" 
                      colorTo="#2563EB"
                      size={50}
                      duration={6}
                      borderThickness={2}
                      glowIntensity={3}
                  />
                  
                  {/* Priority Star - Show only if completed task was prioritized */}
                  {task.priority && (
                      <Image 
                          src="/star.gif" 
                          alt="priority" 
                          width={40} 
                          height={40} 
                          className="absolute -top-4 -left-3 rotate-25"
                      />
                  )}
                  
                  {/* left side */} 
                  <div className="flex gap-3 items-center">
                      <div className="flex-shrink-0">
                          <Checkbox 
                            checked={true}
                            onChange={() => {
                              setUndoingTask(task);
                              setIsUndoModalOpen(true);
                            }}
                          />
                      </div>
                      <div>
                          {/* Completed task title */}
                          <p className="text-xl text-gray-500 font-bold flex items-center gap-2">
                              {task.title}
                          </p>
                          {/* Completed task description */}
                          <p className="text-sm text-[#92adc9]">{task.description || 'No description'}</p>
                      </div>
                  </div>
                  
                  {/* middle side */}
                  <div className="flex flex-col items-center">
                      {/* Date created */}
                      <div className="flex items-center gap-1">
                          <span>
                              <Image src="/calendar.png" alt="calendar icon" width={18} height={18} />
                          </span>
                          <span className="text-sm text-[#92adc9]">
                              Created {task.dateCreated instanceof Date ? task.dateCreated.toLocaleDateString() : new Date(task.dateCreated).toLocaleDateString()}
                          </span>
                      </div>
                      {/* Due date */}
                      <div className="flex flex-col items-center">
                          <span className="text-sm text-[#92adc9]">
                              Due {task.dueDate instanceof Date ? task.dueDate.toLocaleDateString() : new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-[#92adc9]">
                              @ {task.dueDate instanceof Date ? task.dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                      </div>
                  </div>
                  
                  {/* right side */}
                  <div className="flex flex-col items-center">
                      {/* Date Completed */}
                      <div className="flex flex-col justify-center items-center">
                          <span>
                              <Image src="/stopwatch.png" alt="calendar icon" width={20} height={20} />
                          </span>
                          <span className="text-center text-sm text-[#c99292]">
                            Completed {task.completedAt instanceof Date ? task.completedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date(task.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                      </div>
                      {/* Duration */}
                      <div className="flex gap-2 items-center">
                          <span className="text-sm text-center text-[#c99292] pl-6">
                              Duration: {Math.ceil((new Date(task.completedAt).getTime() - new Date(task.dateCreated).getTime()) / (1000 * 60 * 60 * 24))} days
                          </span>
                      </div>
                  </div>
                  {/* last side - Reminder status */}
                  <div className="text-sm text-[#92adc9]">
                    {task.remind && task.reminderDate ? (
                      <span className="flex flex-col justify-center items-center">
                        <span>
                          <Image src="/remind1.png" alt="reminder icon" width={18} height={18} />
                        </span>
                        <p>Reminded {new Date(task.reminderDate).toLocaleDateString()}</p>
                        <p>@ {task.reminderTime || 'No time'}</p>
                      </span>
                    ) : (
                      <span className="flex flex-col items-center justify-center gap-2">
                        <span>
                          <Image src="/remind.png" alt="reminder icon" width={18} height={18} />
                        </span>
                        <p>Not Reminded</p>
                      </span>
                    )}
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
    </div>
  );
}