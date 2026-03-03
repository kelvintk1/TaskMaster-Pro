"use client";
import {useState, useEffect} from 'react';
import Image from 'next/image';
import Header from './components/header';
import NavBar from './components/navBar';
import Tabs from './components/tabs';
import CreateTask from './components/createTask';
import { BorderBeam } from './components/borderBeam';
import GlassToggle from './components/glassToggle';
import {getTasks} from '@/lib/api';
import RippleLoader from './components/ripple-loader';

export default function HomePage() {
    const [active, setActive] = useState('today');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasksData = await getTasks();
                // Convert date strings to Date objects
                const tasksWithDates = tasksData.map((task: any) => ({
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

        fetchTasks();
    }, []);

    const createTask = async (taskData: any) => {
        try {
            const res = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
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
    const updateTask = async (taskId: string, updatedData: any) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });

            if (!res.ok) {
                throw new Error("Failed to update task");
            } else if (res.status === 200) {
                alert("Task updated successfully!");
            }

            const updatedTask = await res.json();
            setTasks((prev) => prev.map(task => task._id === taskId ? updatedTask : task));
        } catch (err) {
            console.error(err);
            alert('Failed to update task');
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete task");
            } else if (res.status === 200) {
                alert("Task deleted successfully!");
            }

            setTasks((prev) => prev.filter(task => task._id !== taskId));
        } catch (err) {
            console.error(err);
            alert('Failed to delete task');
        }
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
                        You have {tasks.length} tasks scheduled for today.
                    </span>
                 </div>
                 {/* Add button */}
                 <div onClick={() => setIsModalOpen(true)} className='w-26 h-10 px-2 mt-2 flex justify-center items-center bg-white rounded-xl cursor-pointer hover:shadow-[#92adc9] hover:shadow-md active:shadow-[#92adc9] active:shadow-md'>
                    <span className=''>
                        <Image src='/add.gif' alt='add gif' width={80} height={70} priority />
                    </span>
                    <span className='text-black font-semibold'>
                        Task
                    </span>
                 </div> 

            </div>
            <div className='flex flex-col w-full border-b-2 border-[#233648] mt-12'>
                <Tabs/>
            </div>

            <div className='flex flex-col gap-4 p-6 overflow-y-auto no-scrollbar h-[calc(100vh-250px)]'>
                {loading ? (
                    <div className="w-full h-full flex flex-col gap-2 items-center justify-center"> 
                        <RippleLoader />
                        <span className="text-[#92adc9] text-xl font-semibold mt-4">Loading tasks...</span>
                    </div>
                ) : tasks.length === 0 ? (
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
                    tasks.map(task => (
                    <div key={task._id} className="relative  grid grid-cols-[1fr_auto_auto_auto] bg-[#233648] rounded-xl p-4 px-6 shadow-md shadow-[#92adc9]">
                        <BorderBeam 
                            colorFrom="#2563EB" 
                            colorTo="#2563EB"
                            size={50}
                            duration={6}
                            borderThickness={2}
                             
                            glowIntensity={3}
                        />
                        {/* left side */} 
                        <div className="flex gap-3 items-center">
                            <div>
                                <input type="checkbox" className="w-4 h-4 mr-2 cursor-pointer" />
                            </div>
                            <div>
                                <p className="text-xl font-bold">{task.title}</p>
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
                                    Created {task.dateCreated instanceof Date ? task.dateCreated.toLocaleDateString() : new Date(task.dateCreated).toLocaleDateString()}
                                </span>
                            </div>
                            {/* Due date */}
                            <div className="flex flex-col items-center">
                                <span className="text-sm text-[#92adc9]">
                                    Due {task.dueDate && (task.dueDate instanceof Date ? task.dueDate.toLocaleDateString() : new Date(task.dueDate).toLocaleDateString()) || 'No date'}
                                </span>
                                <span className="text-sm text-[#92adc9]">
                                    @ {task.dueDate && (task.dueDate instanceof Date ? task.dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})) || 'No time'}
                                </span>
                            </div>
                        </div>
                        {/* right side */}
                        <div className="flex items-center gap-1">
                            <div>
                                <GlassToggle />
                            </div>
                            <div className="flex flex-col items-center gap-2 mr-2">
                                <span className="text-sm text-white">Edit</span>
                                <span>
                                    <Image src="/editW.png" alt="edit icon" width={30} height={30} className="cursor-pointer hover:scale-120 transform-transition duration-200"/>
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-sm text-white">Remove</span>
                                <span>
                                    <Image src="/del.png" alt="edit icon" width={30} height={30} className="cursor-pointer hover:scale-120 transform-transition duration-200"/>
                                </span>
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
        </div>
    );
}