"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import VocabularyList from "@/components/vocabulary/VocabularyList";
import { sampleVocabulary, sampleCategories } from "@/data/sample-vocabulary";
import { Vocabulary, VocabularyCategory } from "@/types/vocabulary";

export default function VocabularyPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleFlashcardClick = () => {
    router.push("/vocabulary/learn");
  };

  const handlePracticeClick = () => {
    router.push("/vocabulary/practice");
  };

  const filteredVocabularies = sampleVocabulary.filter((vocab) => {
    const matchesCategory =
      selectedCategory === "all" || vocab.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      vocab.german.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vocab.vietnamese.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Học Từ Vựng Tiếng Đức</h1>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <select
          className="p-2 border rounded-lg"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Tất cả chủ đề</option>
          {sampleCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tìm kiếm từ vựng..."
          className="p-2 border rounded-lg flex-grow"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button
          onClick={handleFlashcardClick}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Flashcard
        </button>

        <button
          onClick={handlePracticeClick}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Practice
        </button>
      </div>

      <VocabularyList vocabularies={filteredVocabularies} />
    </div>
  );
}
