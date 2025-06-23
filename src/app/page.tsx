'use client';
import SearchForm from "../components/SearchForm";
import StudentList from "../components/StudentList";
import { useState } from "react";
import type { Student } from "../lib/types";
import "../styles/globals.css";

export default function HomePage() {
  const [results, setResults] = useState<Student[] | undefined>(undefined);

  return (
    <main style={{ background: '#f5f7fa', minHeight: '100vh', padding: '32px 0' }}>
      <h1 style={{ textAlign: 'center', fontSize: 32, marginBottom: 24, color: '#2a4d7a' }}>学生管理システム</h1>
      <SearchForm onResults={setResults} />
      <StudentList students={results} />
    </main>
  );
}
