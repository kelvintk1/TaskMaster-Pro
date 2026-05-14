import { NextRequest, NextResponse } from "next/server";
import { parseTimetableText } from "@/lib/timetableParser";

export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Text extraction helpers (all run server-side, no external API)
// ---------------------------------------------------------------------------

async function extractFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const extractRawText =
    mammoth.extractRawText ?? (mammoth as any).default?.extractRawText;
  if (!extractRawText) throw new Error("Mammoth failed to load.");
  const { value } = await extractRawText({ buffer });
  return value;
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  const { getDocumentProxy, extractText } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });

  // Strip PDF structural artifacts that unpdf sometimes emits
  return text
    .replace(/\bblock\s+elements?\b/gi, "")
    .replace(/\binline\s+elements?\b/gi, "")
    .replace(/\bbox\s+elements?\b/gi, "")
    .replace(/\bspan\s+elements?\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function extractFromImage(buffer: Buffer, mimeType: string): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    // tesseract.js v4+ accepts a Buffer directly
    const { data: { text } } = await worker.recognize(buffer);
    return text;
  } finally {
    await worker.terminate();
  }
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const coursesJson = formData.get("courses") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const courses: string[] = coursesJson ? JSON.parse(coursesJson) : [];
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type;
    const fileName = file.name.toLowerCase();

    // ── Extract raw text ──────────────────────────────────────────────────
    let rawText = "";

    if (mimeType.includes("wordprocessingml") || fileName.endsWith(".docx")) {
      rawText = await extractFromDocx(buffer);
    } else if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      rawText = await extractFromPdf(buffer);
    } else if (
      mimeType.startsWith("image/") ||
      [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".tif"].some((ext) =>
        fileName.endsWith(ext)
      )
    ) {
      rawText = await extractFromImage(buffer, mimeType);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, Word document, or image." },
        { status: 415 }
      );
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "Could not extract any text from the file. Try a clearer scan or a text-based PDF." },
        { status: 422 }
      );
    }

    // ── Parse timetable ───────────────────────────────────────────────────
    // DEBUG: log extracted text so we can tune the parser
    console.log("[timetable/parse] Extracted text (first 2000 chars):\n", rawText.slice(0, 2000));

    const sessions = parseTimetableText(rawText, courses);

    if (sessions.length === 0) {
      // Return the extracted text in dev so we can inspect it
      return NextResponse.json(
        {
          error: "No timetable sessions found. Make sure the file contains a schedule with days and times.",
          debug_rawText: rawText.slice(0, 3000),
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ sessions });
  } catch (err: any) {
    console.error("Parse error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse timetable" },
      { status: 500 }
    );
  }
}