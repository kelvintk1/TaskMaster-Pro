"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load saved profile from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tm_profile");
      if (saved) setProfile(JSON.parse(saved));
    } catch {}
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={panelRef} className="relative">
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex flex-col items-center gap-1 cursor-pointer group"
        aria-label="Profile menu"
      >
        <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#324d67] group-hover:border-blue-500 transition-all duration-200">
          <Image
            src={profile.avatar}
            alt="profile"
            width={40}
            height={40}
            priority
            className="object-cover"
          />
        </div>
        <span className="text-sm font-semibold text-[#92adc9] group-hover:text-white transition-colors">
          {profile.name.split(" ")[0]}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-16 right-0 w-64 bg-[#152232] border border-[#233648] rounded-2xl shadow-2xl shadow-black/60 z-[999] overflow-hidden">
          {/* Profile header */}
          <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-blue-900/30 to-transparent border-b border-[#233648]">
            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-blue-500/50 flex-shrink-0">
              <Image
                src={profile.avatar}
                alt="profile"
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile.name}</p>
              <p className="text-xs text-[#92adc9] truncate">{profile.email}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">
                {profile.role}
              </span>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-2">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#233648] transition-colors group"
            >
              <Image src="/settingsWhite.png" alt="settings" width={18} height={18} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="text-sm text-[#92adc9] group-hover:text-white transition-colors">Settings & Profile</span>
            </Link>

            <button
              onClick={() => {
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#233648] transition-colors group"
            >
              <Image src="/remind.png" alt="pref" width={18} height={18} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="text-sm text-[#92adc9] group-hover:text-white transition-colors">Preferences</span>
            </button>

            <div className="border-t border-[#233648] my-1" />

            <button
              onClick={() => {
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors group"
            >
              <div className="w-[18px] h-[18px] flex items-center justify-center">
                 <span className="text-red-500 font-bold text-lg">×</span>
              </div>
              <span className="text-sm text-red-400 group-hover:text-red-300 transition-colors">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
