"use client";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const tabs = ["all", "today", "upcoming", "priority", "timetable"];

export default function Tabs({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeIndex = tabs.indexOf(activeTab);
    const activeEl = tabRefs.current[activeIndex];
    const container = containerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left + tabRect.width * 0.25,
        width: tabRect.width * 0.5,
      });
    }
  }, [activeTab]);

  return (
    <div className="w-full mt-2">
      <div className="relative w-full" ref={containerRef}>
        <div className="flex w-full items-center">
          {tabs.map((tab, i) => (
            <div
              key={tab}
              ref={(el) => { tabRefs.current[i] = el; }}
              onClick={() => onTabChange(tab)}
              className="flex-1 flex items-center justify-center cursor-pointer py-3"
            >
              <motion.span
                animate={{
                  y: activeTab === tab ? -2 : 0,
                  scale: activeTab === tab ? 1.05 : 1,
                  color: activeTab === tab ? "#ffffff" : "#92adc9",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="font-bold capitalize text-sm md:text-base select-none"
              >
                {tab === "timetable" ? "Schedule" : tab}
              </motion.span>
            </div>
          ))}
        </div>

        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#233648]" />

        {/* Sliding indicator — sits exactly on top of the border */}
        <motion.div
          className="absolute -bottom-0.5 h-[3px] bg-blue-500 rounded-full z-10 "
          animate={indicatorStyle}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
        />
      </div>
    </div>
  );
}