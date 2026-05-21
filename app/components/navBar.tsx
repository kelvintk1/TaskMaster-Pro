"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { MAIN_NAV_ITEMS, getActiveNavId } from "@/lib/navigation";

export default function NavBar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();
  const active = getActiveNavId(pathname);

  return (
    <aside
      className={`hidden lg:flex flex-col z-[1000] bg-[#101922]/95 backdrop-blur-md border-r border-[#1e3246]/50 h-full shadow-xl shadow-black/40 transition-all duration-300 ${
        expanded ? "w-56" : "w-20"
      }`}
    >
      <div className="flex flex-col justify-start py-6 h-full overflow-y-auto no-scrollbar pb-24">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-[#233648]/30 rounded-2xl mx-2 transition-colors"
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
        >
          {expanded ? (
            <PanelLeftClose className="w-7 h-7 text-[#92adc9] hover:text-white shrink-0 transition-colors" strokeWidth={1.75} />
          ) : (
            <PanelLeftOpen className="w-7 h-7 text-[#92adc9] hover:text-white shrink-0 transition-colors" strokeWidth={1.75} />
          )}
        </button>

        {MAIN_NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = item.Icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-row items-center gap-4 px-4 py-3.5 mx-2 rounded-2xl cursor-pointer group transition-all duration-300
                ${isActive ? "bg-[#233648] border-r-4 border-blue-600" : "hover:bg-[#233648]/30"}
                ${expanded ? "justify-start pl-5" : "justify-center px-0"}`}
            >
              <div className="relative flex items-center justify-center shrink-0 w-8 h-8">
                <Icon
                  className={`w-7 h-7 transition-all duration-300 ${
                    isActive
                      ? "text-white scale-105"
                      : "text-[#92adc9]/70 group-hover:text-[#92adc9] group-hover:scale-105"
                  }`}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expanded ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0 pointer-events-none"
                }`}
              >
                <span
                  className={`block text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isActive ? "font-semibold text-white" : "text-[#92adc9]"
                  }`}
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
