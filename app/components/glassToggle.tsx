"use client";

export default function GlassToggle() {
  return (
    <div className="flex flex-col gap-5 min-w-[200px]">
      {/* SVG filter */}
      <svg className="hidden">
        <filter id="glass-distortion">
          <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="77" />
        </filter>
      </svg>

      <label className="relative flex flex-col-reverse items-start gap-3 cursor-pointer group">
        {/* Track */}
        <div className="relative w-[60px] h-[32px] rounded-full overflow-hidden">
          {/* Clickable checkbox overlay */}
          <input
            type="checkbox"
            className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
          />

          {/* Glass layers */}
          <div className="absolute inset-0 rounded-full backdrop-blur-sm [filter:url(#glass-distortion)] saturate-125 brightness-110 z-[1]" />
          <div className="absolute inset-0 rounded-full bg-white/25 dark:bg-black/25 z-[2] transition-colors group-hover:bg-white/35 peer-checked:bg-blue-700" />
          <div className="absolute inset-0 rounded-full shadow-[inset_1px_1px_1px_rgba(255,255,255,0.75)] dark:shadow-[inset_1px_1px_1px_rgba(255,255,255,0.15)] z-[3]" />

          {/* Thumb */}
          <div
            className="
              absolute top-1 left-1 w-6 h-6 rounded-full overflow-hidden z-[4]
              transition-transform duration-300 ease-out
              peer-checked:translate-x-[28px]
            "
          >
            <div className="absolute inset-0 rounded-full backdrop-blur-sm [filter:url(#glass-distortion)] saturate-125 brightness-110 z-[1]" />
            <div className="absolute inset-0 rounded-full bg-white/90 dark:bg-white/80 z-[2]" />
            <div className="absolute inset-0 rounded-full shadow-[inset_1px_1px_1px_rgba(255,255,255,0.75)] dark:shadow-[inset_1px_1px_1px_rgba(255,255,255,0.15)] z-[3]" />
          </div>
        </div>

        <span className="text-white text-sm select-none">
          Enable reminders
        </span>
      </label>
    </div>
  );
}
