"use client";
import {useState} from 'react';
import Image from 'next/image';
import Header from './components/header';
import NavBar from './components/navBar';
import Tabs from './components/tabs';
import CreateTask from './components/createTask';

export default function HomePage() {
    const [active, setActive] = useState('today');
    return(
        <div className="flex flex-col">
            <div className='flex items-center justify-between mt-3'>
                {/* title */}
                 <div className='flex flex-col'>
                    <span className='text-3xl font-bold'>
                        Active Tasks
                    </span>
                    <span className='text-sm text-[#92adc9] font-semibold'>
                        You have 5 tasks scheduled for today.
                    </span>
                 </div>
                 {/* Add button */}
                 <div className='w-26 h-10 px-2 mt-2 flex justify-center items-center bg-white rounded-xl cursor-pointer hover:shadow-[#92adc9] hover:shadow-md active:shadow-[#92adc9] active:shadow-md'>
                    <span className=''>
                        <Image src='/add.gif' alt='add gif' width={80} height={70} priority />
                    </span>
                    <span className='text-black font-semibold'>
                        Task
                    </span>
                 </div>
            </div>
            <div className='flex flex-col w-full border-b-2 border-[#233648] mt-12'>
                {/* <div className='w-full flex items-center justify-around transition-all duration-300'>
                    <span onClick={() => setActive('today')} className={`text-[#92adc9] cursor-pointer text-center font-semibold ${active === 'today' ? "text-white border-b-2 border-blue-600 rounded-2xl w-28" : ""}`}>Today</span>
                    <span onClick={() => setActive('upcoming')} className={`text-[#92adc9] cursor-pointer text-center font-semibold ${active === 'upcoming' ? "text-white border-b-2 border-blue-600 rounded-2xl w-28" : ""}`}>Upcoming</span>
                    <span onClick={() => setActive('all')} className={`text-[#92adc9] cursor-pointer text-center font-semibold ${active === 'all' ? "text-white border-b-2 border-blue-600 rounded-2xl w-28" : ""}`}>All</span>
                    <span onClick={() => setActive('priority')} className={`text-[#92adc9] cursor-pointer text-center font-semibold ${active === 'priority' ? "text-white border-b-2 border-blue-600 rounded-2xl w-28" : ""}`}>Priority</span>
                </div> */}
                <Tabs/>
            </div>
            <div>
                <CreateTask/> 
            </div> 
        </div>
    );
}