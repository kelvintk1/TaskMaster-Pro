import Image from 'next/image';

export default function Header() {
    return (
        <div className='w-full h-21 border-b-1  shadow-white shadow-xs p-4'>
            <div className='flex items-center justify-between'>
                {/* logo & title */}
                <div className='flex items-center gap-2'>
                    <span className='bg-blue-700 p-2 rounded-xl'>
                        <Image src='/logo.png' alt='logo' width={25} height={25} priority />
                    </span>
                    <span className='flex flex-col'>
                        <p className='text-2xl font-bold'>
                            TaskMaster Pro
                        </p>
                        <p className='text-sm italic font-semibold text-[#92adc9]'>
                            Management & Productivity
                        </p>
                    </span>
                </div> 
                {/* Search bar */}
                <div className='flex items-center gap-2 border-[#324d67] border-b-2 w-94 py-1 px-4 rounded-3xl focus-within:scale-110 transition-transform duration-200'>
                    <span>
                        <Image src='/searchIcon.png' alt='search icon' width={20} height={20} priority className='cursor-pointer '/>
                    </span>
                    <span>
                        <input type='text' placeholder='Search for tasks or budgets...' className='focus:outline-none w-78'/>
                    </span>
                </div>
                <div className='flex gap-5'>
                    {/* Notification */}
                    <div className='relative inline-flex items-center justify-center cursor-pointer group'>
                        <span className='absolute top-1 -right-1 flex h-5 w-5 p-1 items-center justify-center rounded-full text-xs bg-red-500 group-active:scale-110'>
                            5
                        </span>
                        <span>
                            <Image src='/notification.png' alt='notification' width={30} height={30} className='group-active:scale-110' />
                        </span>
                    </div>
                    {/* Profile */}
                    <div className="flex flex-col items-center gap-1 cursor-pointer">
                        {/* Avatar */}
                        <div className="h-10 w-10 overflow-hidden rounded-full border">
                            <Image
                            src="/profile.png"
                            alt="profile"
                            width={40}
                            height={40}
                            priority
                            className="object-cover"
                            />
                        </div>
                        {/* Name */}
                        <span className="text-sm font-semibold text-[#92adc9]">
                            John Doe
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}