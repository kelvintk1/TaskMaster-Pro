"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<"profile" | "preferences">("profile");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tm_profile");
      if (stored) setProfile(JSON.parse(stored));
    } catch {}
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem("tm_profile", JSON.stringify(profile));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile((p) => ({ ...p, avatar: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const sections = [
    { id: "profile", label: "Profile", icon: "/profile.png" },
    { id: "preferences", label: "Preferences", icon: "/settingsWhite.png" },
  ] as const;

  return (
    <div className="p-2 max-w-3xl mx-auto">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-[#92adc9] text-sm mt-1">Manage your profile and application preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar nav / Horizontal Tabs on Mobile */}
        <nav className="flex flex-row md:flex-col gap-2 md:gap-1 overflow-x-auto md:overflow-visible no-scrollbar w-full md:w-44 flex-shrink-0 border-b border-[#233648] md:border-b-0 pb-2 md:pb-0">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold md:font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap
                ${activeSection === s.id
                  ? "bg-blue-600/10 md:bg-[#233648] text-blue-400 md:text-white md:border-l-4 border-blue-600"
                  : "text-[#92adc9] hover:bg-[#1a2d3e] hover:text-white"
                }`}
            >
              <Image src={s.icon} alt={s.label} width={16} height={16} className={activeSection === s.id ? "" : "opacity-60"} />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1">
          {activeSection === "profile" && (
            <div className="flex flex-col gap-6">
              {/* Avatar section */}
              <div className="bg-[#152232] border border-[#233648] rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Profile Picture</h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-blue-500/50 shadow-lg shadow-blue-900/20">
                      <Image
                        src={profile.avatar}
                        alt="avatar"
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 rounded-full p-2 transition-all hover:scale-110 cursor-pointer flex items-center justify-center shadow-lg shadow-black/40"
                      title="Change avatar"
                    >
                      <Image src="/editIcon.png" alt="edit" width={14} height={14} />
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg text-white font-bold">{profile.name}</p>
                    <p className="text-sm text-[#92adc9] mt-0.5">{profile.email}</p>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      <span>Upload new photo</span>
                    </button>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              {/* Profile fields */}
              <div className="bg-[#152232] border border-[#233648] rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Personal Info</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#92adc9] uppercase tracking-wider mb-1.5 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                      className="w-full bg-[#101922] border border-[#233648] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/40 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#92adc9] uppercase tracking-wider mb-1.5 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      className="w-full bg-[#101922] border border-[#233648] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/40 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#92adc9] uppercase tracking-wider mb-1.5 block">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={profile.role}
                      onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))}
                      className="w-full bg-[#101922] border border-[#233648] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/40 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer
                  ${saved
                    ? "bg-green-600 text-white"
                    : "bg-blue-700 hover:bg-blue-600 text-white"
                  }`}
              >
                {saved ? "✓ Saved!" : "Save Changes"}
              </button>
            </div>
          )}

          {activeSection === "preferences" && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#152232] border border-[#233648] rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">App Preferences</h2>
                <div className="flex flex-col gap-4">
                  {/* Placeholder preference rows */}
                  {[
                    { label: "Desktop Notifications", desc: "Get notified when tasks are due", icon: "/notification.png" },
                    { label: "Sound Alerts", desc: "Play a sound for reminders", icon: "/notify.png" },
                    { label: "Auto-refresh Tasks", desc: "Refresh task list every minute", icon: "/time.png" },
                  ].map((pref) => (
                    <div key={pref.label} className="flex items-center justify-between py-3 border-b border-[#233648] last:border-0">
                      <div className="flex items-center gap-3">
                        <Image src={pref.icon} alt={pref.label} width={20} height={20} />
                        <div>
                          <p className="text-sm font-semibold text-white">{pref.label}</p>
                          <p className="text-xs text-[#92adc9]">{pref.desc}</p>
                        </div>
                      </div>
                      <div className="relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-blue-700 transition-colors">
                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#152232] border border-[#233648] rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-1">App Version</h2>
                <p className="text-sm text-[#92adc9]">TaskMaster Pro — v1.0.0</p>
                <p className="text-xs text-[#92adc9] mt-1">Built with Next.js &amp; MongoDB</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
