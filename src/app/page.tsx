'use client';
import SearchForm from "@/components/SearchForm";
import StudentList from "@/components/StudentList";
import { useState } from "react";
import type { Student } from "@/lib/types";
import "@/styles/globals.css";

export default function HomePage() {
  const [results, setResults] = useState<Student[] | undefined>(undefined);

  return (
    <main className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          🎓 学生管理システム
        </h1>
        {/* テキスト検索のみ表示 */}
        <div className="space-y-6">
          <SearchForm onResults={setResults} />
          <StudentList students={results} />
        </div>
      </div>
    </main>
  );
}
