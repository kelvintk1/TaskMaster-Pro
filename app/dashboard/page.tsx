"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTasks } from "../context/TaskContext";
import { GlowCard } from "../components/spotlight-card";
import { CountUp } from "../components/count-up";
import Image from "next/image";
import { motion } from "framer-motion";
import RippleLoader from "../components/ripple-loader";

export default function DashboardPage() {
  const { tasks, loading } = useTasks();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const priority = tasks.filter(t => !t.completed && t.priority).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }).length;

    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, active, priority, dueToday, completionRate };
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .filter(t => !t.completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [tasks]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-2 items-center justify-center min-h-[500px]">
        <RippleLoader />
        <span className="text-[#92adc9] text-xl font-semibold mt-4">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-2 md:p-6 w-full max-w-7xl mx-auto flex flex-col gap-8 relative"
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-[-1]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-[-1]" />

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#92adc9]">Dashboard</h1>
          <p className="text-[#92adc9] mt-1 text-sm md:text-base font-medium">Welcome back! Here&apos;s your productivity overview.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="flex w-full items-center md:justify-start gap-4 md:gap-6 mt-4 overflow-x-auto no-scrollbar pb-4 md:pb-0 flex-nowrap md:flex-wrap snap-x snap-mandatory">
        <motion.div variants={itemVariants} className="snap-center flex-shrink-0">
          <GlowCard glowColor="blue" customSize className="w-[180px] h-[110px] bg-[#101922]/80 backdrop-blur-xl rounded-2xl p-4 border border-[#233648] hover:border-blue-500/30 transition-all shadow-lg">
            <div className="flex w-full h-full flex-col justify-between">
              <span className="flex justify-between items-center">
                <span className="font-semibold text-sm text-[#92adc9]">Active</span>
                <Image src="/all.png" alt="" width={18} height={18} className="opacity-80" />
              </span>
              <CountUp value={stats.active} className="text-3xl font-black text-white" />
            </div>
          </GlowCard>
        </motion.div>

        <motion.div variants={itemVariants} className="snap-center flex-shrink-0">
          <GlowCard glowColor="green" customSize className="w-[180px] h-[110px] bg-[#101922]/80 backdrop-blur-xl rounded-2xl p-4 border border-[#233648] hover:border-green-500/30 transition-all shadow-lg">
            <div className="flex w-full h-full flex-col justify-between">
              <span className="flex justify-between items-center">
                <span className="font-semibold text-sm text-[#92adc9]">Completed</span>
                <span className="text-green-400 font-black text-lg leading-none opacity-80">✓</span>
              </span>
              <CountUp value={stats.completed} className="text-3xl font-black text-white" />
            </div>
          </GlowCard>
        </motion.div>

        <motion.div variants={itemVariants} className="snap-center flex-shrink-0">
          <GlowCard glowColor="red" customSize className="w-[180px] h-[110px] bg-[#101922]/80 backdrop-blur-xl rounded-2xl p-4 border border-[#233648] hover:border-red-500/30 transition-all shadow-lg">
            <div className="flex w-full h-full flex-col justify-between">
              <span className="flex justify-between items-center">
                <span className="font-semibold text-sm text-[#92adc9]">Due Today</span>
                <Image src="/calendar.png" alt="" width={18} height={18} className="opacity-80" />
              </span>
              <CountUp value={stats.dueToday} className="text-3xl font-black text-white" />
            </div>
          </GlowCard>
        </motion.div>

        <motion.div variants={itemVariants} className="snap-center flex-shrink-0">
          <GlowCard glowColor="purple" customSize className="w-[180px] h-[110px] bg-[#101922]/80 backdrop-blur-xl rounded-2xl p-4 border border-[#233648] hover:border-purple-500/30 transition-all shadow-lg">
            <div className="flex w-full h-full flex-col justify-between">
              <span className="flex justify-between items-center">
                <span className="font-semibold text-sm text-[#92adc9]">Priority</span>
                <Image src="/star.png" alt="" width={18} height={18} className="opacity-80" />
              </span>
              <CountUp value={stats.priority} className="text-3xl font-black text-white" />
            </div>
          </GlowCard>
        </motion.div>
      </motion.div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-2">
        {/* Upcoming Deadlines */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#101922]/80 backdrop-blur-xl rounded-3xl border border-[#233648] p-6 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between mb-6 border-b border-[#233648]/60 pb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="w-2.5 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
              Upcoming Deadlines
            </h2>
            <Link href="/" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-4 py-1.5 rounded-full">View All</Link>
          </div>

          <div className="flex flex-col gap-4">
            {recentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#92adc9]">
                <Image src="/emptyFolder.png" alt="Empty" width={120} height={120} className="opacity-50 mb-4 drop-shadow-lg" />
                <p className="font-semibold text-lg">No upcoming tasks.</p>
                <p className="text-sm">You&apos;re all caught up! Take a break.</p>
              </div>
            ) : (
              recentTasks.map((task, idx) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#152232] border border-[#233648]/50 hover:border-blue-500/40 hover:bg-[#1a293b] transition-all group shadow-sm hover:shadow-lg"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#233648] to-[#152232] border border-[#324d67] flex items-center justify-center text-white font-bold shrink-0 text-xl shadow-inner group-hover:border-blue-500/50 transition-colors">
                      {task.title.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-1">{task.title}</h3>
                      <p className="text-xs font-semibold text-[#92adc9] mt-1 flex items-center gap-2">
                        <Image src="/calendar.png" alt="" width={12} height={12} className="opacity-70" />
                        Due {new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {task.priority && (
                    <div className="hidden sm:flex px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-[10px] font-black text-purple-400 uppercase tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                      Priority
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Daily Focus Widget */}
        <motion.div variants={containerVariants} className="flex flex-col gap-6">
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#152232] to-[#101922] backdrop-blur-xl rounded-3xl border border-[#233648] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 group-hover:bg-blue-500/20 transition-all duration-700"></div>
            
            <div className="relative z-10 flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Image src="/star.gif" alt="" width={16} height={16} unoptimized />
                </div>
                <p className="text-blue-400 font-bold text-xs tracking-widest uppercase">Today&apos;s Focus</p>
              </div>
              <h2 className="text-3xl font-black text-white leading-tight">Master your day.</h2>
              <div className="mt-4 mb-2 bg-[#101922]/50 border border-[#233648] rounded-2xl p-4 shadow-inner">
                <p className="text-[#92adc9] text-sm leading-relaxed italic">
                  &quot;Success is the sum of small efforts, repeated day in and day out. Stay focused and keep building your momentum.&quot;
                </p>
              </div>
              
              <button className="mt-8 w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                <span>Start Next Task</span>
                <span className="text-xl leading-none">→</span>
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#101922]/80 backdrop-blur-xl rounded-3xl border border-[#233648] p-6 shadow-xl">
            <h3 className="font-bold text-[#92adc9] uppercase tracking-wider text-xs mb-4">Quick Links</h3>
            <div className="flex flex-col gap-3">
              <a href="/timetable" className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#152232] hover:bg-[#1e3246] border border-transparent hover:border-[#324d67] transition-all text-[#92adc9] hover:text-white group">
                <div className="p-2 bg-[#233648] rounded-xl group-hover:bg-blue-500/20 transition-colors">
                  <Image src="/calendar.png" alt="" width={18} height={18} className="opacity-90" />
                </div>
                <span className="font-bold text-sm">Upload Timetable</span>
              </a>
              <a href="/completed" className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#152232] hover:bg-[#1e3246] border border-transparent hover:border-[#324d67] transition-all text-[#92adc9] hover:text-white group">
                <div className="p-2 bg-[#233648] rounded-xl group-hover:bg-green-500/20 transition-colors">
                  <span className="text-green-400 font-black text-sm px-1">✓</span>
                </div>
                <span className="font-bold text-sm">Completed Archive</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
