import {NextResponse} from 'next/server';
import { connectDB } from '@/lib/db';
import tasks from '@/models/tasks';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const body = await req.json();
    await connectDB();
    const updatedTask = await tasks.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedTask) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    } else {
        return NextResponse.json(updatedTask)
    }
};

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    await connectDB();
    const deletedTask = await tasks.findByIdAndDelete(params.id);
    if (!deletedTask) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    } else {
        return NextResponse.json({ message: 'Task deleted successfully' });
    }
};