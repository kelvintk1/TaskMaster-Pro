import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db';
import tasks from '@/models/tasks';
import { extractTokenFromRequest, verifyToken } from "@/lib/auth";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = extractTokenFromRequest(request);
        
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

        const { id } = await params;
        
        console.log("Received ID:", id);
        
        const body = await request.json();
        console.log("Received body:", body);
        
        await connectDB();
        
        // Verify task belongs to user
        const taskToUpdate = await tasks.findById(id);
        if (!taskToUpdate) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        if (taskToUpdate.userId.toString() !== decoded.userId) {
            return NextResponse.json(
                { error: "Forbidden: You can only update your own tasks" },
                { status: 403 }
            );
        }
        
        // Remove id from body if it exists to avoid conflicts
        const { id: discardedBodyId, ...updateData } = body;
        void discardedBodyId;
        
        const updatedTask = await tasks.findByIdAndUpdate(
            id, 
            updateData, 
            { returnDocument: 'after' }
        );
        
        if (!updatedTask) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = extractTokenFromRequest(request);
        
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

        await connectDB();
        
        const { id } = await params;

        // Verify task belongs to user
        const taskToDelete = await tasks.findById(id);
        if (!taskToDelete) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        if (taskToDelete.userId.toString() !== decoded.userId) {
            return NextResponse.json(
                { error: "Forbidden: You can only delete your own tasks" },
                { status: 403 }
            );
        }
        
        const deletedTask = await tasks.findByIdAndDelete(id);
        if (!deletedTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        } else {
            return NextResponse.json({ message: 'Task deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json(
            { error: 'Failed to delete task' },
            { status: 500 }
        );
    }
}