"use client";

import Header from "./components/header";
import NavBar from "./components/navBar";
import ReminderAlarm from "./components/reminderAlarm";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-[#101922] text-white overflow-hidden">
      <NavBar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-6 relative">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <ReminderAlarm />
    </div>
  );
}
