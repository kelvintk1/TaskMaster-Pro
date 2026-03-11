"use client";

import React from 'react'; 
import { useRef, useEffect, useState } from "react";
import Image from 'next/image';
import GlassToggle from './glassToggle';
import NotificationPicker from './notficationPicker';
import { GlowCard } from './spotlight-card';

type Props = {
    onClose: () => void;
    task: any;
    onEdit: (updatedTask: any) => void;
}

// Helper function to format date for input fields (YYYY-MM-DD)
const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    } catch {
        return "";
    }
};

// Helper function to format time for input fields (HH:MM)
const formatTimeForInput = (timeString: string) => {
    if (!timeString) return "";
    try {
        // If it's a full date string, extract time
        if (timeString.includes('T')) {
            return timeString.split('T')[1]?.substring(0, 5) || "";
        }
        // If it's just time string, return as is
        return timeString.substring(0, 5);
    } catch {
        return "";
    }
};

export default function EditTask({onClose, onEdit, task}: any) { 
    const dateRef = useRef<HTMLInputElement>(null);
    const timeRef = useRef<HTMLInputElement>(null);
    const reminderDateRef = useRef<HTMLInputElement>(null);
    const reminderTimeRef = useRef<HTMLInputElement>(null);
    
    // Format dates properly for input fields
    const [title, setTitle] = useState(task?.title || "");
    const [description, setDescription] = useState(task?.description || "");
    const [dueDate, setDueDate] = useState(formatDateForInput(task?.dueDate) || task?.dueDate?.split('T')[0] || "");
    const [dueTime, setDueTime] = useState(formatTimeForInput(task?.dueTime || task?.dueDate) || "");
    const [remind, setRemind] = useState(task?.remind || false);
    const [reminderDate, setReminderDate] = useState(formatDateForInput(task?.reminderDate) || "");
    const [reminderTime, setReminderTime] = useState(formatTimeForInput(task?.reminderTime) || "");
    const [priority, setPriority] = useState(task?.priority || false);

    useEffect(() => {
        // Update form when task changes
        if (task) {
            setTitle(task.title || "");
            setDescription(task.description || "");
            setDueDate(formatDateForInput(task.dueDate) || task.dueDate?.split('T')[0] || "");
            setDueTime(formatTimeForInput(task.dueTime || task.dueDate) || "");
            setRemind(task.remind || false);
            setReminderDate(formatDateForInput(task.reminderDate) || "");
            setReminderTime(formatTimeForInput(task.reminderTime) || "");
            setPriority(task.priority || false);
        }
    }, [task]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Make sure we have the task ID
        if (!task?.id && !task?._id) {
            console.error("No task ID found");
            return;
        }

        const updatedTask = {
            id: task?.id || task?._id, // Handle both id and _id
            title,
            description,
            dueDate: dueDate,
            dueTime,
            remind,
            reminderDate: reminderDate,
            reminderTime,
            priority
        };

        console.log("Submitting updated task:", updatedTask); // Debug log
        onEdit(updatedTask);
    };

    return(
        <div onClick={onClose} className="fixed top-0 right-0 left-0 w-screen h-screen flex justify-center items-center py-8 bg-black/90">
            {/* Modal */}
            <div onClick={(e) => e.stopPropagation()}>
                <GlowCard glowColor='orange' size='lg' customSize className='w-[500px] p-6 rounded-xl bg-[#233648]'>
                    {/* header */}
                    <div className='w-full flex gap-6 justify-between items-center border-b-1 border-blue-700 rounded-2xl px-4 py-2'>
                        <span className='text-2xl font-bold flex items-center justify-start gap-2'>
                            <Image src="/editIcon.png" alt='create icon' width={27} height={27} className='inline-block ml-2'/>
                            <p>Edit Task</p>
                        </span>
                        <span onClick={onClose} className='flex items-center justify-end'>
                            <Image src='/closeB.png' alt='close icon' width={30} height={30} onClick={onClose} className='cursor-pointer hover:rotate-90 active:scale-120 transform-transition duration-200'/>
                        </span>
                    </div>
                    {/* Forms */}
                    <div className='mt-6 flex flex-col gap-4'>
                        <span>
                            <p className="text-md font-semibold">Title</p>
                            <input type='text' placeholder='Task Title' value={title} onChange={(e) => setTitle(e.target.value)} className='w-full h-10 rounded-md bg-[#233648] mt-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600'/>
                        </span>
                        <span>
                            <p className="text-md font-semibold">Description</p>
                            <textarea placeholder='Provide details of your task.' value={description} onChange={(e) => setDescription(e.target.value)} className='w-full h-28 rounded-md bg-[#233648] mt-2 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-600'/>
                        </span>
                        <div className="flex items-center justify-between">
                            <span>
                                <p>Due Date</p>
                                <span className="rounded-md bg-[#233648] mt-2 px-1 flex items-center gap-2 
                                    focus-within:ring-2 focus-within:ring-blue-600"
                                    onClick={() => dateRef.current?.showPicker()}
                                >
                                    <button
                                        type="button"
                                        className="cursor-pointer pl-2 hover:scale-110 transform-transition duration-200"
                                    >
                                        <Image src="/calendar.png" alt="calendar icon" width={20} height={20} />
                                    </button>
                                    <input
                                        ref={dateRef}
                                        type="date"
                                        className="ml-2 w-40 h-10 text-sm bg-transparent focus:outline-none"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </span>
                            </span>
                            <span>
                                <p>Time</p>
                                <span
                                    onClick={() => {
                                        timeRef.current?.showPicker?.();
                                        timeRef.current?.focus();
                                    }}
                                    className="rounded-md bg-[#233648] mt-2 px-1 flex items-center gap-2 
                                            cursor-pointer focus-within:ring-2 focus-within:ring-blue-600"
                                >
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            timeRef.current?.showPicker?.();
                                            timeRef.current?.focus();
                                        }}
                                        className="cursor-pointer pl-2 hover:scale-110 transition-transform duration-200"
                                    >
                                        <Image src="/time.png" alt="time icon" width={20} height={20} />
                                    </button>
                                    <input
                                        ref={timeRef}
                                        type="time"
                                        className="ml-2 w-40 h-10 text-sm bg-transparent focus:outline-none text-gray-200"
                                        value={dueTime}
                                        onChange={(e) => setDueTime(e.target.value)}
                                    />
                                </span>
                            </span>
                        </div>
                        
                        {/* Notification Picker with proper date/time handling */}
                        <div className='w-full flex items-center mt-2'>
                            <div className="w-full">
                                <p className="text-md font-semibold mb-2">Choose when to be reminded</p>
                                <div className="flex gap-4">
                                    <span className="flex-1">
                                        <span className="rounded-md bg-[#233648] px-1 flex items-center gap-2 
                                            focus-within:ring-2 focus-within:ring-blue-600"
                                            onClick={() => reminderDateRef.current?.showPicker()}
                                        >
                                            <button
                                                type="button"
                                                className="cursor-pointer pl-2 hover:scale-110 transform-transition duration-200"
                                            >
                                                <Image src="/calendar.png" alt="calendar icon" width={20} height={20} />
                                            </button>
                                            <input
                                                ref={reminderDateRef}
                                                type="date"
                                                className="ml-2 w-full h-10 text-sm bg-transparent focus:outline-none"
                                                value={reminderDate}
                                                onChange={(e) => setReminderDate(e.target.value)}
                                            />
                                        </span>
                                    </span>
                                    <span className="flex-1">
                                        <span
                                            onClick={() => {
                                                reminderTimeRef.current?.showPicker?.();
                                                reminderTimeRef.current?.focus();
                                            }}
                                            className="rounded-md bg-[#233648] px-1 flex items-center gap-2 
                                                    cursor-pointer focus-within:ring-2 focus-within:ring-blue-600"
                                        >
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    reminderTimeRef.current?.showPicker?.();
                                                    reminderTimeRef.current?.focus();
                                                }}
                                                className="cursor-pointer pl-2 hover:scale-110 transition-transform duration-200"
                                            >
                                                <Image src="/time.png" alt="time icon" width={20} height={20} />
                                            </button>
                                            <input
                                                ref={reminderTimeRef}
                                                type="time"
                                                className="ml-2 w-full h-10 text-sm bg-transparent focus:outline-none text-gray-200"
                                                value={reminderTime}
                                                onChange={(e) => setReminderTime(e.target.value)}
                                            />
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className='w-full flex px-10 mt-4'>
                            <button 
                                type='submit'
                                onClick={handleSubmit}
                                className='flex items-center justify-center w-full h-10 bg-blue-600 cursor-pointer rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200'>
                                <Image src="/checkIcon.png" alt='check icon' width={25} height={25} className='inline-block mr-2'/>
                                <span className='text-white font-semibold'>Update Task</span>
                            </button>
                        </div>
                    </div>
                </GlowCard>
            </div>
        </div>
    )
}