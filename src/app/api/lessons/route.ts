import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Lesson from '@/models/Lesson';
import mongoose from 'mongoose'; // Import mongoose

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const level = searchParams.get('level');

        const query = level ? { level: level.toLowerCase() } : {};
        const lessons = await Lesson.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: lessons });
    } catch (error) {
        console.error("GET /api/lessons Error:", error); // Log lỗi chi tiết trên server
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Tạo một bản ghi mới và lưu lại
        const lesson = new Lesson(body);
        await lesson.save();

        return NextResponse.json({ success: true, data: lesson }, { status: 201 });
    } catch (error) {
        // Ghi lại lỗi đầy đủ trên server để debug
        console.error("POST /api/lessons Error:", error);

        // **Điểm cải tiến quan trọng:** Xử lý lỗi validation từ Mongoose
        if (error instanceof mongoose.Error.ValidationError) {
            // Lấy thông điệp lỗi từ các trường bị sai
            const errorMessages = Object.values(error.errors).map(e => e.message).join(', ');
            return NextResponse.json(
                { success: false, error: `Validation Failed: ${errorMessages}` },
                { status: 400 } // Lỗi 400 Bad Request hợp lý hơn cho validation
            );
        }

        // Trả về lỗi server chung cho các trường hợp khác
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}