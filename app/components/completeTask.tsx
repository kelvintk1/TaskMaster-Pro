"use client";

import React, { useEffect } from "react";
import Image from 'next/image';
import { GlowCard } from "./spotlight-card";

type Props = {
    onClose: () => void;
    task: any;
    onConfirm: (taskId: string) => void;
    action: 'complete' | 'undo';
}

export default function CompleteTask({ onClose, task, onConfirm, action }: Props) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handleConfirm = () => {
        onConfirm(task?.id || task?._id);
        onClose();
    };

    const isComplete = action === 'complete';
    const title = isComplete ? "Complete Task" : "Undo Task";
    const message = isComplete 
        ? "Mark this task as completed?"
        : "Move this task back to active tasks?";
    const description = isComplete
        ? "This task will be moved to completed tasks"
        : "This task will be moved back to your active tasks";
    const buttonText = isComplete ? "Complete" : "Undo";
    const buttonColor = isComplete ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700";
    const iconSrc = isComplete ? "/complete.png" : "/undo.png";

    return (
        <div onClick={onClose} className="fixed top-0 right-0 left-0 w-screen h-screen flex justify-center items-center py-8 bg-black/90 z-50">
            {/* Modal */}
            <div onClick={(e) => e.stopPropagation()}>
                <GlowCard glowColor={isComplete ? 'green' : 'orange'} size='lg' customSize className='w-[500px] p-6 rounded-xl bg-[#233648] group'>
                    {/* header */}
                    <div className='w-full flex gap-6 justify-between items-center border-b-1 border-blue-700 rounded-2xl px-4 py-2'>
                        <span className='text-2xl font-bold flex items-center justify-start gap-2'>
                            <Image src={iconSrc} alt='complete icon' width={27} height={27} className='inline-block ml-2'/>
                            <p>{title}</p>
                        </span>
                        <span onClick={onClose} className='flex items-center justify-end'>
                            <Image src='/closeB.png' alt='close icon' width={30} height={30} onClick={onClose} className='cursor-pointer hover:rotate-90 active:scale-120 transform-transition duration-200'/>
                        </span>
                    </div>
                    {/* Content */}
                    <div className="flex flex-col justify-center items-center gap-6 p-6">
                        {/* Icon */}
                        <span>
                            <Image 
                                src={isComplete ? "/complete-ill.png" : "/undo-ill.png"} 
                                alt="Complete illustration" 
                                width={120}
                                height={120} 
                                className="group-hover:scale-110 transition-transform duration-100"
                            />
                        </span>
                        
                        {/* Text Content */}
                        <span className="text-center">
                            <h3 className="text-2xl font-bold mb-3">
                                {title}
                            </h3>
                            <div className="space-y-1 text-gray-300">
                                <p>{message}</p>
                                <p className="font-semibold text-white text-lg mt-2">
                                    "{task?.title}"?
                                </p>
                                <p className="flex items-center justify-center gap-1 text-sm text-gray-400 mt-3">
                                    {description}
                                </p>
                            </div>
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 px-6 pb-6">
                        <button 
                            onClick={onClose}
                            className="flex-1 h-11 bg-blue-600 hover:bg-blue-400 active:bg-blue-800 
                                    text-white font-semibold rounded-lg transition-all duration-200 
                                    transform hover:scale-105 active:scale-95 cursor-pointer
                                    border border-blue-500/30 shadow-lg"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirm}
                            className={`flex-1 h-11 ${buttonColor} active:bg-opacity-80
                                    text-white font-semibold rounded-lg transition-all duration-200 
                                    transform hover:scale-105 active:scale-95 cursor-pointer
                                    border border-opacity-30 shadow-lg flex items-center justify-center gap-2`}
                        >
                            <span>{buttonText}</span>
                            <span className="">
                                <Image src={iconSrc} alt={`${buttonText.toLowerCase()} icon`} width={20} height={20} />
                            </span>
                        </button>
                    </div>
                </GlowCard>
            </div>
        </div>
    );
}