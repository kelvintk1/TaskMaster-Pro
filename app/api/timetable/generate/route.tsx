import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tasks from "@/models/tasks";

function getDateForWeekday(dayName: string, weekOffset: number): Date {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const target = days.indexOf(dayName);
  if (target === -1) return new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let daysUntil = (target - today.getDay() + 7) % 7;
  if (daysUntil === 0) daysUntil = 7; // always start from the next upcoming occurrence
  const date = new Date(today);
  date.setDate(today.getDate() + daysUntil + weekOffset * 7);
  return date;
}

function calcReminder(dueDate: Date, startTime: string, minsBefore: number) {
  const [h, m] = startTime.split(":").map(Number);
  const lecture = new Date(dueDate);
  lecture.setHours(h, m, 0, 0);
  const rem = new Date(lecture.getTime() - minsBefore * 60000);
  return {
    reminderDate: new Date(rem.toDateString()),
    reminderTime: `${String(rem.getHours()).padStart(2, "0")}:${String(rem.getMinutes()).padStart(2, "0")}`,
  };
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { sessions, weeks, reminderMinutes } = await req.json();

    if (!sessions?.length) return NextResponse.json({ error: "No sessions provided" }, { status: 400 });

    const weeksCount = Math.max(1, Math.min(52, parseInt(weeks) || 12));
    const remind = Number(reminderMinutes) > 0;
    const tasks: any[] = [];

    for (let w = 0; w < weeksCount; w++) {
      for (const s of sessions) {
        const dueDate = getDateForWeekday(s.day, w);
        const loc = s.location ? ` | 📍 ${s.location}` : "";
        const end = s.endTime ? ` – ${s.endTime}` : "";
        const reminderFields = remind ? calcReminder(dueDate, s.startTime, Number(reminderMinutes)) : { reminderDate: null, reminderTime: null };
        tasks.push({
          title: `${s.course} — ${s.type}`,
          description: `${s.type} for ${s.course}${loc}. Time: ${s.startTime}${end}`,
          dueDate,
          dueTime: s.startTime,
          remind,
          ...reminderFields,
          priority: false,
          completed: false,
          source: "timetable",
          courseCode: s.course,
        });
      }
    }

    const created = await Tasks.insertMany(tasks);
    return NextResponse.json({ created: created.length });
  } catch (err: any) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: err.message || "Failed to create tasks" }, { status: 500 });
  }
}
