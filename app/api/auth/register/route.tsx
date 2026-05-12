import { NextResponse } from "next/server";

/** Placeholder route — extend when auth registration is implemented. */
export async function POST() {
  return NextResponse.json(
    { error: "Registration is not configured yet." },
    { status: 501 }
  );
}
