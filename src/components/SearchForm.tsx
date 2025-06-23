'use client';
import { useState } from "react";
import { studentsService } from "@/lib/firebase";
import type { StudentSearchFilters, Student, Department, Course } from "@/lib/types";

const DEPARTMENTS: Department[] = [
  "経営学科",
  "ビジネスエコノミクス学科",
  "国際デザイン経営学科",
];
const COURSES: Course[] = [
  "経営学入門",
  "統計学入門",
  "データ分析",
  "ゲーム理論概論",
  "異文化コミュニケーション",
];

export default function SearchForm({ onResults }: { onResults?: (results: Student[]) => void }) {
  const [name, setName] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [department, setDepartment] = useState<Department | "">("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [results, setResults] = useState<Student[]>([]);

  const handleCourseChange = (course: Course) => {
    setCourses(prev =>
      prev.includes(course)
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const filters: StudentSearchFilters = {};
    if (name) filters.name = name;
    if (admissionYear) filters.admissionYear = Number(admissionYear);
    if (department) filters.department = department as Department;
    if (courses.length > 0) filters.courses = courses;
    const found = await studentsService.searchStudents(filters);
    setResults(found);
    onResults?.(found);
  };

  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px #0001', marginBottom: 24 }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
        <div>
          <label>名前<br />
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: 120 }} />
          </label>
        </div>
        <div>
          <label>入学年度<br />
            <input type="number" value={admissionYear} onChange={e => setAdmissionYear(e.target.value)} style={{ width: 100 }} />
          </label>
        </div>
        <div>
          <label>学科<br />
            <select value={department} onChange={e => setDepartment(e.target.value as Department | "")} style={{ width: 160 }}>
              <option value="">指定なし</option>
              {DEPARTMENTS.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>履修授業<br /></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {COURSES.map(course => (
              <label key={course} style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#f5f5f5', borderRadius: 6, padding: '2px 6px' }}>
                <input
                  type="checkbox"
                  checked={courses.includes(course)}
                  onChange={() => handleCourseChange(course)}
                />
                {course}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" style={{ padding: '6px 18px', background: '#2a4d7a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>検索</button>
      </form>
      <ul>
        {results.map(s => (
          <li key={s.id}>
            {s.avatarUrl && <img src={s.avatarUrl} alt="avatar" width={40} style={{ verticalAlign: 'middle', marginRight: 8 }} />}
            {s.name}（{s.admissionYear}年入学）
          </li>
        ))}
      </ul>
    </div>
  );
} 