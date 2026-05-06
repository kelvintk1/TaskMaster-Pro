"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Notification from "./notification";

interface ProfileData {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

const defaultProfile: ProfileData = {
  name: "John Doe",
  email: "john.doe@taskmaster.pro",
  role: "Pro Member",
  avatar: "/profile.png",
};

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load saved profile
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tm_profile");
      if (saved) setProfile(JSON.parse(saved));
    } catch {}
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <div className="md:hidden" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-[#152232] border border-[#233648] hover:border-blue-500 transition-all duration-200"
        aria-label="Toggle mobile menu"
      >
        <div className="flex flex-col gap-1 w-6">
          <span className={`h-0.5 w-full bg-blue-400 rounded-full transition-all ${isOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <span className={`h-0.5 w-full bg-blue-400 rounded-full transition-all ${isOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-full bg-blue-400 rounded-full transition-all ${isOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </div>
      </button>

      {/* Overlay/Drawer */}
      {isOpen && (
        <div className="absolute top-20 right-4 left-4 bg-[#152232] border border-[#233648] rounded-3xl shadow-2xl shadow-black/80 z-[1001] overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Profile Section */}
          <div className="p-5 border-b border-[#233648] bg-gradient-to-br from-blue-900/20 to-transparent">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full border-2 border-blue-500/50 overflow-hidden shadow-lg">
                <Image src={profile.avatar} alt="profile" width={56} height={56} className="object-cover" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">{profile.name}</h3>
                <p className="text-xs text-[#92adc9] truncate mb-1">{profile.email}</p>
                <span className="inline-block px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-3 space-y-1">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#233648]/30 border border-[#233648]/50">
              <span className="text-sm font-medium text-white">Notifications</span>
              <Notification />
            </div>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#233648]/60 transition-colors group"
            >
              <div className="p-2 bg-[#233648] rounded-xl group-hover:bg-blue-600/20 transition-colors">
                <Image src="/settingsWhite.png" alt="settings" width={20} height={20} className="opacity-60 group-hover:opacity-100" />
              </div>
              <span className="text-sm font-medium text-[#92adc9] group-hover:text-white">Profile Settings</span>
            </Link>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-500/10 transition-colors group"
            >
              <div className="p-2 bg-red-500/10 rounded-xl">
                <span className="text-red-500 font-bold text-xl leading-none">×</span>
              </div>
              <span className="text-sm font-medium text-red-400 group-hover:text-red-300">Sign Out</span>
            </button>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-[#101922]/50 text-center">
             <p className="text-[10px] text-[#92adc9] uppercase tracking-widest font-semibold">TaskMaster Pro Mobile</p>
          </div>
        </div>
      )}
    </div>
  );
}
