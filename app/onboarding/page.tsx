"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const slides = [
  {
    id: 1,
    title: "Master Your Tasks",
    description: "Organize, prioritize, and track your daily tasks with powerful holographic UI elements and intuitive workflows.",
    image: "/task_management.png",
  },
  {
    id: 2,
    title: "AI Timetable Parsing",
    description: "Upload your course schedule and let our advanced AI extract and organize your lectures seamlessly.",
    image: "/ai_timetable.png",
  },
  {
    id: 3,
    title: "Achieve Your Goals",
    description: "Stay motivated, track your progress, and reach new heights of productivity every single day.",
    image: "/goal_achievement.png",
  },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem("hasSeenOnboarding", "true");
      router.push("/signup");
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#0a0f16] flex flex-col items-center justify-between overflow-hidden">
      {/* Abstract Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Content Container */}
      <div className="flex flex-col items-center w-full max-w-2xl px-6 z-10 flex-1 justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center text-center w-full"
          >
            <div className="relative w-48 h-48 md:w-66 md:h-66 mb-12">
              <Image
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                fill
                className="object-contain drop-shadow-[0_0_40px_rgba(37,99,235,0.4)]"
                priority
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              {slides[currentSlide].title}
            </h1> 
            <p className="text-lg md:text-xl text-[#92adc9] max-w-md mx-auto leading-relaxed">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="w-full flex flex-col items-center gap-6 pb-12 px-6">
        {/* Progress Indicators */}
        <div className="flex gap-3">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "w-8 bg-blue-500 shadow-[0_0_10px_#3b82f6]" : "w-2 bg-[#233648]"
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-6 w-full max-w-sm">
          {currentSlide > 0 && (
            <button
              onClick={prevSlide}
              className="flex-1 py-4 rounded-2xl font-bold text-[#92adc9] bg-[#152232] hover:bg-[#233648] hover:text-white transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={nextSlide}
            className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all shadow-lg hover:scale-105 active:scale-95 ${
              currentSlide === slides.length - 1
                ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-blue-500/25"
                : "bg-blue-600 shadow-blue-600/20"
            }`}
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
          </button>
        </div>
        
        <div className="flex gap-2 text-sm text-[#92adc9]">
          <span>Already have an account?</span>
          <button onClick={() => router.push("/login")} className="text-blue-400 hover:text-blue-300 font-semibold underline-offset-4 hover:underline">
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
