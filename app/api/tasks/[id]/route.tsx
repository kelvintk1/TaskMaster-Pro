import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db';
import tasks from '@/models/tasks';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }  // Note: params is a Promise
) {
    try {
        // Await the params to get the id
        const { id } = await params;
        
        console.log("Received ID:", id);
        
        const body = await request.json();
        console.log("Received body:", body);
        
        await connectDB();
        
        // Remove id from body if it exists to avoid conflicts
        const { id: discardedBodyId, ...updateData } = body;
        void discardedBodyId;
        
        // Use returnDocument: 'after' instead of the deprecated new: true
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

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    
    // Await the params to get the id
    const { id } = await params;
    
    const deletedTask = await tasks.findByIdAndDelete(id);
    if (!deletedTask) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    } else {
        return NextResponse.json({ message: 'Task deleted successfully' });
    }
}