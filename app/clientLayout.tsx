"use client";

import Header from "./components/header";
import NavBar from "./components/navBar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <NavBar />

        {/* Main content */}
        <main className="transition-all duration-300 flex-1 p-4 md:p-6 overflow-y-auto no-scrollbar pb-24 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
