import DictationExercise from "@/components/DictationExercise";
import { exercises } from "@/data/exercises";

export default async function ExercisePage(
  props: {
    params: Promise<{ levelId: string }>;
  }
) {
  const params = await props.params;
  // Đảm bảo params.levelId đã được resolve
  const levelId = params.levelId;

  // Tìm bài tập đầu tiên của level này (sau này có thể thêm tính năng chọn bài)
  const exercise = exercises.find(
    (ex) => ex.level.toLowerCase() === levelId.toLowerCase()
  );

  if (!exercise) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Không tìm thấy bài tập cho cấp độ này.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DictationExercise
        title={exercise.title}
        level={exercise.level}
        audioUrl={exercise.audioUrl}
        script={exercise.script}
      />
    </div>
  );
}
