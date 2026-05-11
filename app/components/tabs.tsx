"use client";

const tabs = ["all", "today", "upcoming", "priority", "timetable"];

const underlinePos: Record<string, string> = {
  all: "translate-x-0",
  today: "translate-x-full",
  upcoming: "translate-x-[200%]",
  priority: "translate-x-[300%]",
  timetable: "translate-x-[400%]",
};

export default function Tabs({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <div className="w-full mt-2">
      <div className="relative w-full">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <span key={tab} onClick={() => onTabChange(tab)}
              className={`cursor-pointer pb-1 font-semibold capitalize transition-colors text-sm md:text-base
                ${activeTab === tab ? "text-white -translate-y-3 text-lg rotate-y-360 transition-transform duration-300" : "text-[#92adc9]"}`}
            >
              {tab === "timetable" ? "Schedule" : tab}
            </span>
          ))}
        </div>
        <div className="relative h-[2px] bg-[#233648]">
          <div className={`absolute left-0 top-0 h-[4px] w-1/5 bg-blue-600 rounded-3xl transition-transform duration-300 ease-in-out ${underlinePos[activeTab] || "translate-x-0"}`} />
        </div>
      </div>
    </div>
  );
}