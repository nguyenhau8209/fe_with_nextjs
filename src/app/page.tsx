import Link from "next/link";
const levels = [
  { id: "a1", name: "A1", description: "Cơ bản" },
  { id: "a2", name: "A2", description: "Sơ cấp" },
  { id: "b1", name: "B1", description: "Trung cấp" },
  { id: "b2", name: "B2", description: "Trung cao cấp" },
  { id: "c1", name: "C1", description: "Cao cấp" },
  { id: "c2", name: "C2", description: "Thành thạo" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-4 sm:py-6 md:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 md:mb-8">
          Daily Dictation Deutsch
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {levels.map((level) => (
            <Link
              key={level.id}
              href={`/levels/${level.id}`}
              className="block bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
                {level.name}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {level.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
