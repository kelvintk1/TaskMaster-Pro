"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useTasks } from "../context/TaskContext";
import { BorderBeam } from "./borderBeam";

export default function ReminderAlarm() {
  const { tasks } = useTasks();
  const [activeAlarm, setActiveAlarm] = useState<any>(null);
  const [isVibrating, setIsVibrating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notifiedTasksRef = useRef<Set<string>>(new Set());

  // Function to play a soft beep
  const startBeep = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      // Resume context if it was suspended (common on mobile/iOS)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (oscillatorRef.current) return;

      // Beep every second
      const interval = setInterval(() => {
        if (!activeAlarm && !oscillatorRef.current) {
          clearInterval(interval);
          return;
        }
        
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
          console.warn("Beep failed:", e);
        }
      }, 1000);

      oscillatorRef.current = {} as any; // Mark as active
    } catch (e) {
      console.error("Audio failed:", e);
    }
  };

  const stopBeep = () => {
    oscillatorRef.current = null;
  };

  const startVibration = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        setIsVibrating(true);
        navigator.vibrate([500, 300, 500, 300, 500]);
      } catch (e) {
        console.warn("Vibration failed:", e);
      }
    }
  };

  const stopVibration = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(0);
      } catch (e) {}
    }
    setIsVibrating(false);
  };

  // Resume audio context on first interaction
  useEffect(() => {
    const resume = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    document.addEventListener('click', resume, { once: true });
    return () => document.removeEventListener('click', resume);
  }, []);

  const triggerAlarm = (task: any) => {
    setActiveAlarm(task);
    startBeep();
    startVibration();

    // Auto-stop after 30 seconds
    timeoutRef.current = setTimeout(() => {
      handleStop();
    }, 30000);
  };

  const handleStop = () => {
    stopBeep();
    stopVibration();
    setActiveAlarm(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach((task: any) => {
        if (task.completed || !task.remind || !task.reminderDate) return;

        const reminderTime = new Date(task.reminderDate);
        // If task has specific time, use it. Otherwise, use 00:00.
        if (task.reminderTime) {
          const [hours, minutes] = task.reminderTime.split(':');
          reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }

        const diff = now.getTime() - reminderTime.getTime();
        const taskId = task._id || task.id;

        // Trigger if it's within the last minute and hasn't been notified yet
        if (diff >= 0 && diff < 60000 && !notifiedTasksRef.current.has(taskId)) {
          notifiedTasksRef.current.add(taskId);
          triggerAlarm(task);
        }
      });
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [tasks]);

  if (!activeAlarm) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#152232] border border-blue-500/50 rounded-3xl p-8 shadow-2xl shadow-blue-500/20 overflow-hidden">
        <BorderBeam colorFrom="#2563EB" colorTo="#5085f7" />
        
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
            <Image src="/remind1.png" alt="alarm" width={48} height={48} />
          </div>
          
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Reminder Due!</h2>
            <p className="text-blue-400 font-bold text-lg mb-4">{activeAlarm.title}</p>
            <p className="text-[#92adc9] text-sm leading-relaxed">
              {activeAlarm.description || "You set a reminder for this task."}
            </p>
          </div>

          <button
            onClick={handleStop}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            STOP ALARM
          </button>
          
          <p className="text-[10px] text-[#92adc9] uppercase tracking-widest font-bold">
            Will auto-stop in 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
