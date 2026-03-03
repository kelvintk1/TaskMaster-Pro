"use client";

import Image from "next/image";
import { useState } from "react";

const navItems = [
  {
    id: "tasks",
    label: "Tasks",
    icon: "/task.png",
    activeIcon: "/taskWhite.png",
  },
  {
    id: "budgets",
    label: "Budgets",
    icon: "/budget.png",
    activeIcon: "/budgetWhite.png",
  },
  {
    id: "completed",
    label: "Completed",
    icon: "/completed.png",
    activeIcon: "/completedWhite.png",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "/settings.png",
    activeIcon: "/settingsWhite.png",
  },
];

export default function NavBar() {
  const [expanded, setExpanded] = useState(true);
  const [active, setActive] = useState("tasks");

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
            <div
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center gap-6 px-6 py-4 cursor-pointer hover:scale-103
                transition-all duration-200
                ${isActive ? "bg-[#233648] rounded-3xl" : ""}
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
                className={`overflow-hidden transition-all duration-300
                ${expanded ? "max-w-[200px]" : "max-w-0"}`}
              >
                <span
                  className={`block whitespace-nowrap transition-all duration-200 ${isActive ? "font-semibold" : ""}
                  ${expanded ? "opacity-100 translate-x-0 delay-150" : "opacity-0 -translate-x-4"}`}
                >
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
