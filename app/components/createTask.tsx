"use client";

import React from 'react'; 
import { useRef, useEffect, useState } from "react";
import Image from 'next/image';
import { GlowCard } from './spotlight-card';

type Props = {
    onClose: () => void;
    onCreate: (taskData: any) => void;
}

export default function CreateTask({onClose, onCreate}: Props) { 
    const dateRef = useRef<HTMLInputElement>(null);
    const timeRef = useRef<HTMLInputElement>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [reminderDate, setReminderDate] = useState("");
    const [reminderTime, setReminderTime] = useState("");
    const [priority, setPriority] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [touched, setTouched] = useState<{[key: string]: boolean}>({});

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    // Clear reminder field errors when fields are cleared
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

        // Determine if reminder should be ON based on reminder fields
        const remind = !!(reminderDate && reminderTime); // Both must be present

        onCreate({
            title,
            description,
            dueDate: dueDate,
            dueTime,
            remind,
            reminderDate: reminderDate,
            reminderTime: reminderTime,
            priority
        });
        onClose();
    };

    return(
        <div onClick={onClose} className="fixed top-0 right-0 left-0 w-screen h-screen flex justify-center items-center py-8 bg-black/90">
            {/* Modal */}
            <div onClick={(e) => e.stopPropagation()} >
                <GlowCard glowColor='orange' size='lg' customSize className='w-[500px] p-6 rounded-xl bg-[#233648]'>
                    {/* header */}
                    <div className='w-full flex gap-6 justify-between items-center border-b-1 border-blue-700 rounded-2xl px-4 py-2'>
                        <span className='text-2xl font-bold flex items-center justify-start gap-2'>
                            <Image src="/createIcon.png" alt='create icon' width={27} height={27} className='inline-block ml-2'/>
                            <p>Create Task</p>
                        </span>
                        <span onClick={onClose} className='flex items-center justify-end'>
                            <Image src='/closeB.png' alt='close icon' width={30} height={30} onClick={onClose} className='cursor-pointer hover:rotate-90 active:scale-120 transform-transition duration-200'/>
                        </span>
                    </div>
                    {/* Forms */}
                    <div className='flex flex-col gap-3'>
                        {/* Title Field */}
                        <span>
                            <p className="text-md font-semibold">
                                Title <span className="text-red-500">*</span>
                            </p>
                            <input 
                                type='text' 
                                placeholder='Task Title' 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={() => handleBlur('title')}
                                className={`w-full h-10 rounded-md bg-[#233648] mt-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 
                                    ${touched.title && errors.title ? 'ring-2 ring-red-500' : ''}`}
                            />
                            {touched.title && errors.title && 
                                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                            }
                        </span>

                        {/* Description Field */}
                        <span>
                            <p className="text-md font-semibold">
                                Description <span className="text-red-500">*</span>
                            </p>
                            <textarea 
                                placeholder='Provide details of your task.' 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={() => handleBlur('description')}
                                className={`w-full h-28 rounded-md bg-[#233648] mt-2 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 
                                    ${touched.description && errors.description ? 'ring-2 ring-red-500' : ''}`}
                            />
                            {touched.description && errors.description && 
                                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                            }
                        </span>

                        {/* Due Date and Time */}
                        <div className="flex items-center justify-between gap-4">
                            <span className="flex-1">
                                <p>
                                    Due Date <span className="text-red-500">*</span>
                                </p>
                                <span 
                                    className={`rounded-md bg-[#233648] mt-2 px-1 flex items-center gap-2 
                                        focus-within:ring-2 focus-within:ring-blue-600
                                        ${touched.dueDate && errors.dueDate ? 'ring-2 ring-red-500' : ''}`}
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
                                        className="ml-2 w-full h-10 text-sm bg-transparent focus:outline-none"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        onBlur={() => handleBlur('dueDate')}
                                    />
                                </span>
                                {touched.dueDate && errors.dueDate && 
                                    <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>
                                }
                            </span>
                            <span className="flex-1">
                                <p>
                                    Time <span className="text-red-500">*</span>
                                </p>
                                <span
                                    onClick={() => {
                                        timeRef.current?.showPicker?.();
                                        timeRef.current?.focus();
                                    }}
                                    className={`rounded-md bg-[#233648] mt-2 px-1 flex items-center gap-2 
                                            cursor-pointer focus-within:ring-2 focus-within:ring-blue-600
                                            ${touched.dueTime && errors.dueTime ? 'ring-2 ring-red-500' : ''}`}
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
                                        className="ml-2 w-full h-10 text-sm bg-transparent focus:outline-none text-gray-200"
                                        value={dueTime}
                                        onChange={(e) => setDueTime(e.target.value)}
                                        onBlur={() => handleBlur('dueTime')}
                                    />
                                </span>
                                {touched.dueTime && errors.dueTime && 
                                    <p className="text-red-500 text-xs mt-1">{errors.dueTime}</p>
                                }
                            </span>
                        </div>

                        {/* Reminder Section - Optional but both fields required if one is filled */}
                        <div className='w-full flex flex-col'>
                            <p className="text-md font-semibold mb-2">Set Reminder (Optional)</p>
                            <div className="flex gap-4">
                                <span className="flex-1">
                                    <span 
                                        className={`rounded-md bg-[#233648] px-1 flex items-center gap-2 
                                            focus-within:ring-2 focus-within:ring-blue-600
                                            ${touched.reminderDate && errors.reminderDate ? 'ring-2 ring-red-500' : ''}`}
                                        onClick={() => {
                                            const reminderInput = document.getElementById('reminder-date') as HTMLInputElement;
                                            reminderInput?.showPicker();
                                        }}
                                    >
                                        <button
                                            type="button"
                                            className="cursor-pointer pl-2 hover:scale-110 transform-transition duration-200"
                                        >
                                            <Image src="/calendar.png" alt="calendar icon" width={20} height={20} />
                                        </button>
                                        <input
                                            id="reminder-date"
                                            type="date"
                                            className="ml-2 w-full h-10 text-sm bg-transparent focus:outline-none"
                                            value={reminderDate}
                                            onChange={(e) => setReminderDate(e.target.value)}
                                            onBlur={() => handleBlur('reminderDate')}
                                        />
                                    </span>
                                </span>
                                <span className="flex-1">
                                    <span
                                        onClick={() => {
                                            const reminderTimeInput = document.getElementById('reminder-time') as HTMLInputElement;
                                            reminderTimeInput?.showPicker?.();
                                            reminderTimeInput?.focus();
                                        }}
                                        className={`rounded-md bg-[#233648] px-1 flex items-center gap-2 
                                                cursor-pointer focus-within:ring-2 focus-within:ring-blue-600
                                                ${touched.reminderTime && errors.reminderTime ? 'ring-2 ring-red-500' : ''}`}
                                    >
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const reminderTimeInput = document.getElementById('reminder-time') as HTMLInputElement;
                                                reminderTimeInput?.showPicker?.();
                                                reminderTimeInput?.focus();
                                            }}
                                            className="cursor-pointer pl-2 hover:scale-110 transition-transform duration-200"
                                        >
                                            <Image src="/time.png" alt="time icon" width={20} height={20} />
                                        </button>
                                        <input
                                            id="reminder-time"
                                            type="time"
                                            className="ml-2 w-full h-10 text-sm bg-transparent focus:outline-none text-gray-200"
                                            value={reminderTime}
                                            onChange={(e) => setReminderTime(e.target.value)}
                                            onBlur={() => handleBlur('reminderTime')}
                                        />
                                    </span>
                                </span>
                            </div>
                            {touched.reminderDate && errors.reminderDate && 
                                <p className="text-red-500 text-xs mt-1">{errors.reminderDate}</p>
                            }
                            {!errors.reminderDate && (reminderDate || reminderTime) && 
                                <p className="text-xs text-[#92adc9] mt-2">
                                    ✓ Both date and time required for reminder
                                </p>
                            }
                            {!reminderDate && !reminderTime && 
                                <p className="text-xs text-[#92adc9] mt-2">
                                    ⏰ Leave both empty or fill both date and time
                                </p>
                            }
                        </div>

                        {/* Create Button */}
                        <div className='w-full flex px-10 mt-2'>
                            <button 
                                type='submit'
                                onClick={handleSubmit}
                                disabled={!isFormValid()}
                                className={`flex items-center justify-center w-full h-10 rounded-md transition-colors duration-200
                                    ${isFormValid() 
                                        ? 'bg-blue-600 cursor-pointer hover:bg-blue-700 active:bg-blue-800' 
                                        : 'bg-gray-500 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                <Image src="/add-1.png" alt='check icon' width={25} height={25} className='inline-block mr-2'/>
                                <span className='text-white font-semibold'>Create</span>
                            </button>
                        </div>

                        {/* Required fields note */}
                        <p className="text-xs text-[#92adc9] text-center">
                            <span className="text-red-500">*</span> Required fields
                        </p>
                    </div>
                </GlowCard>
            </div>
        </div>
    )
}