"use client";

import Header from "./components/header";
import NavBar from "./components/navBar";
import ReminderAlarm from "./components/reminderAlarm";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || authLoading) return;

    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");

    const authPages = ["/login", "/signup"];
    const protectedPages = ["/dashboard", "/completed", "/uncompleted", "/timetable", "/settings"];
    const isAuthPage = authPages.includes(pathname);
    const isProtectedPage = protectedPages.includes(pathname);

    // If authenticated and on auth page, redirect to dashboard
    if (isAuthenticated && isAuthPage) {
      router.replace("/dashboard");
      return;
    }

    // If not authenticated and on protected page, redirect to login
    if (!isAuthenticated && isProtectedPage) {
      router.replace("/login");
      return;
    }

    // Handle onboarding
    if (!hasSeenOnboarding && pathname !== "/onboarding" && !isAuthPage) {
      router.replace("/onboarding");
      return;
    }
  }, [pathname, router, isAuthenticated, authLoading, isMounted]);

  const isFullScreenPage = ["/onboarding", "/login", "/signup"].includes(pathname);

  if (!isMounted || authLoading) {
    return (
      <div className="w-full h-screen bg-[#101922] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isFullScreenPage) {
    return (
      <div className="w-full h-screen bg-[#101922] text-white overflow-y-auto overflow-x-hidden">
        {children}
        <ReminderAlarm />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen bg-[#101922] text-white overflow-hidden">
      <NavBar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto no-scrollbar pb-6 relative">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <ReminderAlarm />
    </div>
  );
}
