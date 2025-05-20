import React from "react";
import { Vocabulary } from "@/types/vocabulary";

interface VocabularyListProps {
  vocabularies: Vocabulary[];
  onSelectVocabulary?: (vocabulary: Vocabulary) => void;
}

const VocabularyList: React.FC<VocabularyListProps> = ({
  vocabularies,
  onSelectVocabulary,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {vocabularies.map((vocabulary) => (
        <div
          key={vocabulary.id}
          className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onSelectVocabulary?.(vocabulary)}
        >
          <h3 className="text-xl font-bold text-gray-800">
            {vocabulary.german}
          </h3>
          <p className="text-gray-600 mt-1">{vocabulary.vietnamese}</p>
          <p className="text-sm text-gray-500 mt-1">
            Phát âm: {vocabulary.pronunciation}
          </p>
          {vocabulary.example && (
            <p className="text-sm text-gray-600 mt-2 italic">
              {vocabulary.example}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {vocabulary.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VocabularyList;
