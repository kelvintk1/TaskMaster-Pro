"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BookOpen, Plus, X, Upload, FileText, ChevronRight, ChevronLeft, Check, Loader2, CalendarRange, Clock, MapPin, Pencil, Trash2, BellRing, BellOff } from "lucide-react";
import { useTasks } from "../context/TaskContext";

interface Course { _id: string; name: string; code: string; color: string; }
interface ParsedEntry { course: string; day: string; startTime: string; endTime: string; location: string; type: string; }

const COLORS = ["#2563EB","#7C3AED","#DB2777","#DC2626","#D97706","#16A34A","#0891B2","#64748B"];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TYPES = ["Lecture","Tutorial","Lab","Study","Seminar","Workshop","Other"];

function Toast({ msg, type, onDone }: { msg: string; type: "success"|"error"; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white font-semibold text-sm ${type === "success" ? "bg-blue-700" : "bg-red-600"}`}>
      {type === "success" ? <Check size={16}/> : <X size={16}/>}{msg}
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {[1,2,3].map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
            ${step > s ? "bg-blue-600 border-blue-600 text-white" : step === s ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-[#152232] border-[#233648] text-[#92adc9]"}`}>
            {step > s ? <Check size={14}/> : s}
          </div>
          {i < 2 && <div className={`w-20 h-0.5 transition-all duration-500 ${step > s + 0.5 ? "bg-blue-600" : "bg-[#233648]"}`}/>}
        </div>
      ))}
    </div>
  );
}

export default function TimetablePage() {
  const { refreshTasks } = useTasks();
  const [step, setStep] = useState<1|2|3>(1);
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"}|null>(null);

  // Step 1 – courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [cName, setCName] = useState("");
  const [cCode, setCCode] = useState("");
  const [cColor, setCColor] = useState(COLORS[0]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Step 2 – upload
  const [file, setFile] = useState<File|null>(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 3 – review
  const [sessions, setSessions] = useState<ParsedEntry[]>([]);
  const [editingIdx, setEditingIdx] = useState<number|null>(null);
  const [editRow, setEditRow] = useState<ParsedEntry|null>(null);
  const [weeks, setWeeks] = useState("12");
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderAmt, setReminderAmt] = useState("30");
  const [reminderUnit, setReminderUnit] = useState<"minutes"|"hours">("minutes");
  const [generating, setGenerating] = useState(false);

  // Load courses from DB
  useEffect(() => {
    fetch("/api/courses").then(r => r.json()).then(data => { setCourses(Array.isArray(data) ? data : []); }).catch(console.error).finally(() => setLoadingCourses(false));
  }, []);

  const addCourse = async () => {
    if (!cName.trim()) return;
    try {
      const res = await fetch("/api/courses", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ name: cName.trim(), code: cCode.trim(), color: cColor }) });
      const created = await res.json();
      setCourses(p => [created, ...p]);
      setCName(""); setCCode(""); setCColor(COLORS[0]);
    } catch { setToast({ msg: "Failed to add course", type: "error" }); }
  };

  const removeCourse = async (id: string) => {
    try {
      await fetch("/api/courses", { method: "DELETE", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
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
    <div className="flex flex-col pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-3 mt-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
          <CalendarRange size={20} className="text-blue-400"/>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Timetable Import</h1>
          <p className="text-xs text-[#92adc9]">Auto-generate lecture tasks from your class schedule</p>
        </div>
      </div>

      <StepIndicator step={step}/>

      {/* ─── STEP 1: My Courses ─── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-[#152232] border border-[#233648] p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-blue-400"/>
              <h2 className="font-bold text-white text-lg">My Courses</h2>
              <span className="ml-auto text-xs text-[#92adc9]">{courses.length} added</span>
            </div>

            {/* Add course form */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input className={`${inputCls} flex-[2]`} placeholder="Course name (e.g. Data Structures)" value={cName} onChange={e => setCName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCourse()} />
              <input className={`${inputCls} flex-1`} placeholder="Code (optional, e.g. CS201)" value={cCode} onChange={e => setCCode(e.target.value)} onKeyDown={e => e.key === "Enter" && addCourse()} />
            </div>

            {/* Color picker */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-[#92adc9]">Colour:</span>
              {COLORS.map(c => (
                <button key={c} onClick={() => setCColor(c)} className={`w-6 h-6 rounded-full border-2 transition-all ${cColor === c ? "border-white scale-110" : "border-transparent"}`} style={{ backgroundColor: c }}/>
              ))}
              <button onClick={addCourse} disabled={!cName.trim()} className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all">
                <Plus size={14}/> Add
              </button>
            </div>

            {/* Course chips */}
            {loadingCourses ? (
              <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-blue-400"/></div>
            ) : courses.length === 0 ? (
              <p className="text-center text-sm text-[#92adc9]/50 py-4">No courses yet — add yours above. You can also skip this step.</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto">
                {courses.map(c => (
                  <div key={c._id} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-semibold" style={{ backgroundColor: c.color + "33", border: `1.5px solid ${c.color}66` }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}/>
                    {c.name}{c.code && <span className="opacity-60 text-xs">({c.code})</span>}
                    <button onClick={() => removeCourse(c._id)} className="ml-1 opacity-50 hover:opacity-100"><X size={12}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all">
              Next: Upload Timetable <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: Upload ─── */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-[#152232] border border-[#233648] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Upload size={18} className="text-blue-400"/>
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
                  <FileText size={40} className="text-blue-400"/>
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-[#92adc9]">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                </div>
              ) : (
                <>
                  <Upload size={36} className="text-[#92adc9]/40"/>
                  <p className="font-semibold text-white">Drag & drop your timetable here</p>
                  <p className="text-sm text-[#92adc9]">or click to browse</p>
                  <div className="flex gap-2 mt-2">
                    {["PDF","Word","JPG","PNG"].map(t => (
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
              <ChevronLeft size={16}/> Back
            </button>
            <button onClick={parseTimetable} disabled={!file || parsing} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all">
              {parsing ? <><Loader2 size={16} className="animate-spin"/> Parsing...</> : <>Parse Timetable <ChevronRight size={16}/></>}
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: Review ─── */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-[#152232] border border-[#233648] p-5">
            <div className="flex items-center gap-2 mb-1">
              <Check size={18} className="text-green-400"/>
              <h2 className="font-bold text-white text-lg">Review Schedule</h2>
              <span className="ml-auto text-xs text-green-400 font-semibold">{sessions.length} sessions found</span>
            </div>
            <p className="text-xs text-[#92adc9] mb-4">Edit or remove rows before creating tasks.</p>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-[#233648]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0d1924] text-[#92adc9] text-xs uppercase tracking-wider">
                    <th className="px-3 py-2 text-left">Course</th>
                    <th className="px-3 py-2 text-left">Day</th>
                    <th className="px-3 py-2 text-left">Start</th>
                    <th className="px-3 py-2 text-left">End</th>
                    <th className="px-3 py-2 text-left hidden md:table-cell">Location</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr key={i} className={`border-t border-[#233648] transition-colors ${editingIdx === i ? "bg-blue-900/20" : "hover:bg-[#233648]/30"}`}>
                      {editingIdx === i && editRow ? (
                        <>
                          <td className="px-2 py-1"><input className={selectCls + " w-28"} value={editRow.course} onChange={e => setEditRow({...editRow, course: e.target.value})}/></td>
                          <td className="px-2 py-1"><select className={selectCls} value={editRow.day} onChange={e => setEditRow({...editRow, day: e.target.value})}>{DAYS.map(d => <option key={d}>{d}</option>)}</select></td>
                          <td className="px-2 py-1"><input type="time" className={selectCls} value={editRow.startTime} onChange={e => setEditRow({...editRow, startTime: e.target.value})}/></td>
                          <td className="px-2 py-1"><input type="time" className={selectCls} value={editRow.endTime} onChange={e => setEditRow({...editRow, endTime: e.target.value})}/></td>
                          <td className="px-2 py-1 hidden md:table-cell"><input className={selectCls + " w-24"} value={editRow.location} onChange={e => setEditRow({...editRow, location: e.target.value})}/></td>
                          <td className="px-2 py-1"><select className={selectCls} value={editRow.type} onChange={e => setEditRow({...editRow, type: e.target.value})}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></td>
                          <td className="px-2 py-1">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={saveEdit} className="p-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/40 text-green-400"><Check size={13}/></button>
                              <button onClick={() => setEditingIdx(null)} className="p-1.5 rounded-lg bg-[#233648] hover:bg-[#2a4060] text-[#92adc9]"><X size={13}/></button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-2 font-semibold text-white max-w-[120px] truncate">{s.course}</td>
                          <td className="px-3 py-2 text-[#92adc9]">{s.day}</td>
                          <td className="px-3 py-2 text-blue-400 font-mono">{s.startTime}</td>
                          <td className="px-3 py-2 text-[#92adc9] font-mono">{s.endTime}</td>
                          <td className="px-3 py-2 text-[#92adc9] hidden md:table-cell max-w-[100px] truncate">{s.location || "—"}</td>
                          <td className="px-3 py-2"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400">{s.type}</span></td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => startEdit(i)} className="p-1.5 rounded-lg hover:bg-[#233648] text-[#92adc9] hover:text-white"><Pencil size={13}/></button>
                              <button onClick={() => deleteSession(i)} className="p-1.5 rounded-lg hover:bg-red-900/30 text-[#92adc9] hover:text-red-400"><Trash2 size={13}/></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reminder */}
            <div className="rounded-2xl bg-[#152232] border border-[#233648] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {reminderOn ? <BellRing size={16} className="text-blue-400"/> : <BellOff size={16} className="text-[#92adc9]"/>}
                  <span className="font-semibold text-white text-sm">Reminder</span>
                </div>
                <button onClick={() => setReminderOn(v => !v)} className={`w-10 h-5 rounded-full transition-all relative ${reminderOn ? "bg-blue-600" : "bg-[#233648]"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${reminderOn ? "left-5" : "left-0.5"}`}/>
                </button>
              </div>
              {reminderOn && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#92adc9]">Remind me</span>
                  <input type="number" min="1" value={reminderAmt} onChange={e => setReminderAmt(e.target.value)} className="w-16 bg-[#0d1924] border border-[#233648] rounded-lg px-2 py-1 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500"/>
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
                <Clock size={16} className="text-blue-400"/>
                <span className="font-semibold text-white text-sm">Duration</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#92adc9]">Generate for</span>
                <input type="number" min="1" max="52" value={weeks} onChange={e => setWeeks(e.target.value)}
                  className="w-20 bg-[#0d1924] border border-[#233648] rounded-lg px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500"/>
                <span className="text-xs text-[#92adc9]">weeks from today</span>
              </div>
              <p className="text-xs text-blue-400 mt-2 font-semibold">= {totalTasks} tasks total</p>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#233648] hover:bg-[#233648] text-white font-semibold transition-all">
              <ChevronLeft size={16}/> Back
            </button>
            <button onClick={createTasks} disabled={generating || sessions.length === 0} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all">
              {generating ? <><Loader2 size={16} className="animate-spin"/> Creating...</> : <><Check size={16}/> Create {totalTasks} Tasks</>}
            </button>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)}/>}
    </div>
  );
}
