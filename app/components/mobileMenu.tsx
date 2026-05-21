"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import Notification from "./notification";
import { MAIN_NAV_ITEMS, getActiveNavId } from "@/lib/navigation";

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
  const pathname = usePathname();
  const activeNav = getActiveNavId(pathname);

  const toggleNotifications = () => {
    window.dispatchEvent(new CustomEvent("toggle-notifications"));
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tm_profile");
      if (saved) setProfile(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
    <div className={`lg:hidden relative ${isOpen ? "z-[1002]" : "z-auto"}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl bg-[#152232] border border-[#233648] hover:border-blue-500 transition-all duration-200 text-blue-400"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="w-6 h-6" strokeWidth={2} /> : <Menu className="w-6 h-6" strokeWidth={2} />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[1000] lg:hidden"
            aria-hidden
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-[min(calc(100vw-2rem),20rem)] max-h-[85vh] overflow-y-auto no-scrollbar flex flex-col bg-[#152232] border border-[#233648] rounded-3xl shadow-2xl shadow-black/80 z-[1001] animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-[#233648] bg-gradient-to-br from-blue-900/20 to-transparent">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full border-2 border-blue-500/50 overflow-hidden shadow-lg shrink-0">
                  <Image src={profile.avatar} alt="" width={56} height={56} className="object-cover" />
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

            <nav className="p-3 border-b border-[#233648] space-y-1" aria-label="Main">
              {MAIN_NAV_ITEMS.map((item) => {
                const isActive = activeNav === item.id;
                const Icon = item.Icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${isActive
                      ? "bg-[#233648] text-white border border-blue-600/40"
                      : "hover:bg-[#233648]/60 text-[#92adc9] hover:text-white"
                      }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${isActive ? "bg-blue-600/25 text-blue-300" : "bg-[#233648]/50 text-[#92adc9]"
                        }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 1.75} />
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 space-y-1">
              <div
                onClick={toggleNotifications}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#233648]/30 border border-[#233648]/50 cursor-pointer hover:bg-[#233648]/50 transition-colors group"
              >
                <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Notifications</span>
                <Notification />
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-500/10 transition-colors group text-left"
              >
                <div className="p-2.5 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
                  <LogOut className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-sm font-medium text-red-400 group-hover:text-red-300">Sign out</span>
              </button>
            </div>

            <div className="px-5 py-4 bg-[#101922]/50 text-center">
              <p className="text-[10px] text-[#92adc9] uppercase tracking-widest font-semibold">TaskMaster Pro</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
