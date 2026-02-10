import React from 'react'; 
import Image from 'next/image';

// type Props = {
//     isOpen: Boolean;
//     onClose: () => void;
// }

export default function CreateTask({isOpen, onClose}: Props) { 
    // if(!isOpen) return null;
    
    return(
        <div onClick={onClose}  className="hidden fixed top-0 right-0 left-0 w-screen h-screen flex justify-center items-center bg-black/80">
            {/* Modal */}
            <div className='w-148 h-full shadow-white shadow-md bg-[#101922] rounded-2xl p-4'>
                {/* header */}
                <div className='w-full flex flex-col gap-6 items-center border-b-1 border-blue-700 py-4'>
                    <span className='w-full flex items-center justify-end'>
                        <Image src='/closeB.png' alt='close icon' width={30} height={30} onClick={onClose} className='cursor-pointer hover:rotate-90 active:scale-120 transform-transition duration-200'/>
                    </span>
                    <span className='text-2xl font-bold'>Create  Task</span>
                </div>
                {/* Forms */}
                <div className=''>
                    Forms
                </div>
            </div>
        </div>
    )
}