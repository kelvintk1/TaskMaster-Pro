"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BookOpen, Plus, X, Upload, FileText, ChevronRight, ChevronLeft, Check, Loader2, CalendarRange, Clock, Pencil, Trash2, BellRing, BellOff } from "lucide-react";
import { useTasks } from "../context/TaskContext";

interface Course { _id: string; name: string; code: string; color: string; }
interface ParsedEntry { course: string; day: string; date: string; startTime: string; endTime: string; location: string; mode: string; type: string; }

const COLORS = ["#2563EB", "#7C3AED", "#DB2777", "#16A34A", "#0891B2", "#D97706", "#DC2626", "#64748B"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TYPES = ["Lecture", "Tutorial", "Lab", "Exam", "Study", "Seminar", "Workshop", "Other"];

function formatAmPm(time24: string) {
  if (!time24) return "";
  const [h, m] = time24.split(":");
  let hours = parseInt(h, 10);
  if (isNaN(hours)) return time24;
  const suffix = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${hours.toString().padStart(2, "0")}:${m} ${suffix}`;
}

function Toast({ msg, type, onDone }: { msg: string; type: "success" | "error"; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white font-semibold text-sm ${type === "success" ? "bg-blue-700" : "bg-red-600"}`}>
      {type === "success" ? <Check size={16} /> : <X size={16} />}{msg}
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {[1, 2, 3].map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
            ${step > s ? "bg-blue-600 border-blue-600 text-white" : step === s ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-[#152232] border-[#233648] text-[#92adc9]"}`}>
            {step > s ? <Check size={14} /> : s}
          </div>
          {i < 2 && <div className={`w-20 h-0.5 transition-all duration-500 ${step > s + 0.5 ? "bg-blue-600" : "bg-[#233648]"}`} />}
        </div>
      ))}
    </div>
  );
}

export default function TimetablePage() {
  const { refreshTasks } = useTasks();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Step 1 – courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [cName, setCName] = useState("");
  const [cCode, setCCode] = useState("");

  const [loadingCourses, setLoadingCourses] = useState(true);

  // Step 2 – upload
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 3 – review
  const [sessions, setSessions] = useState<ParsedEntry[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<ParsedEntry | null>(null);
  const [weeks, setWeeks] = useState("12");
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderAmt, setReminderAmt] = useState("30");
  const [reminderUnit, setReminderUnit] = useState<"minutes" | "hours">("minutes");
  const [generating, setGenerating] = useState(false);

  // Load courses from DB
  useEffect(() => {
    fetch("/api/courses").then(r => r.json()).then(data => { setCourses(Array.isArray(data) ? data : []); }).catch(console.error).finally(() => setLoadingCourses(false));
  }, []);

  const addCourse = async () => {
    if (!cName.trim()) return;
    try {
      const autoColor = COLORS[courses.length % COLORS.length];
      const res = await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: cName.trim(), code: cCode.trim(), color: autoColor }) });
      const created = await res.json();
      setCourses(p => [created, ...p]);
      setCName(""); setCCode("");
    } catch { setToast({ msg: "Failed to add course", type: "error" }); }
  };

  const removeCourse = async (id: string) => {
    try {
      await fetch("/api/courses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setCourses(p => p.filter(c => c._id !== id));
    } catch { setToast({ msg: "Failed to remove course", type: "error" }); }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const parseTimetable = async () => {
    if (!file) return;
    setParsing(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("courses", JSON.stringify(courses.map(c => `${c.name}${c.code ? ` (${c.code})` : ""}`)));
      const res = await fetch("/api/timetable/parse", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");
      if (data.sessions.length === 0) { setToast({ msg: "No sessions found. Try a clearer file.", type: "error" }); return; }
      setSessions(data.sessions);
      setStep(3);
    } catch (err: any) {
      setToast({ msg: err.message || "Failed to parse timetable", type: "error" });
    } finally { setParsing(false); }
  };

  const deleteSession = (i: number) => setSessions(p => p.filter((_, idx) => idx !== i));
  const startEdit = (i: number) => { setEditingIdx(i); setEditRow({ ...sessions[i] }); };
  const saveEdit = () => {
    if (editingIdx === null || !editRow) return;
    setSessions(p => p.map((s, i) => i === editingIdx ? editRow : s));
    setEditingIdx(null); setEditRow(null);
  };

  const totalTasks = sessions.length * Math.max(1, parseInt(weeks) || 1);

  const createTasks = async () => {
    setGenerating(true);
    try {
      const minsBefore = reminderOn ? (reminderUnit === "hours" ? Number(reminderAmt) * 60 : Number(reminderAmt)) : 0;
      const res = await fetch("/api/timetable/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessions, weeks: parseInt(weeks) || 12, reminderMinutes: minsBefore }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      refreshTasks();
      setToast({ msg: `✓ ${data.created} tasks created successfully!`, type: "success" });
      setSessions([]); setFile(null); setStep(1);
    } catch (err: any) {
      setToast({ msg: err.message || "Failed to create tasks", type: "error" });
    } finally { setGenerating(false); }
  };

  const inputCls = "w-full bg-[#0d1924] border border-[#233648] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-[#92adc9]/50";
  const selectCls = "bg-[#0d1924] border border-[#233648] rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="flex flex-col pb-6 lg:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4 mt-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/30 to-violet-600/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-900/20">
          <CalendarRange size={22} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Timetable Import</h1>
          <p className="text-sm text-[#92adc9]">Import any schedule — lectures, exams, study sessions</p>
        </div>
      </div>

      <StepIndicator step={step} />

      {/* ─── STEP 1: My Courses ─── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-[#152232] border border-[#233648] p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-blue-400" />
              <h2 className="font-bold text-white text-lg">My Courses</h2>
              <span className="ml-auto text-xs text-[#92adc9]">{courses.length} added</span>
            </div>

            {/* Add course form */}
            <div className="flex flex-col gap-2 mb-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input className={`${inputCls} flex-[2]`} placeholder="Course name (e.g. Data Structures)" value={cName} onChange={e => setCName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCourse()} />
                <input className={`${inputCls} flex-1`} placeholder="Code (optional, e.g. CS201)" value={cCode} onChange={e => setCCode(e.target.value)} onKeyDown={e => e.key === "Enter" && addCourse()} />
              </div>
            </div>

            {/* Course chips */}
            {loadingCourses ? (
              <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-blue-400" /></div>
            ) : courses.length === 0 ? (
              <p className="text-center text-sm text-[#92adc9]/50 py-4">No courses yet — add yours above. You can also skip this step.</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
                {courses.map((c, idx) => {
                  const col = c.color || COLORS[idx % COLORS.length];
                  return (
                    <div key={c._id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white text-sm font-medium transition-all hover:scale-[1.02]" style={{ backgroundColor: col + "22", border: `1px solid ${col}55` }}>
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: col }} />
                      <span>{c.name}</span>
                      {c.code && <span className="text-xs opacity-50 font-normal">({c.code})</span>}
                      <button onClick={() => removeCourse(c._id)} className="ml-1 opacity-40 hover:opacity-90 hover:text-red-400 transition-colors"><X size={11} /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button onClick={addCourse} disabled={!cName.trim()} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all">
              <Plus size={14} /> Add Course
            </button>
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all">
              Next: Upload Timetable <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: Upload ─── */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-[#152232] border border-[#233648] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Upload size={18} className="text-blue-400" />
              <h2 className="font-bold text-white text-lg">Upload Timetable</h2>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all duration-300
                ${dragging ? "border-blue-400 bg-blue-500/10" : "border-[#233648] hover:border-blue-500/50 hover:bg-blue-500/5"}`}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText size={40} className="text-blue-400" />
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-[#92adc9]">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                </div>
              ) : (
                <>
                  <Upload size={36} className="text-[#92adc9]/40" />
                  <p className="font-semibold text-white">Drag & drop your timetable here</p>
                  <p className="text-sm text-[#92adc9]">or click to browse</p>
                  <div className="flex gap-2 mt-2">
                    {["PDF", "Word", "JPG", "PNG"].map(t => (
                      <span key={t} className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#233648] text-[#92adc9]">{t}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {courses.length === 0 && (
              <p className="text-xs text-amber-400/80 mt-3 flex items-center gap-1">
                ⚠ No courses added — AI will still try to extract all sessions it finds.
              </p>
            )}
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#233648] hover:bg-[#233648] text-white font-semibold transition-all">
              <ChevronLeft size={16} /> Back
            </button>
            <button onClick={parseTimetable} disabled={!file || parsing} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all">
              {parsing ? <><Loader2 size={16} className="animate-spin" /> Parsing...</> : <>Parse Timetable <ChevronRight size={16} /></>}
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: Review ─── */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-[#152232] border border-[#233648] p-5">
            <div className="flex items-center gap-2 mb-1">
              <Check size={18} className="text-green-400" />
              <h2 className="font-bold text-white text-lg">Review Schedule</h2>
              <span className="ml-auto text-xs text-green-400 font-semibold">{sessions.length} sessions found</span>
            </div>
            <p className="text-xs text-[#92adc9] mb-4">Edit or remove rows before creating tasks.</p>

            {/* Compute which optional columns have data */}
            {(() => {
              const hasLocation = sessions.some(s => s.location);
              const hasMode = sessions.some(s => s.mode);
              return (
                <div className="overflow-x-auto rounded-xl border border-[#1e3448]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#0a1520] text-[#5a7fa0] text-[11px] uppercase tracking-widest">
                        <th className="px-4 py-3 text-left font-semibold">Course</th>
                        <th className="px-4 py-3 text-left font-semibold">Day / Date</th>
                        <th className="px-4 py-3 text-left font-semibold">Start</th>
                        <th className="px-4 py-3 text-left font-semibold">End</th>
                        {hasLocation && <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Location</th>}
                        {hasMode && <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Mode</th>}
                        <th className="px-4 py-3 text-left font-semibold">Type</th>
                        <th className="px-4 py-3 text-center font-semibold">Edit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e3448]">
                      {sessions.map((s, i) => (
                        <tr key={i} className={`transition-colors duration-150 ${editingIdx === i ? "bg-blue-950/40" : "hover:bg-[#1a2d42]/50"}`}>
                          {editingIdx === i && editRow ? (
                            <>
                              <td className="px-3 py-2"><input className={selectCls + " w-28"} value={editRow.course} onChange={e => setEditRow({ ...editRow, course: e.target.value })} /></td>
                              <td className="px-3 py-2">
                                <div className="flex flex-col gap-1">
                                  <select className={selectCls} value={editRow.day} onChange={e => setEditRow({ ...editRow, day: e.target.value })}>{DAYS.map(d => <option key={d}>{d}</option>)}</select>
                                  <input className={selectCls} value={editRow.date} onChange={e => setEditRow({ ...editRow, date: e.target.value })} placeholder="Date (e.g. April 7)" />
                                </div>
                              </td>
                              <td className="px-3 py-2"><input type="time" className={selectCls} value={editRow.startTime} onChange={e => setEditRow({ ...editRow, startTime: e.target.value })} /></td>
                              <td className="px-3 py-2"><input type="time" className={selectCls} value={editRow.endTime} onChange={e => setEditRow({ ...editRow, endTime: e.target.value })} /></td>
                              {hasLocation && <td className="px-3 py-2 hidden md:table-cell"><input className={selectCls + " w-28"} value={editRow.location} onChange={e => setEditRow({ ...editRow, location: e.target.value })} /></td>}
                              {hasMode && <td className="px-3 py-2 hidden md:table-cell"><input className={selectCls + " w-32"} value={editRow.mode} onChange={e => setEditRow({ ...editRow, mode: e.target.value })} /></td>}
                              <td className="px-3 py-2"><select className={selectCls} value={editRow.type} onChange={e => setEditRow({ ...editRow, type: e.target.value })}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></td>
                              <td className="px-3 py-2">
                                <div className="flex items-center justify-center gap-1">
                                  <button onClick={saveEdit} className="p-1.5 rounded-lg bg-green-600/20 hover:bg-green-500/30 text-green-400 transition-colors"><Check size={13} /></button>
                                  <button onClick={() => setEditingIdx(null)} className="p-1.5 rounded-lg bg-[#1e3448] hover:bg-[#2a4060] text-[#92adc9] transition-colors"><X size={13} /></button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3 font-semibold text-white max-w-[140px] truncate">{s.course}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <span className="text-[#92adc9]">{s.day}</span>
                                  {s.date && <span className="text-[10px] text-blue-400 font-medium">{s.date}</span>}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-blue-400 font-mono text-xs">{formatAmPm(s.startTime)}</td>
                              <td className="px-4 py-3 text-[#5a7fa0] font-mono text-xs">{formatAmPm(s.endTime)}</td>
                              {hasLocation && <td className="px-4 py-3 text-[#92adc9] hidden md:table-cell max-w-[140px] truncate text-xs" title={s.location}>{s.location || <span className="opacity-30">—</span>}</td>}
                              {hasMode && <td className="px-4 py-3 text-[#92adc9] hidden md:table-cell max-w-[160px] truncate text-xs" title={s.mode}>{s.mode || <span className="opacity-30">—</span>}</td>}
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${s.type === "Exam" ? "bg-red-900/30 text-red-400" :
                                  s.type === "Lab" ? "bg-emerald-900/30 text-emerald-400" :
                                    s.type === "Tutorial" ? "bg-violet-900/30 text-violet-400" :
                                      s.type === "Study" ? "bg-amber-900/30 text-amber-400" :
                                        "bg-blue-900/30 text-blue-400"
                                  }`}>{s.type}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  <button onClick={() => startEdit(i)} className="p-1.5 rounded-lg hover:bg-[#1e3448] text-[#5a7fa0] hover:text-white transition-colors"><Pencil size={12} /></button>
                                  <button onClick={() => deleteSession(i)} className="p-1.5 rounded-lg hover:bg-red-900/20 text-[#5a7fa0] hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reminder */}
            <div className="rounded-2xl bg-[#152232] border border-[#233648] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {reminderOn ? <BellRing size={16} className="text-blue-400" /> : <BellOff size={16} className="text-[#92adc9]" />}
                  <span className="font-semibold text-white text-sm">Reminder</span>
                </div>
                <button onClick={() => setReminderOn(v => !v)} className={`w-10 h-5 rounded-full transition-all relative ${reminderOn ? "bg-blue-600" : "bg-[#233648]"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${reminderOn ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
              {reminderOn && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#92adc9]">Remind me</span>
                  <input type="number" min="1" value={reminderAmt} onChange={e => setReminderAmt(e.target.value)} className="w-16 bg-[#0d1924] border border-[#233648] rounded-lg px-2 py-1 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <select value={reminderUnit} onChange={e => setReminderUnit(e.target.value as any)} className={selectCls}>
                    <option value="minutes">minutes</option>
                    <option value="hours">hours</option>
                  </select>
                  <span className="text-xs text-[#92adc9]">before</span>
                </div>
              )}
              {!reminderOn && <p className="text-xs text-[#92adc9]/60">Enable to get notified before each lecture</p>}
            </div>

            {/* Weeks */}
            <div className="rounded-2xl bg-[#152232] border border-[#233648] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-blue-400" />
                <span className="font-semibold text-white text-sm">Duration</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#92adc9]">Generate for</span>
                <input type="number" min="1" max="52" value={weeks} onChange={e => setWeeks(e.target.value)}
                  className="w-20 bg-[#0d1924] border border-[#233648] rounded-lg px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span className="text-xs text-[#92adc9]">weeks from today</span>
              </div>
              <p className="text-xs text-blue-400 mt-2 font-semibold">= {totalTasks} tasks total</p>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#233648] hover:bg-[#233648] text-white font-semibold transition-all">
              <ChevronLeft size={16} /> Back
            </button>
            <button onClick={createTasks} disabled={generating || sessions.length === 0} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all">
              {generating ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Check size={16} /> Create {totalTasks} Tasks</>}
            </button>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
