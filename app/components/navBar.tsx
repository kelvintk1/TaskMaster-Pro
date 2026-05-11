"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarRange } from "lucide-react";

const navItems = [
  { id: "tasks", label: "Tasks", icon: "/taskWhite.png", activeIcon: "/task-B.png", href: "/", lucide: false },
  { id: "completed", label: "Completed", icon: "/completedWhite.png", activeIcon: "/completed-B.png", href: "/completed", lucide: false },
  { id: "uncompleted", label: "Uncompleted", icon: "/uncompleted-W.png", activeIcon: "/uncompleted-B.png", href: "/uncompleted", lucide: false },
  { id: "timetable", label: "Timetable", icon: "", activeIcon: "", href: "/timetable", lucide: true },
  { id: "settings", label: "Settings", icon: "/settingsWhite.png", activeIcon: "/settingsA.png", href: "/settings", lucide: false },
];

export default function NavBar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  const getActiveId = () => {
    const current = navItems.find(item => pathname === item.href);
    return current ? current.id : "tasks";
  };
  const active = getActiveId();

  return (
    <aside className={`fixed bottom-0 left-0 right-0 z-[1000] bg-[#101922]/95 backdrop-blur-md border-t border-[#1e3246]/50 md:relative md:border-t-0 md:h-full md:shadow-xl md:shadow-black/40 transition-all duration-300 ${expanded ? "md:w-56" : "md:w-20"}`}>
      <div className="flex flex-row md:flex-col justify-around md:justify-start md:py-6 h-full">

        {/* Expand / Collapse */}
        <button onClick={() => setExpanded(!expanded)} className="hidden md:flex items-center gap-6 px-6 py-4 cursor-pointer hover:scale-110 transition-transform">
          <Image src="/expand.png" alt="expand" width={30} height={30} className={`transition-transform duration-300 ${expanded ? "rotate-0" : "rotate-180"}`}/>
        </button>

        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <Link key={item.id} href={item.href}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-6 px-4 py-3 md:py-4 cursor-pointer group transition-all duration-300 flex-1 md:flex-initial
                ${isActive ? "bg-[#233648]/60 md:bg-[#233648] md:border-r-4 border-blue-600 rounded-2xl" : "hover:bg-[#233648]/30 rounded-2xl"}
                ${expanded ? "md:justify-start md:px-6 md:w-full" : "md:justify-center md:px-0 md:w-full"}`}
            >
              <div className="relative flex items-center justify-center transition-all duration-300 flex-shrink-0">
                {item.lucide ? (
                  <CalendarRange size={30} className={`transition-all duration-300 ${isActive ? "text-white scale-110" : "text-[#92adc9]/60 group-hover:text-[#92adc9] group-hover:scale-110"}`}/>
                ) : (
                  <Image src={isActive ? item.activeIcon : item.icon} alt={item.label} width={32} height={32}
                    className={`transition-all duration-300 ${isActive ? "scale-110" : "opacity-60 group-hover:opacity-100 group-hover:scale-110"}`}/>
                )}
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${expanded ? "max-w-[200px] opacity-100" : "md:max-w-0 md:opacity-0"}`}>
                <span className={`block text-[11px] md:text-[14px] font-medium whitespace-nowrap transition-all duration-300 ${isActive ? "font-bold text-blue-400 md:text-white" : "text-[#92adc9]"}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}