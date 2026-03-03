"use client";

import { useState } from "react";

const tabs = ["today", "upcoming", "all", "priority"];

export default function Tabs() {
  const [active, setActive] = useState("today");

  const underlinePosition = {
    today: "translate-x-0",
    upcoming: "translate-x-full",
    all: "translate-x-[200%]",
    priority: "translate-x-[300%]",
  }[active];

  return (
    <div className="w-full mt-2">
      {/* Tabs */}
      <div className="relative w-full">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <span
              key={tab}
              onClick={() => setActive(tab)}
              className={`cursor-pointer pb-1 font-semibold capitalize transition-colors
                ${
                  active === tab
                    ? "text-white -translate-y-3 text-lg rotate-y-360 transition-transform duration-300"
                    : "text-[#92adc9]"
                }`}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* Sliding underline */}
        <div className="relative h-[2px] bg-[#233648]">
          <div
            className={`absolute left-0 top-0 h-[4px] w-1/4 bg-blue-600 rounded-3xl
              transition-transform duration-300 ease-in-out
              ${underlinePosition}`}
          />
        </div>
      </div>
    </div>
  );
}
