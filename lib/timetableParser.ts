export interface ParsedSession {
  course: string;
  day: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  mode: string;
  type: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DAY_ABBREV: Record<string, string> = {
  mon: "Monday", tue: "Tuesday", tues: "Tuesday", wed: "Wednesday",
  weds: "Wednesday", thu: "Thursday", thur: "Thursday", thurs: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
};

const TYPE_KEYWORDS: Record<string, string> = {
  exam: "Exam", exams: "Exam", examination: "Exam", test: "Exam",
  lecture: "Lecture", lec: "Lecture",
  tutorial: "Tutorial", tut: "Tutorial",
  lab: "Lab", practical: "Lab", prac: "Lab",
  seminar: "Seminar", sem: "Seminar",
  workshop: "Workshop",
  study: "Study", revision: "Study",
};

const MODE_RE = /\b(online|onsite|on[\s-]?site|physical|virtual|in[\s-]?person|hybrid|remote)\b/i;

// ── Utilities ────────────────────────────────────────────────────────────────

function cleanText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function hasLocationOrVenueColumn(text: string): boolean {
  // Only activate location extraction if "LOCATION" or "VENUE" appears on a header line
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.length < 150 && /\b(location|venue)\b/i.test(line) && /\b(time|date|course|code|subject|mode)\b/i.test(line)) {
      return true;
    }
  }
  return false;
}

function normaliseTime(raw: string): string {
  const m = raw.trim().match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/i);
  if (!m) return "";
  let h = parseInt(m[1], 10);
  const minStr = m[2] || "00";
  const mins = parseInt(minStr, 10);
  const mer = (m[3] ?? "").toLowerCase();
  if (mins < 0 || mins > 59) return "";
  if (mer && (h < 1 || h > 12)) return "";
  if (!mer && (h < 0 || h > 23)) return "";
  if (mer === "pm" && h !== 12) h += 12;
  if (mer === "am" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${minStr.padStart(2, "0")}`;
}

function addHours(t: string, n: number): string {
  const [h, m] = t.split(":").map(Number);
  return `${((h + n) % 24).toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function findDay(text: string): string | null {
  const up = text.toUpperCase();
  for (const d of [...DAYS].sort((a, b) => b.length - a.length)) {
    if (up.includes(d.toUpperCase())) return d;
  }
  return null;
}

function resolveDay(raw: string): string | null {
  const lo = raw.toLowerCase().trim();
  for (const d of DAYS) if (d.toLowerCase() === lo) return d;
  return DAY_ABBREV[lo] ?? null;
}

function guessType(text: string): string {
  const lo = text.toLowerCase().replace(/[^a-z]/g, " ");
  for (const [kw, val] of Object.entries(TYPE_KEYWORDS)) {
    if (new RegExp(`\\b${kw}\\b`).test(lo)) return val;
  }
  return "Exam";
}

function extractDate(text: string): string {
  const m = text.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b\s*\d{1,2}(?:st|nd|rd|th)?/i) ||
    text.match(/\b\d{1,2}(?:st|nd|rd|th)?\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/i);
  return m ? m[0].trim() : "";
}

function extractMode(text: string): string {
  const fullMatch = text.match(/\b(Onsite\/Physical|Onsite\/Online|Physical|Online|Virtual|Hybrid)\b/i);
  if (fullMatch) return fullMatch[1].trim();
  const m = text.match(MODE_RE);
  return m ? m[1].trim() : "";
}

/** Location only allowed if "Location" or "Venue" column exists */
function extractLocation(text: string, hasColumn: boolean): string {
  if (!hasColumn) return "";

  const m = text.match(/\b(room|rm|hall|lt|lecture theatre|auditorium|block|blk|building|venue|lab|classroom)\b\s*[:\-]?\s*([A-Z0-9]{1,10}(?:\s+[A-Z0-9]{1,10})?)\b/i);
  if (!m) return "";

  const fullMatch = m[0].trim().toLowerCase();
  if (/main|chs|acc|campus|batch|only|sakai|student|exam|communicated|later/i.test(fullMatch)) return "";

  return m[0].trim();
}

function matchCourseCode(code: string, courses: string[]): string | null {
  const norm = code.replace(/\s+/g, "").toUpperCase();
  for (const c of courses) {
    const parenMatch = c.match(/\(([^)]+)\)/);
    if (parenMatch && parenMatch[1].replace(/\s+/g, "").toUpperCase() === norm) return c;

    const codeOnly = c.match(/\b([A-Z]{2,6}\s*\d{3,4}[A-Z]?)\b/i);
    if (codeOnly && codeOnly[1].replace(/\s+/g, "").toUpperCase() === norm) return c;

    if (c.replace(/\s+/g, "").toUpperCase() === norm) return c;
  }
  return null;
}

function dedup(sessions: ParsedSession[]): ParsedSession[] {
  const seen = new Set<string>();
  return sessions.filter((s) => {
    const k = `${s.course}|${s.day}|${s.date}|${s.startTime}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ── Time helpers ─────────────────────────────────────────────────────────────

function extractTimeRange(text: string): { start: string; end: string; raw: string } | null {
  const m = text.match(/(\d{1,2}(?::\d{2})\s*(?:am|pm)?)\s*(?:[-–—]|to|\s+)\s*(\d{1,2}(?::\d{2})\s*(?:am|pm)?)/i) ||
    text.match(/(\d{1,2}\s*(?:am|pm))\s*(?:[-–—]|to|\s+)\s*(\d{1,2}\s*(?:am|pm))/i);
  if (!m) return null;
  const start = normaliseTime(m[1]);
  const end = normaliseTime(m[2]);
  if (!start || !end) return null;
  return { start, end, raw: m[0] };
}

function extractSingleTime(text: string): { start: string; raw: string } | null {
  const m = text.match(/\b(\d{1,2}:\d{2})\s*(am|pm)?\b/i) ||
    text.match(/\b(\d{1,2})\s*(am|pm)\b/i);
  if (!m) return null;
  const start = normaliseTime(m[1] + (m[2] ?? ""));
  if (!start) return null;
  return { start, raw: m[0] };
}

function defaultDuration(type: string): number {
  return ({ Exam: 3, Lab: 2, Workshop: 2, Study: 2 } as Record<string, number>)[type] ?? 1;
}

// ── Main Strategy: Exam Timetable ───────────────────────
function extractExamTimetable(text: string, courses: string[]): ParsedSession[] {
  const hasLocationColumn = hasLocationOrVenueColumn(text);
  const sessions: ParsedSession[] = [];
  const lines = text.split("\n");

  let currentDay = "";
  let currentDate = "";
  let currentStart = "";
  let currentEnd = "";
  const preambleType = guessType(text.slice(0, 300));

  for (const line of lines) {
    const stripped = line.trim();
    if (!stripped) continue;

    // Detect day + date
    const dayFound = findDay(stripped);
    const dateFound = extractDate(stripped);
    if (dayFound && (dateFound || /\d{4}/.test(stripped))) {
      currentDay = dayFound;
      currentDate = dateFound;
    } else if (dayFound && !currentDay) {
      currentDay = dayFound;
    }

    // Detect time
    const range = extractTimeRange(stripped);
    if (range) {
      currentStart = range.start;
      currentEnd = range.end;
    } else {
      const single = extractSingleTime(stripped);
      if (single) {
        currentStart = single.start;
        currentEnd = addHours(single.start, defaultDuration(preambleType));
      }
    }

    if (!currentDay || !currentStart) continue;

    // Support multiple courses on the same line
    const COURSE_CODE_RE_GLOBAL = /\b([A-Z]{2,6}\s*\d{3,4}[A-Z]?)\b/g;
    let m;
    while ((m = COURSE_CODE_RE_GLOBAL.exec(stripped)) !== null) {
      const code = m[1];
      const course = matchCourseCode(code, courses);
      if (!course) continue;

      const mode = extractMode(stripped);
      const location = extractLocation(stripped, hasLocationColumn);
      const type = guessType(stripped + " " + text.slice(0, 300));

      sessions.push({
        course,
        day: currentDay,
        date: currentDate,
        startTime: currentStart,
        endTime: currentEnd || addHours(currentStart, defaultDuration(type)),
        location,
        mode,
        type,
      });
    }
  }

  return sessions;
}

// Other strategies (kept for fallback)
function extractCourseCoded(text: string, courses: string[]): ParsedSession[] {
  const sessions: ParsedSession[] = [];
  const preamble = text.slice(0, 400);
  const preambleType = guessType(preamble);
  const parts = text.split(/\b([A-Z]{2,6}\s*\d{3,4}[A-Z]?)\b/);

  for (let i = 1; i < parts.length; i += 2) {
    const code = parts[i].trim().replace(/\s+/g, "");
    const context = (parts[i + 1] ?? "").trim();
    if (!code || !context) continue;

    const course = matchCourseCode(code, courses);
    if (!course) continue;

    const day = findDay(context);
    if (!day) continue;

    const date = extractDate(context);
    const range = extractTimeRange(context);
    const single = !range ? extractSingleTime(context) : null;
    if (!range && !single) continue;

    let startTime: string, endTime: string, timeRaw: string;
    if (range) {
      startTime = range.start;
      endTime = range.end;
      timeRaw = range.raw;
    } else {
      startTime = single!.start;
      endTime = addHours(startTime, defaultDuration(guessType(context) || preambleType));
      timeRaw = single!.raw;
    }

    const timeIdx = context.indexOf(timeRaw);
    const afterTime = timeIdx !== -1 ? context.slice(timeIdx + timeRaw.length) : "";
    const hasColumn = hasLocationOrVenueColumn(text);
    const location = extractLocation(afterTime, hasColumn);
    const mode = extractMode(afterTime);
    const type = guessType(context + " " + preamble);

    sessions.push({ course, day, date, startTime, endTime, location, mode, type });
  }
  return sessions;
}

function extractRowPerSession(text: string, courses: string[]): ParsedSession[] {
  const sessions: ParsedSession[] = [];
  const lines = text.split("\n");
  const hasColumn = hasLocationOrVenueColumn(text);

  let currentDay = "";
  let currentDate = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const dayFound = findDay(line);
    const dateFound = extractDate(line);
    if (dayFound) {
      currentDay = dayFound;
      if (dateFound || /\d{4}/.test(line)) {
        currentDate = dateFound;
      }
    }

    const range = extractTimeRange(line);
    const single = !range ? extractSingleTime(line) : null;
    if (!range && !single) continue;

    if (!currentDay) continue;

    const startTime = range ? range.start : single!.start;
    const endTime = range ? range.end : addHours(single!.start, 1);
    const raw = range ? range.raw : single!.raw;

    const location = extractLocation(line.replace(raw, " "), hasColumn);
    const mode = extractMode(line);
    const date = currentDate || extractDate(line);
    const type = guessType(line);

    const COURSE_CODE_RE = /\b([A-Z]{2,6}\s*\d{3,4}[A-Z]?)\b/g;
    let matched: string | null = null;
    let m;
    while ((m = COURSE_CODE_RE.exec(line)) !== null) {
      const c = matchCourseCode(m[1], courses);
      if (c) { matched = c; break; }
    }
    if (!matched) continue;

    sessions.push({ course: matched, day: currentDay, date, startTime, endTime, location, mode, type });
  }
  return sessions;
}

function extractGrid(text: string, courses: string[]): ParsedSession[] {
  const sessions: ParsedSession[] = [];
  const lines = text.split("\n").filter(l => l.trim());
  const hasColumn = hasLocationOrVenueColumn(text);
  const DAY_RE = new RegExp(`\\b(${DAYS.join("|")}|Mon|Tue|Tues|Wed|Weds|Thu|Thur|Thurs|Fri|Sat|Sun)\\b`, "gi");

  let headerIdx = -1;
  let headerDays: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const matches = [...lines[i].matchAll(DAY_RE)];
    if (matches.length >= 2) {
      headerIdx = i;
      headerDays = matches.map(m => resolveDay(m[0]) ?? m[0]);
      break;
    }
  }
  if (headerIdx === -1) return sessions;

  let curStart: string | null = null;
  let curEnd: string | null = null;

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    const range = extractTimeRange(line);
    const single = !range ? extractSingleTime(line) : null;
    if (range) { curStart = range.start; curEnd = range.end; }
    else if (single) { curStart = single.start; curEnd = addHours(single.start, 1); }
    if (!curStart) continue;

    const cells = line.split(/\t|\s{2,}/).map(c => c.trim()).filter(Boolean);
    if (cells.length < headerDays.length) continue;

    const off = extractSingleTime(cells[0]) ? 1 : 0;
    headerDays.forEach((day, idx) => {
      const cell = cells[off + idx]?.trim();
      if (!cell || cell === "-" || cell.length < 2) return;

      const cm = cell.match(/\b([A-Z]{2,6}\s*\d{3,4}[A-Z]?)\b/);
      if (!cm) return;
      const course = matchCourseCode(cm[1], courses);
      if (!course) return;

      const location = extractLocation(cell, hasColumn);
      const mode = extractMode(cell);
      const date = extractDate(line);
      const type = guessType(cell);

      sessions.push({ course, day, date, startTime: curStart!, endTime: curEnd!, location, mode, type });
    });
  }
  return sessions;
}

function extractDayBlocks(text: string, courses: string[]): ParsedSession[] {
  const sessions: ParsedSession[] = [];
  const lines = text.split("\n");
  const hasColumn = hasLocationOrVenueColumn(text);
  let currentDay: string | null = null;

  for (const line of lines) {
    const stripped = line.trim();
    if (!stripped) continue;

    const dayOnly = stripped.match(new RegExp(`^(${DAYS.join("|")}|Mon|Tue|Tues|Wed|Weds|Thu|Thur|Thurs|Fri|Sat|Sun)[.:,\\s]*$`, "i"));
    if (dayOnly) {
      currentDay = resolveDay(dayOnly[1]);
      continue;
    }
    if (!currentDay) continue;

    const range = extractTimeRange(stripped);
    const single = !range ? extractSingleTime(stripped) : null;
    if (!range && !single) continue;

    const startTime = range ? range.start : single!.start;
    const endTime = range ? range.end : addHours(single!.start, 1);
    const raw = range ? range.raw : single!.raw;

    const cm = stripped.match(/\b([A-Z]{2,6}\s*\d{3,4}[A-Z]?)\b/);
    if (!cm) continue;
    const course = matchCourseCode(cm[1], courses);
    if (!course) continue;

    const location = extractLocation(stripped.replace(raw, " "), hasColumn);
    const mode = extractMode(stripped);
    const date = extractDate(line);
    const type = guessType(stripped);

    sessions.push({ course, day: currentDay, date, startTime, endTime, location, mode, type });
  }
  return sessions;
}

// ── Main export ──────────────────────────────────────────────────────────────
export function parseTimetableText(text: string, courses: string[]): ParsedSession[] {
  const clean = cleanText(text);

  const rows = extractRowPerSession(clean, courses);
  const grid = extractGrid(clean, courses);
  const blocks = extractDayBlocks(clean, courses);
  const exam = extractExamTimetable(clean, courses);
  const coded = extractCourseCoded(clean, courses);

  const strategies = [rows, grid, blocks, exam, coded];
  const best = strategies.reduce((a, b) => b.length > a.length ? b : a, []);
  return dedup(best.length > 0 ? best : strategies.flat());
}