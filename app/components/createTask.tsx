"use client";

import React from 'react'; 
import { useRef, useEffect, useState } from "react";
import Image from 'next/image';
import GlassToggle from './glassToggle';
import NotificationPicker from './notficationPicker';
import { GlowCard } from './spotlight-card';

type Props = {
    onClose: () => void;
}


export default function CreateTask({onClose, onCreate}: any) { 
    // if(!isOpen) return null;
    const dateRef = useRef<HTMLInputElement>(null);
    const timeRef = useRef<HTMLInputElement>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [remind, setRemind] = useState(false);
    const [reminderDate, setReminderDate] = useState("");
    const [reminderTime, setReminderTime] = useState("");
    const [priority, setPriority] = useState(false);

    useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onCreate({
            title,
            description,
            dueDate: dueDate,
            dueTime,
            remind,
            reminderDate: reminderDate,
            reminderTime,
            priority
        });
        onClose();
    };

    return(
        <div onClick={onClose}  className="fixed top-0 right-0 left-0 w-screen h-screen flex justify-center items-center py-8 bg-black/90">
            {/* Modal */}
            <div onClick={(e) => e.stopPropagation()} >
                <GlowCard glowColor='orange' size='lg' customSize className='w-[500px] p-6 rounded-xl bg-[#233648]'>
                {/* header */}
                <div className='w-full flex gap-6 justify-between items-center border-b-1 border-blue-700 rounded-2xl px-4 py-2'>
                    <span className='text-2xl font-bold flex items-center justify-start gap-2'>
                        <Image src="/createIcon.png" alt='create icon' width={27} height={27} className='inline-block ml-2'/>
                        <p>
                            Create  Task
                        </p>
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
                            {/* Custom calendar icon */}
                            <button
                                type="button"
                                className="cursor-pointer pl-2 hover:scale-110 transform-transition duration-200"
                            >
                                <Image src="/calendar.png" alt="calendar icon" width={20} height={20} />
                            </button>

                            {/* Native date input (hidden UI, same functionality) */}
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
                                {/* Custom time icon */}
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

                                {/* Native time input (hidden UI, same functionality) */}
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
                    <div className='w-full flex items-center mt-2'>
                        {/* <div className='flex items-center gap-2'>
                            <span className='flex flex-col gap-2'>
                                <span className="flex items-center gap-2 cursor-pointer group">
                                    <p className="text-md border-b border-white group-hover:border-blue-700 group-hover:text-blue-500 hover:-translate-y-1 transition-transform duration-300">Set notification</p>
                                    <Image src="/alert.png" alt="alert icon" width={20} height={20} className='inline-block ml-1 group-active:scale-120 transition-transform duration-300'/>
                                </span>
                                <p className="text-xs text-gray-400">Get alert 30 minutes before deadline</p>
                            </span>
                        </div> */}
                        <NotificationPicker/>
                        {/* <div className='flex items-center gap-2' >
                            <span>
                                <Image src="/note.png" alt="priority icon" width={30} height={30} className='inline-block mr-2'/>
                            </span>
                            <GlassToggle />
                        </div> */}
                    </div>
                    <div className='w-full flex px-10'>
                        <button 
                            type='submit'
                            onClick={handleSubmit}
                            className='flex items-center justify-center w-full h-10 bg-blue-600 cursor-pointer rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200'>
                            <Image src="/add-1.png" alt='check icon' width={25} height={25} className='inline-block mr-2'/>
                            <span className='text-white font-semibold'>Create</span>
                        </button>
                    </div>
                </div>
                </GlowCard>
            </div>
        </div>
    )
}