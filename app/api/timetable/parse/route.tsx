import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

function buildPrompt(courses: string[]): string {
  const courseList = courses.length > 0 ? courses.join(", ") : "any courses found in the timetable";
  return `You are a university timetable parser. Extract ALL class sessions from this timetable.
The student is enrolled in these courses: ${courseList}.
Return ONLY a valid JSON array (no markdown, no code blocks, no explanation). Each object must have exactly:
[{"course":"course name (match list above when possible)","day":"Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday","startTime":"HH:MM 24hr","endTime":"HH:MM 24hr","location":"room or empty string","type":"Lecture|Tutorial|Lab|Study|Seminar|Workshop|Other"}]
If no schedule found, return: []`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const coursesJson = formData.get("courses") as string;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const courses: string[] = coursesJson ? JSON.parse(coursesJson) : [];
    const prompt = buildPrompt(courses);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type;

    let result;
    if (mimeType.includes("wordprocessingml") || file.name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      // Handle both ESM and CJS import variations
      const extractRawText = mammoth.extractRawText || (mammoth as any).default?.extractRawText;
      if (!extractRawText) throw new Error("Mammoth library failed to load correctly.");
      
      const { value: text } = await extractRawText({ buffer });
      result = await model.generateContent(`${prompt}\n\nTIMETABLE CONTENT:\n${text}`);
    } else {
      const base64 = buffer.toString("base64");
      result = await model.generateContent([prompt, { inlineData: { data: base64, mimeType: mimeType || "application/pdf" } }]);
    }

    const raw = result.response.text().trim()
      .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

    let sessions;
    try { sessions = JSON.parse(raw); } catch {
      return NextResponse.json({ error: "Could not parse timetable. Try a clearer image or document." }, { status: 422 });
    }

    if (!Array.isArray(sessions)) return NextResponse.json({ error: "Unexpected AI response format." }, { status: 422 });

    return NextResponse.json({ sessions });
  } catch (err: any) {
    console.error("Parse error:", err);
    return NextResponse.json({ error: err.message || "Failed to parse timetable" }, { status: 500 });
  }
}
