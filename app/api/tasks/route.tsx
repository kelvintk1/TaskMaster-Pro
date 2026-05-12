import {NextResponse} from 'next/server';
import {connectDB} from "@/lib/db";
import tasks from "@/models/tasks";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const completedParam = searchParams.get('completed');
        
        await connectDB();
        
        let query = {};
        if (completedParam !== null) {
            query = { completed: completedParam === 'true' };
        }

        const Task = await tasks.find(query).sort({ dateCreated: -1 });
        return NextResponse.json(Task);
    } catch (error: any) {
        console.error('GET /api/tasks error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tasks', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await connectDB();
        const Task = await tasks.create(body);
        return NextResponse.json(Task);
    } catch (error: any) {
        console.error('POST /api/tasks error:', error);
        return NextResponse.json(
            { error: 'Failed to create task', details: error.message },
            { status: 500 }
        );
    }
}