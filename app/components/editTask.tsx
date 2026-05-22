"use client";

import React from 'react'; 
import { useRef, useEffect, useState } from "react";
import Image from 'next/image';
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
    
    // Initialize with empty strings, then update in useEffect
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [remind, setRemind] = useState(false);
    const [reminderDate, setReminderDate] = useState("");
    const [reminderTime, setReminderTime] = useState("");
    const [priority, setPriority] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [touched, setTouched] = useState<{[key: string]: boolean}>({});

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

    // Clear reminder field errors when both fields are cleared
    useEffect(() => {
        if (!reminderDate && !reminderTime) {
            // If both are empty, remove any reminder errors
            const newErrors = {...errors};
            delete newErrors.reminderDate;
            delete newErrors.reminderTime;
            setErrors(newErrors);
        }
    }, [reminderDate, reminderTime]);

    // Validate form on every change
    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        
        // Required fields validation
        if (!title.trim()) {
            newErrors.title = "Title is required";
        }
        if (!description.trim()) {
            newErrors.description = "Description is required";
        }
        if (!dueDate) {
            newErrors.dueDate = "Due date is required";
        }
        if (!dueTime) {
            newErrors.dueTime = "Due time is required";
        }
        
        // Reminder validation - if one is filled, both must be filled
        if ((reminderDate && !reminderTime) || (!reminderDate && reminderTime)) {
            newErrors.reminderDate = "Both reminder date and time are required";
            newErrors.reminderTime = "Both reminder date and time are required";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Check if form is valid for button state
    const isFormValid = () => {
        const requiredFieldsValid = title.trim() && description.trim() && dueDate && dueTime;
        
        // Check reminder mutual requirement
        const reminderValid = !((reminderDate && !reminderTime) || (!reminderDate && reminderTime));
        
        return requiredFieldsValid && reminderValid;
    };

    // Handle field blur for validation messages
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateForm();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid()) {
            // Mark all fields as touched to show errors
            setTouched({
                title: true,
                description: true,
                dueDate: true,
                dueTime: true,
                reminderDate: true,
                reminderTime: true
            });
            validateForm();
            return;
        }

        // Check for both id and _id
        const taskId = task?.id || task?._id;
        
        if (!taskId) {
            console.error("No task ID found");
            return;
        }

        // Determine if reminder should be ON based on reminder fields (both must be present)
        const remind = !!(reminderDate && reminderTime);

        const updatedTask = {
            id: taskId,
            _id: task?._id,
            title,
            description,
            dueDate: dueDate,
            dueTime,
            remind,
            reminderDate: reminderDate,
            reminderTime: reminderTime,
            priority
        };

        console.log("Submitting updated task:", updatedTask);
        onEdit(updatedTask);
    };

    return(
        <div onClick={onClose} className="fixed inset-0 flex justify-center items-center p-4 bg-black/90 z-50">
            {/* Modal */}
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl mx-auto">
                <GlowCard glowColor='orange' size='lg' customSize className='w-full max-h-[95vh] p-4 sm:p-6 rounded-xl bg-[#233648] flex flex-col overflow-hidden'>
                    {/* header */}
                    <div className='w-full flex gap-4 justify-between items-center border-b-2 border-blue-700/50 rounded-2xl px-3 mb-4 flex-shrink-0'>
                        <span className='text-xl sm:text-2xl font-bold flex items-center gap-2'>
                            <Image src="/editIcon.png" alt='create icon' width={27} height={27} className='w-6 h-6 sm:w-7 sm:h-7' />
                            <p>Edit Task</p>
                        </span>
                        <button onClick={onClose} className='p-1 hover:rotate-90 transition-transform duration-200 active:scale-110' aria-label="Close">
                            <Image src='/closeB.png' alt='close icon' width={30} height={30} className='w-7 h-7 sm:w-8 sm:h-8' />
                        </button>
                    </div>
                    
                    {/* Forms - Scrollable content with custom scrollbar */}
                    <div className='flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar'>
                        {/* Title Field */}
                        <div>
                            <label className="text-sm sm:text-md font-semibold block mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type='text' 
                                placeholder='Task Title' 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={() => handleBlur('title')}
                                className={`w-full h-10 rounded-lg bg-[#1e2e3d] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all
                                    ${touched.title && errors.title ? 'ring-2 ring-red-500' : 'border border-blue-900/30'}`}
                            />
                            {touched.title && errors.title && 
                                <p className="text-red-400 text-xs mt-1">{errors.title}</p>
                            }
                        </div>

                        {/* Description Field */}
                        <div>
                            <label className="text-sm sm:text-md font-semibold block mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea 
                                placeholder='Provide details of your task.' 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={() => handleBlur('description')}
                                className={`w-full h-24 sm:h-28 rounded-lg bg-[#1e2e3d] p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all
                                    ${touched.description && errors.description ? 'ring-2 ring-red-500' : 'border border-blue-900/30'}`}
                            />
                            {touched.description && errors.description && 
                                <p className="text-red-400 text-xs mt-1">{errors.description}</p>
                            }
                        </div>

                        {/* Due Date and Time - Responsive layout */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="text-sm sm:text-md font-semibold block mb-1">
                                    Due Date <span className="text-red-500">*</span>
                                </label>
                                <div 
                                    className={`flex items-center rounded-lg bg-[#1e2e3d] px-2 focus-within:ring-2 focus-within:ring-blue-600 transition-all
                                        ${touched.dueDate && errors.dueDate ? 'ring-2 ring-red-500' : 'border border-blue-900/30'}`}
                                    onClick={() => dateRef.current?.showPicker()}
                                >
                                    <button
                                        type="button"
                                        className="cursor-pointer p-2 hover:scale-110 transition-transform duration-200 flex-shrink-0"
                                        aria-label="Select date"
                                    >
                                        <Image src="/calendar.png" alt="calendar" width={18} height={18} className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <input
                                        ref={dateRef}
                                        type="date"
                                        className="w-full h-10 text-sm bg-transparent focus:outline-none px-2"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        onBlur={() => handleBlur('dueDate')}
                                    />
                                </div>
                                {touched.dueDate && errors.dueDate && 
                                    <p className="text-red-400 text-xs mt-1">{errors.dueDate}</p>
                                }
                            </div>
                            <div className="flex-1">
                                <label className="text-sm sm:text-md font-semibold block mb-1">
                                    Time <span className="text-red-500">*</span>
                                </label>
                                <div
                                    onClick={() => {
                                        timeRef.current?.showPicker?.();
                                        timeRef.current?.focus();
                                    }}
                                    className={`flex items-center rounded-lg bg-[#1e2e3d] px-2 cursor-pointer focus-within:ring-2 focus-within:ring-blue-600 transition-all
                                        ${touched.dueTime && errors.dueTime ? 'ring-2 ring-red-500' : 'border border-blue-900/30'}`}
                                >
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            timeRef.current?.showPicker?.();
                                            timeRef.current?.focus();
                                        }}
                                        className="cursor-pointer p-2 hover:scale-110 transition-transform duration-200 flex-shrink-0"
                                        aria-label="Select time"
                                    >
                                        <Image src="/time.png" alt="time" width={18} height={18} className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <input
                                        ref={timeRef}
                                        type="time"
                                        className="w-full h-10 text-sm bg-transparent focus:outline-none px-2 text-gray-200"
                                        value={dueTime}
                                        onChange={(e) => setDueTime(e.target.value)}
                                        onBlur={() => handleBlur('dueTime')}
                                    />
                                </div>
                                {touched.dueTime && errors.dueTime && 
                                    <p className="text-red-400 text-xs mt-1">{errors.dueTime}</p>
                                }
                            </div>
                        </div>
                        
                        {/* Reminder Section */}
                        <div className="space-y-2">
                            <label className="text-sm sm:text-md font-semibold block">
                                Choose when to be reminded <span className="text-gray-400 text-xs">(Optional)</span>
                            </label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div 
                                        className={`flex items-center rounded-lg bg-[#1e2e3d] px-2 focus-within:ring-2 focus-within:ring-blue-600 transition-all
                                            ${touched.reminderDate && errors.reminderDate ? 'ring-2 ring-red-500' : 'border border-blue-900/30'}`}
                                        onClick={() => reminderDateRef.current?.showPicker()}
                                    >
                                        <button
                                            type="button"
                                            className="cursor-pointer p-2 hover:scale-110 transition-transform duration-200 flex-shrink-0"
                                            aria-label="Select reminder date"
                                        >
                                            <Image src="/calendar.png" alt="calendar" width={18} height={18} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                        <input
                                            ref={reminderDateRef}
                                            type="date"
                                            className="w-full h-10 text-sm bg-transparent focus:outline-none px-2"
                                            value={reminderDate}
                                            onChange={(e) => setReminderDate(e.target.value)}
                                            onBlur={() => handleBlur('reminderDate')}
                                            placeholder="YYYY-MM-DD"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div
                                        onClick={() => {
                                            reminderTimeRef.current?.showPicker?.();
                                            reminderTimeRef.current?.focus();
                                        }}
                                        className={`flex items-center rounded-lg bg-[#1e2e3d] px-2 cursor-pointer focus-within:ring-2 focus-within:ring-blue-600 transition-all
                                            ${touched.reminderTime && errors.reminderTime ? 'ring-2 ring-red-500' : 'border border-blue-900/30'}`}
                                    >
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                reminderTimeRef.current?.showPicker?.();
                                                reminderTimeRef.current?.focus();
                                            }}
                                            className="cursor-pointer p-2 hover:scale-110 transition-transform duration-200 flex-shrink-0"
                                            aria-label="Select reminder time"
                                        >
                                            <Image src="/time.png" alt="time" width={18} height={18} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                        <input
                                            ref={reminderTimeRef}
                                            type="time"
                                            className="w-full h-10 text-sm bg-transparent focus:outline-none px-2 text-gray-200"
                                            value={reminderTime}
                                            onChange={(e) => setReminderTime(e.target.value)}
                                            onBlur={() => handleBlur('reminderTime')}
                                        />
                                    </div>
                                </div>
                            </div>
                            {touched.reminderDate && errors.reminderDate && 
                                <p className="text-red-400 text-xs mt-1">{errors.reminderDate}</p>
                            }
                            {!errors.reminderDate && (reminderDate || reminderTime) && 
                                <p className="text-xs text-blue-300 mt-1 flex items-center gap-1">
                                    <span>✓</span> Both date and time required for reminder
                                </p>
                            }
                            {!reminderDate && !reminderTime && 
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <span>⏰</span> Leave both empty or fill both date and time
                                </p>
                            }
                        </div>
                    </div>

                    {/* Footer with Update Button and Required note */}
                    <div className="flex-shrink-0 mt-4 pt-3 border-t border-blue-700/30">
                        <div className='w-full px-2 sm:px-6 mb-2'>
                            <button 
                                type='submit'
                                onClick={handleSubmit}
                                disabled={!isFormValid()}
                                className={`flex items-center justify-center w-full h-10 sm:h-11 rounded-lg transition-all duration-200 font-semibold
                                    ${isFormValid() 
                                        ? 'bg-blue-600 cursor-pointer hover:bg-blue-700 active:bg-blue-800 hover:shadow-lg' 
                                        : 'bg-gray-600 cursor-not-allowed opacity-60'
                                    }`}
                            >
                                <Image src="/checkIcon.png" alt='check icon' width={22} height={22} className='w-5 h-5 sm:w-6 sm:h-6 mr-2'/>
                                <span className='text-white'>Update Task</span>
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                            <span className="text-red-500">*</span> Required fields
                        </p>
                    </div>
                </GlowCard>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #3b82f6 #1e2e3d;
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1e2e3d;
                    border-radius: 10px;
                    margin: 4px 0;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #3b82f6;
                    border-radius: 10px;
                    transition: all 0.2s ease;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #60a5fa;
                }
                
                /* For Firefox */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #3b82f6 #1e2e3d;
                }
            `}</style>
        </div>
    );
}