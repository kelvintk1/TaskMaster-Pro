import {NextResponse} from 'next/server';
import {connectDB} from "@/lib/db";
import tasks from "@/models/tasks";

export async function GET() {
    await connectDB();
    const Task = await tasks.find();
    return NextResponse.json(Task); 
};

export async function POST(req: Request) {
    const body = await req.json();
    await connectDB();
    const Task = await tasks.create(body);
    return NextResponse.json(Task);
};