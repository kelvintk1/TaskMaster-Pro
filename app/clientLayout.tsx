"use client";

import Header from "./components/header";
import NavBar from "./components/navBar";
import ReminderAlarm from "./components/reminderAlarm";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (!hasSeenOnboarding && pathname !== "/onboarding") {
      router.replace("/onboarding");
      return;
    }

    if (hasSeenOnboarding && !isAuthenticated && pathname !== "/login" && pathname !== "/signup" && pathname !== "/onboarding") {
      router.replace("/login");
      return;
    }
  }, [pathname, router]);

  const isFullScreenPage = ["/onboarding", "/login", "/signup"].includes(pathname);

  if (!isMounted) return null;

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
