import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from "@/lib/db";
import tasks from "@/models/tasks";
import { extractTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const token = extractTokenFromRequest(req);
        
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const completedParam = searchParams.get('completed');
        
        await connectDB();
        
        let query: any = { userId: decoded.userId };
        if (completedParam !== null) {
            query.completed = completedParam === 'true';
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

export async function POST(req: NextRequest) {
    try {
        const token = extractTokenFromRequest(req);
        
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            );
        }

        const body = await req.json();
        await connectDB();
        
        // Add userId to task
        const taskData = {
            ...body,
            userId: decoded.userId,
        };
        
        const Task = await tasks.create(taskData);
        return NextResponse.json(Task);
    } catch (error: any) {
        console.error('POST /api/tasks error:', error);
        return NextResponse.json(
            { error: 'Failed to create task', details: error.message },
            { status: 500 }
        );
    }
}