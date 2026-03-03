import React, { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export default function GradientText({
  children,
  className = "",
  colors = ["#2563EB", "#FFFFFF", "#9CA3AF", "#2563EB"], // blue-700, white, gray
  animationSpeed = 3,
  showBorder = false,
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
    backgroundSize: "300% 100%",
    animationDuration: `${animationSpeed}s`,
  };

  return (
    <div
      className={`relative mx-auto flex max-w-fit items-center justify-center rounded-[1.25rem] font-medium overflow-hidden ${className}`}
    >
      {showBorder && (
        <div
          className="absolute inset-0 animate-gradient pointer-events-none"
          style={gradientStyle}
        />
      )}

      <span
        className="relative z-10 text-transparent bg-clip-text animate-gradient"
        style={{
          ...gradientStyle,
          WebkitBackgroundClip: "text",
        }}
      >
        {children}
      </span>
    </div>
  );
}
