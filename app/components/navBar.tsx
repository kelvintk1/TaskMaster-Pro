"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    id: "tasks",
    label: "Tasks",
    icon: "/taskWhite.png",
    activeIcon: "/task-B.png",
    href: "/",
  }, 
  {
    id: "completed",
    label: "Completed",
    icon: "/completedWhite.png",
    activeIcon: "/completed-B.png",
    href: "/completed",
  },
  {
    id: "uncompleted",
    label: "Uncompleted",
    icon: "/uncompleted-W.png",
    activeIcon: "/uncompleted-B.png",
    href: "/uncompleted",
  },
];

export default function NavBar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  // Determine active item based on current path
  const getActiveId = () => {
    const currentItem = navItems.find(item => pathname === item.href);
    return currentItem ? currentItem.id : "tasks";
  };

  const active = getActiveId();

  return (
    <aside
      className={`h-full shadow-xl shadow-gray-400 transition-all duration-300
        ${expanded ? "w-54" : "w-20"}
      `}
    >
      <div className="flex flex-col py-6">
        {/* Expand / Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-6 px-6 py-4 cursor-pointer hover:scale-110 transition-transform"
        >
          <Image
            src="/expand.png"
            alt="expand"
            width={30}
            height={30}
            className={`transition-transform duration-300
              ${expanded ? "rotate-0" : "rotate-180"}
            `}
          />
        </button>

        {/* Navigation Items */}
        {navItems.map((item) => {
          const isActive = active === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-6 px-6 py-4 cursor-pointer group
                transition-all duration-200
                ${isActive ? "bg-[#233648] rounded-3xl border-r-6 border-blue-800 " : ""}
              `}
            >
              {/* Icon */}
              <Image
                src={isActive ? item.activeIcon : item.icon}
                alt={item.label}
                width={25}
                height={25}
                className={` ${isActive ? "scale-130 transition-transform duration-300" : ""}`}
              />

              {/* Text */}
              <div
                className={`overflow-hidden group-hover:scale-115 transition-all duration-300
                ${expanded ? "max-w-[200px]" : "max-w-0"}`}
              >
                <span
                  className={`block whitespace-nowrap transition-all duration-200 ${isActive ? "font-semibold" : ""}
                  ${expanded ? "opacity-100 translate-x-0 delay-150" : "opacity-0 -translate-x-4"}`}
                >
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