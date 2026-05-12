"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Tabs from './components/tabs';
import CreateTask from './components/createTask';
import EditTask from './components/editTask';
import { BorderBeam } from './components/borderBeam';
import GlassToggle from './components/glassToggle';
import RippleLoader from './components/ripple-loader';
import DeleteTask from './components/deleteTask';
import CompleteTask from './components/completeTask';
import { Pattern } from './components/patterns/p-dropdown-menu-12';
import Checkbox from "./components/checkBox";
import { useTasks, type Task } from './context/TaskContext';

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

export default function HomePage() {
    const { tasks: allTasks, loading, error: fetchError, refreshTasks } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);
    const [activeTab, setActiveTab] = useState("all");
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [completingTask, setCompletingTask] = useState<Task | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const dispatchUpdate = (key: string) => {
        localStorage.setItem(key, Date.now().toString());
        localStorage.removeItem(key);
        refreshTasks();
    };

    const createTask = async (taskData: any) => {
        try {
            const taskWithPriority = {
                ...taskData,
                priority: activeTab === "priority" ? true : taskData.priority,
                completed: false
            };

            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taskWithPriority),
            });

            if (!res.ok) throw new Error("Failed to create task");

            setIsModalOpen(false);
            showToast("Task created successfully!");
            dispatchUpdate("taskCreated");
        } catch (err) {
            console.error(err);
            showToast('Failed to create task', 'error');
        }
    };

    const updateTask = async (updatedTask: any) => {
        try {
            const taskId = updatedTask.id || updatedTask._id;
            if (!taskId) { console.error("No task ID provided"); return; }

            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask)
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error("Server response:", errorData);
                throw new Error('Failed to update task');
            }

            setIsEditModalOpen(false);
            setEditingTask(null);
            dispatchUpdate("taskUpdated");
        } catch (error) {
            console.error('Error updating task:', error);
            showToast('Failed to update task', 'error');
        }
    };

    const togglePriority = async (task: any) => {
        const taskId = task._id || task.id;
        const updatedTask = { ...task, id: taskId, priority: !task.priority };
        await updateTask(updatedTask);
    };

    const deleteTask = async (taskId: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete task");

            setIsDeleteModalOpen(false);
            setDeletingTask(null);
            showToast("Task deleted successfully");
            dispatchUpdate("taskDeleted");
        } catch (err) {
            console.error(err);
            showToast('Failed to delete task', 'error');
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "completed", completed: true, completedAt: new Date() }),
            });

            if (!response.ok) throw new Error("Failed");

            showToast("Task marked as completed! 🎉");
            dispatchUpdate("taskCompleted");
        } catch (err) {
            console.error(err);
            showToast('Failed to complete task', 'error');
        }
    };

    const filterTasksByTab = useCallback((tasks: any[], tab: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTime = today.getTime();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);
        endOfWeek.setHours(23, 59, 59, 999);

        const isOverdue = (task: any) => {
            if (!task.dueDate) return false;
            const due = new Date(task.dueDate);
            if (task.dueTime) {
                const [hours, minutes] = task.dueTime.split(':');
                due.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            } else {
                due.setHours(23, 59, 59, 999);
            }
            return due.getTime() < Date.now();
        };

        const activeTasks = tasks.filter(task => !isOverdue(task));
        let filtered: any[] = [];

        switch (tab) {
            case "today":
                filtered = activeTasks.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate.getTime() === todayTime;
                });
                filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                break;
            case "upcoming":
                filtered = activeTasks.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate > today && taskDate <= endOfWeek;
                });
                filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                break;
            case "priority":
                filtered = activeTasks.filter(task => task.priority === true);
                filtered.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
                break;
            case "timetable":
                filtered = tasks.filter(task => task.source === "timetable");
                filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                break;
            default:
                filtered = activeTasks;
                filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        }
        return filtered;
    }, []);

    const filteredTasks = useMemo(() => {
        const activeOnly = allTasks.filter(t => !t.completed);
        return filterTasksByTab(activeOnly, activeTab);
    }, [allTasks, activeTab, filterTasksByTab]);


    return (
        <div className="flex flex-col">
            <div className='flex items-center justify-between mt-3'>
                {/* title */}
                <div className='flex flex-col'>
                    <span className='text-3xl font-bold'>Active Tasks</span>
                    <span className='text-sm text-[#92adc9] font-semibold'>
                        {activeTab === 'today' && `You have ${filteredTasks.length} tasks scheduled for today.`}
                        {activeTab === 'upcoming' && `You have ${filteredTasks.length} tasks scheduled for this week.`}
                        {activeTab === 'priority' && `You have ${filteredTasks.length} priority tasks.`}
                        {activeTab === 'all' && `You have ${filteredTasks.length} total tasks.`}
                        {activeTab === 'timetable' && `You have ${filteredTasks.length} lecture & study tasks.`}
                    </span>
                </div>
                {/* Add button */}
                <div onClick={() => setIsModalOpen(true)} className='w-26 h-10 px-2 mt-2 flex justify-center items-center bg-white rounded-xl cursor-pointer hover:shadow-[#92adc9] hover:shadow-md active:shadow-[#92adc9] active:shadow-md'>
                    <span>
                        <Image src='/add.gif' alt='' width={80} height={70} priority unoptimized style={{ width: 'auto', height: 'auto' }} />
                    </span>
                    <span className='text-black font-semibold'>Task</span>
                </div>
            </div>

            <div className='flex flex-col w-full border-b-2 border-[#233648] mt-12'>
                <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className='flex flex-col gap-4 p-6 overflow-y-auto no-scrollbar h-[calc(100vh-250px)]'>
                {fetchError && !loading && (
                    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        Tasks could not be loaded. Check your connection and try refreshing the page.
                    </div>
                )}
                {loading ? (
                    <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
                        <RippleLoader />
                        <span className="text-[#92adc9] text-xl font-semibold mt-4">Loading tasks...</span>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="w-full h-full flex flex-col gap-5 items-center justify-center">
                        <span className="text-[#92adc9] text-2xl font-semibold">No tasks available</span>
                        <span>
                            <Image src="/emptyFolder.png" alt="Blank list" width={300} height={300} />
                        </span>
                        <div onClick={() => setIsModalOpen(true)} className='w-56 h-14 px-2 mt-2 flex justify-center items-center bg-white rounded-xl cursor-pointer hover:shadow-[#92adc9] hover:shadow-md active:shadow-[#92adc9] active:shadow-md'>
                            <span>
                                <Image src='/add.gif' alt='' width={80} height={70} priority unoptimized />
                            </span>
                            <span className='text-black font-semibold'>Task</span>
                        </div>
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <div
                            key={task._id}
                            id={`task-${task._id || task.id}`}
                            className="relative flex flex-col md:grid md:grid-cols-[1fr_auto_auto] gap-4 rounded-2xl p-4 md:p-6 bg-[#152232] border border-[#233648] hover:border-blue-600/50 transition-all duration-300 group scroll-mt-24 target:ring-2 target:ring-blue-500 target:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                        >
                            <BorderBeam
                                colorFrom="#2563EB"
                                colorTo="#5085f7"
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

                            {/* Info Section */}
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
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-lg md:text-xl font-bold text-white group-hover:text-blue-400 transition-colors leading-tight truncate">
                                            {task.title}
                                        </p>
                                        {task.source === 'timetable' && task.courseCode && (
                                            <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600/20 border border-purple-500/30 text-purple-400">📚 {task.courseCode}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-[#92adc9] mt-1 line-clamp-2 md:line-clamp-none">
                                        {task.description}
                                    </p>

                                    {/* Mobile-only dates */}
                                    <div className="flex gap-3 mt-3 md:hidden">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                                            <Image src="/calendar.png" alt="" width={12} height={12} />
                                            <span className="text-[10px] font-semibold text-blue-400">
                                                Due {task.dueDate && (task.dueDate instanceof Date ? task.dueDate.toLocaleDateString() : new Date(task.dueDate).toLocaleDateString())}
                                            </span>
                                        </div>
                                        {task.remind && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                                                <Image src="/notify.png" alt="" width={12} height={12} />
                                                <span className="text-[10px] font-semibold text-purple-400">Reminding</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Dates Section */}
                            <div className="hidden md:flex flex-col items-center justify-center px-6 border-x border-[#233648]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Image src="/calendar.png" alt="" width={16} height={16} className="opacity-60" />
                                    <span className="text-xs font-semibold text-[#92adc9]">
                                        Created {task.dateCreated instanceof Date ? task.dateCreated.toLocaleDateString() : new Date(task.dateCreated).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-bold text-red-400">
                                        Due {task.dueDate && (task.dueDate instanceof Date ? task.dueDate.toLocaleDateString() : new Date(task.dueDate).toLocaleDateString())}
                                    </span>
                                    {task.dueTime && (
                                        <span className="text-[10px] font-medium text-red-400/70">
                                            @ {(() => { const [h, m] = task.dueTime.split(':'); const d = new Date(); d.setHours(+h, +m); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); })()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Controls Section */}
                            <div className="flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#233648]">
                                <div className="flex flex-col items-center gap-1">
                                    <p className="text-[10px] font-bold text-[#92adc9] uppercase tracking-wider">Reminder</p>
                                    <GlassToggle
                                        checked={task.remind || false}
                                        onChange={(checked) => {
                                            if (checked && !task.reminderDate && !task.reminderTime) {
                                                setEditingTask(task);
                                                setIsEditModalOpen(true);
                                            } else {
                                                const taskId = task._id || task.id;
                                                updateTask({ ...task, id: taskId, remind: checked });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <Pattern
                                        task={task}
                                        onEdit={(task) => {
                                            setEditingTask(task);
                                            setIsEditModalOpen(true);
                                        }}
                                        onDelete={() => {
                                            setDeletingTask(task);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        onTogglePriority={togglePriority}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <CreateTask onClose={() => setIsModalOpen(false)} onCreate={createTask} />
            )}

            {isEditModalOpen && editingTask && (
                <EditTask
                    task={editingTask}
                    onClose={() => { setIsEditModalOpen(false); setEditingTask(null); }}
                    onEdit={updateTask}
                />
            )}

            {isDeleteModalOpen && deletingTask && (
                <DeleteTask
                    task={deletingTask}
                    onClose={() => { setIsDeleteModalOpen(false); setDeletingTask(null); }}
                    onDelete={deleteTask}
                />
            )}

            {isCompleteModalOpen && completingTask && (
                <CompleteTask
                    task={completingTask}
                    onClose={() => { setIsCompleteModalOpen(false); setCompletingTask(null); }}
                    onConfirm={handleCompleteTask}
                    action="complete"
                />
            )}

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