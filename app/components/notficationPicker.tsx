"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Unit = "seconds" | "minutes" | "hours" | "days" | "months";

export default function NotificationPicker() {
  const valueRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState<number | "">("");
  const [unit, setUnit] = useState<Unit>("minutes");

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Clickable trigger */}
      <button
        type="button"
        onClick={() => valueRef.current?.focus()}
        className="flex flex-row-reverse items-center gap-2 cursor-pointer group w-fit"
      >
        <p className="text-md ">
          Choose when to be reminded
        </p>

        <Image
          src="/alert.png"
          alt="alert icon"
          width={20}
          height={20}
          className="inline-block ml-1 group-active:scale-110 transition-transform duration-200"
        />
      </button>

      {/* Controls */}
      <div className="w-full flex items-center gap-14">
        {/* Number input */}
        <input
          ref={valueRef}
          type="number"
          min={1}
          placeholder="e.g. 2"
          value={value}
          onChange={(e) => setValue(e.target.value ? Number(e.target.value) : "")}
          className="w-full bg-[#233648] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        {/* Unit selector */}
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
          className="w-full bg-[#233648] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="seconds">second(s)</option>
          <option value="minutes">minute(s)</option>
          <option value="hours">hour(s)</option>
          <option value="days">day(s)</option>
          <option value="months">month(s)</option>
        </select>
      </div>

      {/* Preview */}
      {value && (
        <p className="text-xs text-green-400">
          You’ll be notified {value} {unit} before deadline.
        </p>
      )}
    </div>
  );
}
