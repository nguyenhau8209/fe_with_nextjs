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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Luyện Nghe Chép Tiếng Đức
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level) => (
          <Link
            key={level.id}
            href={`/level/${level.id}`}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">{level.name}</h2>
            <p className="text-gray-600">{level.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
