// src/app/api/lessons/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Lesson from "@/models/Lesson";
import mongoose from "mongoose";

// Định nghĩa một kiểu dữ liệu cho context, bao gồm params
// Đây là cách làm đúng chuẩn và an toàn nhất
interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid Lesson ID" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lesson });
  } catch (error) {
    console.error(`GET /api/lessons/${id} Error:`, error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid Lesson ID" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const deletedLesson = await Lesson.findByIdAndDelete(id);

    if (!deletedLesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error(`DELETE /api/lessons/${id} Error:`, error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 }
    );
  }
}
