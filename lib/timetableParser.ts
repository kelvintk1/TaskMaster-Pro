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

const MODE_RE = /\b(online|onsite|on[\s-]?site|physical|virtual|in[\s-]?person|hybrid)\b/i;

// ── Utilities ────────────────────────────────────────────────────────────────

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
  return "Lecture";
}

function cleanText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function extractDate(text: string): string {
  const m = text.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b\s*\d{1,2}(?:st|nd|rd|th)?/i) ||
    text.match(/\b\d{1,2}(?:st|nd|rd|th)?\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/i);
  return m ? m[0].trim() : "";
}

/**
 * Extract mode ONLY — never extract location unless an explicit
 * room/hall/lt/block keyword + ID is present.
 * "Onsite", "Physical", "Online" are MODE words, NOT locations.
 */
function extractMode(text: string): string {
  const m = text.match(MODE_RE);
  return m ? m[1].trim() : "";
}

/**
 * Extract location ONLY if an explicit venue keyword + alphanumeric ID exists.
 * e.g. "Room 204", "Hall B", "LT3", "Block A2"
 * "Theatre", "Onsite", "Physical" are NOT locations.
 */
function extractLocation(text: string): string {
  const m = text.match(/\b(room|rm|hall|lt|block|blk|building)\s+([A-Z0-9]{1,10})\b/i);
  if (!m) return "";
  const id = m[2].toLowerCase();
  // Never treat mode words as room IDs
  if (["online", "onsite", "physical", "virtual", "hybrid"].includes(id)) return "";
  return m[0].trim().slice(0, 50);
}

/**
 * Match a course code token against user's course list.
 * Strict — exact code match only.
 */
function matchCourseCode(code: string, courses: string[]): string | null {
  const norm = code.replace(/\s+/g, "").toUpperCase();
  for (const c of courses) {
    // Check code in parens e.g. "Networks (DCIT321)"
    const parenMatch = c.match(/\(([^)]+)\)/);
    if (parenMatch) {
      if (parenMatch[1].replace(/\s+/g, "").toUpperCase() === norm) return c;
      continue;
    }
    // Extract just the code part (letters+digits) from the course string
    const codeOnly = c.match(/\b([A-Z]{2,6}\d{3,4}[A-Z]?)\b/i);
    if (codeOnly && codeOnly[1].toUpperCase() === norm) return c;
    // Course string is just the code itself e.g. "DCIT321"
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
  const m =
    text.match(/(\d{1,2}(?::\d{2})\s*(?:am|pm)?)\s*[-–—to]+\s*(\d{1,2}(?::\d{2})\s*(?:am|pm)?)/i) ||
    text.match(/(\d{1,2}\s*(?:am|pm))\s*[-–—to]+\s*(\d{1,2}\s*(?:am|pm))/i);
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

// ── Strategy: Exam timetable (time-block sections) ───────────────────────────
/**
 * Handles the format seen in the debug output:
 *
 *   WEDNESDAY, APRIL 7, 2026
 *   7:30 AM
 *   DCIT321  Course Name  ...  Onsite/Physical
 *   DCIT323  Course Name  ...  Onsite/Online
 *   11:30 AM
 *   DCIT321  ...
 *
 * Logic:
 * - Track current day from "WEDNESDAY, APRIL 7, 2026" lines
 * - Track current start time from standalone time lines
 * - For each line containing a course code, extract course + mode
 * - Location is NEVER set unless an explicit room/hall/lt keyword appears
 */
function extractExamTimetable(text: string, courses: string[]): ParsedSession[] {
  const sessions: ParsedSession[] = [];
  const lines = text.split("\n");

  let currentDay = "";
  let currentDate = "";
  let currentStart = "";
  let currentEnd = "";
  const preambleType = guessType(text.slice(0, 300));

  // Course code pattern: 2-6 uppercase letters + 3-4 digits
  const COURSE_CODE_RE = /\b([A-Z]{2,6}\d{3,4}[A-Z]?)\b/;

  for (const line of lines) {
    const stripped = line.trim();
    if (!stripped) continue;

    // ── Detect day line e.g. "WEDNESDAY, APRIL 7, 2026" ──
    const dayFound = findDay(stripped);
    const dateFound = extractDate(stripped);
    if (dayFound && (dateFound || /\d{4}/.test(stripped))) {
      currentDay = dayFound;
      currentDate = dateFound;
      continue;
    }

    // ── Detect standalone time line e.g. "7:30 AM" or "11:30 AM" ──
    const range = extractTimeRange(stripped);
    if (range) {
      currentStart = range.start;
      currentEnd = range.end;
      continue;
    }
    const single = extractSingleTime(stripped);
    // Only treat as a time header if the line is short and mostly just a time
    if (single && stripped.replace(single.raw, "").trim().length < 10) {
      currentStart = single.start;
      const type = preambleType;
      currentEnd = addHours(single.start, defaultDuration(type));
      continue;
    }

    // ── Detect course line ──
    if (!currentDay || !currentStart) continue;

    const codeMatch = stripped.match(COURSE_CODE_RE);
    if (!codeMatch) continue;

    const code = codeMatch[1];

    // Only include if this code matches one of the user's courses
    const course = matchCourseCode(code, courses);
    if (!course) continue; // skip courses not in user's list

    // Extract mode from the line
    const mode = extractMode(stripped);

    // Location: strictly only explicit venue keyword + ID
    const location = extractLocation(stripped);

    const type = guessType(stripped + " " + text.slice(0, 300));

    sessions.push({
      course,
      day: currentDay,
      date: currentDate,
      startTime: currentStart,
      endTime: currentEnd,
      location,
      mode,
      type,
    });
  }

  return sessions;
}

// ── Strategy: Course-code segmented ─────────────────────────────────────────
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
    if (!course) continue; // skip non-user courses

    const day = findDay(context);
    if (!day) continue;

    const date = extractDate(context);
    const range = extractTimeRange(context);
    const single = !range ? extractSingleTime(context) : null;
    if (!range && !single) continue;

    let startTime: string, endTime: string, timeRaw: string;
    if (range) {
      startTime = range.start; endTime = range.end; timeRaw = range.raw;
    } else {
      startTime = single!.start;
      endTime = addHours(startTime, defaultDuration(guessType(context) || preambleType));
      timeRaw = single!.raw;
    }

    const timeIdx = context.indexOf(timeRaw);
    const afterTime = timeIdx !== -1 ? context.slice(timeIdx + timeRaw.length) : "";
    const location = extractLocation(afterTime);
    const mode = extractMode(afterTime);
    const type = guessType(context + " " + preamble);

    sessions.push({ course, day, date, startTime, endTime, location, mode, type });
  }

  return sessions;
}

// ── Strategy: Row-per-session ────────────────────────────────────────────────
function extractRowPerSession(text: string, courses: string[]): ParsedSession[] {
  const sessions: ParsedSession[] = [];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const range = extractTimeRange(line);
    const single = !range ? extractSingleTime(line) : null;
    if (!range && !single) continue;

    let day = findDay(line);
    if (!day) {
      for (let b = 1; b <= 5 && i - b >= 0; b++) {
        day = findDay(lines[i - b]);
        if (day) break;
      }
    }
    if (!day) continue;

    const startTime = range ? range.start : single!.start;
    const endTime = range ? range.end : addHours(single!.start, 1);
    const raw = range ? range.raw : single!.raw;

    const location = extractLocation(line.replace(raw, " "));
    const mode = extractMode(line);
    const date = extractDate(line);
    const type = guessType(line);

    // Only include if a user course is found in this line
    const COURSE_CODE_RE = /\b([A-Z]{2,6}\d{3,4}[A-Z]?)\b/g;
    let matched: string | null = null;
    let m;
    while ((m = COURSE_CODE_RE.exec(line)) !== null) {
      const c = matchCourseCode(m[1], courses);
      if (c) { matched = c; break; }
    }
    if (!matched) continue;

    sessions.push({ course: matched, day, date, startTime, endTime, location, mode, type });
  }

  return sessions;
}

// ── Strategy: Grid ───────────────────────────────────────────────────────────
function extractGrid(text: string, courses: string[]): ParsedSession[] {
  const sessions: ParsedSession[] = [];
  const lines = text.split("\n").filter(l => l.trim());
  const DAY_RE = new RegExp(`\\b(${DAYS.join("|")}|Mon|Tue|Tues|Wed|Weds|Thu|Thur|Thurs|Fri|Sat|Sun)\\b`, "gi");

  let headerIdx = -1;
  let headerDays: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const matches = [...lines[i].matchAll(new RegExp(DAY_RE.source, "gi"))];
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
      const COURSE_CODE_RE = /\b([A-Z]{2,6}\d{3,4}[A-Z]?)\b/;
      const cm = cell.match(COURSE_CODE_RE);
      if (!cm) return;
      const course = matchCourseCode(cm[1], courses);
      if (!course) return;
      const location = extractLocation(cell);
      const mode = extractMode(cell);
      const date = extractDate(line);
      const type = guessType(cell);
      sessions.push({ course, day, date, startTime: curStart!, endTime: curEnd!, location, mode, type });
    });
  }

  return sessions;
}

// ── Strategy: Day-block ──────────────────────────────────────────────────────
function extractDayBlocks(text: string, courses: string[]): ParsedSession[] {
  const sessions: ParsedSession[] = [];
  const lines = text.split("\n");
  let currentDay: string | null = null;

  for (const line of lines) {
    const stripped = line.trim();
    if (!stripped) continue;

    const dayOnly = stripped.match(
      new RegExp(`^(${DAYS.join("|")}|Mon|Tue|Tues|Wed|Weds|Thu|Thur|Thurs|Fri|Sat|Sun)[.:,\\s]*$`, "i")
    );
    if (dayOnly) { currentDay = resolveDay(dayOnly[1]); continue; }
    if (!currentDay) continue;

    const range = extractTimeRange(stripped);
    const single = !range ? extractSingleTime(stripped) : null;
    if (!range && !single) continue;

    const startTime = range ? range.start : single!.start;
    const endTime = range ? range.end : addHours(single!.start, 1);
    const raw = range ? range.raw : single!.raw;

    const COURSE_CODE_RE = /\b([A-Z]{2,6}\d{3,4}[A-Z]?)\b/;
    const cm = stripped.match(COURSE_CODE_RE);
    if (!cm) continue;
    const course = matchCourseCode(cm[1], courses);
    if (!course) continue;

    const location = extractLocation(stripped.replace(raw, " "));
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

  // Try exam-timetable strategy first (handles the section-header format)
  const exam = extractExamTimetable(clean, courses);
  if (exam.length > 0) return dedup(exam);

  // Fall back to other strategies
  const coded = extractCourseCoded(clean, courses);
  const rows = extractRowPerSession(clean, courses);
  const grid = extractGrid(clean, courses);
  const blocks = extractDayBlocks(clean, courses);

  const best = [coded, rows, grid, blocks].reduce((a, b) => b.length > a.length ? b : a, []);
  return dedup(best.length > 0 ? best : [coded, rows, grid, blocks].flat());
}