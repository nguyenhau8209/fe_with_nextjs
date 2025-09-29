// src/app/api/lessons/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Lesson from '@/models/Lesson';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const deletedLesson = await Lesson.findByIdAndDelete(params.id);
    if (!deletedLesson) {
      return NextResponse.json({ success: false, error: "Lesson not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}