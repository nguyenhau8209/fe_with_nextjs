import mongoose from "mongoose";

const SubtitleSchema = new mongoose.Schema({
    text: String,
    startTime: Number,
    endTime: Number,
}, { _id: false });

const LessonSchema = new mongoose.Schema({
    title: {type: String, required: true},
    youtubeUrl: {type: String, required: true},
    level: {type: String, required: true},
    language: {type: String, required: true},
    isSystemLesson: {type: Boolean, required: true, default: false},
    detailedSubtitles: [SubtitleSchema],
    //Thêm userId để xác định bài học của người dùng nào
    // userId: {type: String, required: true},
    createdAt: Date,
    updatedAt: Date,
}, { timestamps: true });

export default mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);