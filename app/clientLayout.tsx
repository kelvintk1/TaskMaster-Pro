"use client";

import { useState } from "react";
import Header from "./components/header";
import NavBar from "./components/navBar";
import CreateTask from "./components/createTask";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <NavBar expanded={expanded} setExpanded={setExpanded} />

        {/* Main content */}
        <main className="transition-all duration-300 flex-1 p-6 overflow-hidden no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
