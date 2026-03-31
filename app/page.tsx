"use client";
import {useState, useEffect} from 'react';
import Image from 'next/image';
import Header from './components/header';
import NavBar from './components/navBar';
import Tabs from './components/tabs';
import CreateTask from './components/createTask';
import EditTask from './components/editTask';
import { BorderBeam } from './components/borderBeam';
import GlassToggle from './components/glassToggle';2
import {getTasks} from '@/lib/api';
import RippleLoader from './components/ripple-loader';
import DeleteTask from './components/deleteTask';
import CompleteTask from './components/completeTask';
import {Pattern} from './components/patterns/p-dropdown-menu-12';
import Checkbox from "./components/checkBox";

export default function HomePage() {
    const [active, setActive] = useState('today');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]); 
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTask, setDeletingTask] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [completingTask, setCompletingTask] = useState<any>(null);

    const fetchTasks = async () => {
        try {
            const tasksData = await getTasks();
            // Filter only incomplete tasks
            const incompleteTasks = tasksData.filter((task: any) => !task.completed);
            // Convert date strings to Date objects
            const tasksWithDates = incompleteTasks.map((task: any) => ({
                ...task,
                dateCreated: task.dateCreated ? new Date(task.dateCreated) : new Date(),
                dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
                reminderDate: task.reminderDate ? new Date(task.reminderDate) : null
            }));
            setTasks(tasksWithDates);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const createTask = async (taskData: any) => {
        try {
            // If current tab is "priority", automatically set priority to true
            const taskWithPriority = {
                ...taskData,
                priority: activeTab === "priority" ? true : taskData.priority,
                completed: false // New tasks are not completed
            };

            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(taskWithPriority),
            });

            if (!res.ok) {
                throw new Error("Failed to create task")
            } else if (res.status === 201) {
                alert("Task created successfully!");
            }

            const newTask = await res.json();
            
            // Convert date strings to Date objects
            const convertedTask = {
                ...newTask,
                dateCreated: newTask.dateCreated ? new Date(newTask.dateCreated) : new Date(),
                dueDate: newTask.dueDate ? new Date(newTask.dueDate) : new Date(),
                reminderDate: newTask.reminderDate ? new Date(newTask.reminderDate) : null
            };

            // Add new task to UI instantly
            setTasks((prev) => [convertedTask, ...prev]);
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to create task');
        };
    };

    const updateTask = async (updatedTask) => {
        try {
            console.log("Editing task:", updatedTask);
            
            // Check for both id and _id
            const taskId = updatedTask.id || updatedTask._id;
            
            if (!taskId) {
                console.error("No task ID provided");
                return;
            }

            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTask)
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                console.error("Server response:", errorData);
                throw new Error('Failed to update task');
            }
            
            const data = await response.json();
            console.log("Task updated successfully:", data);
            
            // Update local state
            setTasks(prevTasks => 
                prevTasks.map(task => {
                    const taskIdentifier = task._id || task.id;
                    if (taskIdentifier === taskId) {
                        return { 
                            ...task,
                            ...updatedTask,
                            _id: task._id,
                            id: task.id,
                            remind: updatedTask.remind,
                            reminderDate: updatedTask.reminderDate ? new Date(updatedTask.reminderDate) : task.reminderDate,
                            reminderTime: updatedTask.reminderTime || task.reminderTime,
                            dateCreated: new Date(updatedTask.dateCreated || task.dateCreated),
                            dueDate: new Date(updatedTask.dueDate || task.dueDate),
                        };
                    }
                    return task;
                })
            );
            
            setIsEditModalOpen(false);
            setEditingTask(null);
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task');
        }
    };

    const togglePriority = async (task) => {
        const taskId = task._id || task.id;
        const updatedTask = {
            ...task,
            id: taskId,
            priority: !task.priority // Toggle the priority
        };
        await updateTask(updatedTask);
    };

    const deleteTask = async (taskId: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete task");
            } else if (res.ok) {
                alert("Task deleted successfully")
            }

            // Update local state immediately (remove the deleted task)
            setTasks((prev) => prev.filter(task => task._id !== taskId));
            
            // Close the modal
            setIsDeleteModalOpen(false);
            setDeletingTask(null);
            
        } catch (err) {
            console.error(err);
            alert('Failed to delete task');
        }
    };

    // Handle task completion
    const handleCompleteTask = async (taskId: string) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: "completed",
                    completed: true,
                    completedAt: new Date(),
                }),
            });

            if (!response.ok) throw new Error("Failed");

            // Remove from active list immediately
            setTasks(prev => prev.filter(t => (t._id || t.id) !== taskId));

            // Dispatch event to notify other pages
            localStorage.setItem('taskCompleted', Date.now().toString());
            localStorage.removeItem('taskCompleted');

        } catch (err) {
            console.error(err);
            alert('Failed to complete task');
        }
    };

    // Filter tasks when activeTab or tasks change
    useEffect(() => {
        const filtered = filterTasksByTab(tasks, activeTab);
        setFilteredTasks(filtered);
    }, [activeTab, tasks]);

    // Function to calculate time difference in milliseconds
    const getTimeDifference = (dueDate: Date) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        return due.getTime() - now.getTime();
    };

    // Filter function with sorting for upcoming tasks
    const filterTasksByTab = (tasks, tab) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);
        endOfWeek.setHours(23, 59, 59, 999);

        const isOverdue = (task) => {
            const due = new Date(task.dueDate);
            due.setHours(0, 0, 0, 0);
            return due < today;
        };

        // 🚨 REMOVE overdue tasks globally
        const activeTasks = tasks.filter(task => !isOverdue(task));

        let filtered = [];

        switch (tab) {
            case "today":
                filtered = activeTasks.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate.getTime() === today.getTime();
                });
                // Sort by due time (earliest first for today)
                filtered.sort((a, b) => {
                    const timeA = new Date(a.dueDate).getTime();
                    const timeB = new Date(b.dueDate).getTime();
                    return timeA - timeB;
                });
                break;

            case "upcoming":
                // Filter tasks within this week (excluding today)
                filtered = activeTasks.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    taskDate.setHours(0, 0, 0, 0);
                    // Only include tasks from tomorrow to end of week
                    return taskDate > today && taskDate <= endOfWeek;
                });
                
                // ✅ SORT BY CLOSEST DUE DATE/TIME FIRST
                filtered.sort((a, b) => {
                    const dueA = new Date(a.dueDate).getTime();
                    const dueB = new Date(b.dueDate).getTime();
                    return dueA - dueB; // Ascending order - closest first
                });
                break;

            case "priority":
                filtered = activeTasks.filter(task => task.priority === true);
                // Sort by date created (newest first) for priority tasks
                filtered.sort((a, b) =>
                    new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
                );
                break;

            case "all":
            default:
                filtered = activeTasks;
                // Sort by date created (newest first) for all tasks
                filtered.sort((a, b) =>
                    new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
                );
        }

        return filtered;
    };

    const isDueSoon = (task) => {
        const now = new Date();
        const due = new Date(task.dueDate);
        const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diff <= 24 && diff >= 0; // within 24h
    };

    return(
        <div className="flex flex-col">
            <div className='flex items-center justify-between mt-3'>
                {/* title */}
                <div className='flex flex-col'>
                    <span className='text-3xl font-bold'>
                        Active Tasks
                    </span>
                    <span className='text-sm text-[#92adc9] font-semibold'>
                        {activeTab === 'today' && `You have ${filteredTasks.length} tasks scheduled for today.`}
                        {activeTab === 'upcoming' && `You have ${filteredTasks.length} tasks scheduled for this week.`}
                        {activeTab === 'priority' && `You have ${filteredTasks.length} priority tasks.`}
                        {activeTab === 'all' && `You have ${filteredTasks.length} total tasks.`}
                    </span>
                </div>
                {/* Add button */}
                <div onClick={() => setIsModalOpen(true)} className='w-26 h-10 px-2 mt-2 flex justify-center items-center bg-white rounded-xl cursor-pointer hover:shadow-[#92adc9] hover:shadow-md active:shadow-[#92adc9] active:shadow-md'>
                    <span className=''>
                        <Image src='/add.gif' alt='add gif' width={80} height={70} priority style={{ width: 'auto', height: 'auto' }} />
                    </span>
                    <span className='text-black font-semibold'>
                        Task
                    </span>
                </div> 
            </div>

            <div className='flex flex-col w-full border-b-2 border-[#233648] mt-12'>
                <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className='flex flex-col gap-4 p-6 overflow-y-auto no-scrollbar h-[calc(100vh-250px)]'>
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
                        {/* Add button */}
                        <div onClick={() => setIsModalOpen(true)} className='w-56 h-14 px-2 mt-2 flex justify-center items-center bg-white rounded-xl cursor-pointer hover:shadow-[#92adc9] hover:shadow-md active:shadow-[#92adc9] active:shadow-md'>
                            <span className=''>
                                <Image src='/add.gif' alt='add gif' width={80} height={70} priority />
                            </span>
                            <span className='text-black font-semibold'>
                                Task
                            </span>
                        </div>
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <div key={task._id} className={`relative grid grid-cols-[1fr_auto_auto_auto] rounded-xl p-4 px-6 bg-[#233648]`}>
                            <BorderBeam 
                                colorFrom="#2563EB" 
                                colorTo="#5085f7"
                                size={50}
                                duration={6}
                                borderThickness={2}
                                glowIntensity={3}
                            />
                            
                            {/* Priority Star - Show only if task is prioritized */}
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
                                        checked={false}
                                        onChange={() => {
                                            setCompletingTask(task);
                                            setIsCompleteModalOpen(true);
                                        }}
                                    />
                                </div>
                                <div>
                                    <p className="text-xl font-bold flex items-center gap-2">
                                        {task.title}
                                    </p>
                                    <p className="text-sm text-[#92adc9]">{task.description}</p>
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
                                        Created {task.dateCreated instanceof Date ? task.dateCreated.toLocaleDateString() : new Date(task.dateCreated).toLocaleDateString()} @ {task.dateCreated && (task.dateCreated instanceof Date ? task.dateCreated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date(task.dateCreated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})) || 'No time'}
                                    </span>
                                </div>
                                {/* Due date */}
                                <div className="flex flex-col items-center">
                                    <span className="text-sm text-[#c99292]">
                                        Due {task.dueDate && (task.dueDate instanceof Date ? task.dueDate.toLocaleDateString() : new Date(task.dueDate).toLocaleDateString()) || 'No date'}
                                    </span>
                                    <span className="text-sm text-[#c99292]">
                                        @ {task.dueDate && (task.dueDate instanceof Date ? task.dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})) || 'No time'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* right side */}
                            <div className="flex items-center gap-1">
                                <div className='flex flex-col items-center gap-2 mx-7'>
                                    <p className='text-xs font-bold'>Reminder</p>
                                    <GlassToggle 
                                        checked={task.remind || false}
                                        onChange={(checked) => {
                                            if (checked && !task.reminderDate && !task.reminderTime) {
                                                // If turning ON and no reminder date/time exists, open edit modal
                                                setEditingTask(task);
                                                setIsEditModalOpen(true);
                                            } else {
                                                // For all other cases
                                                const taskId = task._id || task.id;
                                                const updatedTask = {
                                                    ...task,
                                                    id: taskId,
                                                    remind: checked
                                                };
                                                updateTask(updatedTask);
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <Pattern 
                                        task={task}
                                        onEdit={(task) => {
                                            setEditingTask(task);
                                            setIsEditModalOpen(true);
                                        }}
                                        onDelete={(taskId) => {
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

            {isModalOpen && 
                <CreateTask 
                    onClose={() => setIsModalOpen(false)}
                    onCreate={createTask}
                />
            }

            {isEditModalOpen && editingTask && 
                <EditTask 
                    task={editingTask}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingTask(null);
                    }}
                    onEdit={updateTask}
                />
            }

            {isDeleteModalOpen && deletingTask && 
                <DeleteTask
                    task={deletingTask}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setDeletingTask(null);
                    }}
                    onDelete={deleteTask}
                />
            }

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