'use client';
import SearchForm from "@/components/SearchForm";
import StudentList from "@/components/StudentList";
import ImageSearchForm from "@/components/ImageSearchForm";
import ImageSearchResults from "@/components/ImageSearchResults";
import { useState } from "react";
import type { Student } from "@/lib/types";
import type { FaceSimilarityResult } from "@/lib/faceRecognitionService";
import "@/styles/globals.css";

export default function HomePage() {
  const [results, setResults] = useState<Student[] | undefined>(undefined);
  const [imageResults, setImageResults] = useState<FaceSimilarityResult[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');

  const handleImageSearchResults = (results: FaceSimilarityResult[]) => {
    setImageResults(results);
  };

  const handleImageLoading = (loading: boolean) => {
    setImageLoading(loading);
  };

  const handleStudentClick = (result: FaceSimilarityResult) => {
    if (result.student.id) {
      window.location.href = `/detail/${result.student.id}`;
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          🎓 学生管理システム
        </h1>

        {/* タブ切り替え */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 テキスト検索
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'image'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🤖 顔認識検索
            </button>
          </div>
        </div>

        {/* 検索フォーム */}
        {activeTab === 'text' ? (
          <div className="space-y-6">
            <SearchForm onResults={setResults} />
            <StudentList students={results} />
          </div>
        ) : (
          <div className="space-y-6">
            <ImageSearchForm 
              onSearchResults={handleImageSearchResults}
              onLoading={handleImageLoading}
            />
            <ImageSearchResults 
              results={imageResults}
              loading={imageLoading}
              onStudentClick={handleStudentClick}
            />
          </div>
        )}
      </div>
    </main>
  );
}
