'use client';
import { useState } from "react";
import { studentsService } from "@/lib/firebase";
import type { Student } from "@/lib/types";

const SORT_OPTIONS = ["50音順", "学年順", "新着順"];
const YEARS = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i);
const DEPARTMENTS = [
  "経営学科",
  "ビジネスエコノミクス学科",
  "国際デザイン経営学科",
];
const COURSES = [
  "経営学入門",
  "統計学入門",
  "データ分析",
  "ゲーム理論概論",
  "異文化コミュニケーション",
];

export default function SearchForm({ onResults }: { onResults?: (results: Student[]) => void }) {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [results, setResults] = useState<Student[]>([]);

  const handleCourseChange = (course: string) => {
    setSelectedCourses(prev =>
      prev.includes(course)
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // 検索条件を使って全件取得
    const found = await studentsService.searchStudents();
    let filtered = found;
    if (name) {
      filtered = filtered.filter(s => s.name && s.name.includes(name));
    }
    if (studentId) {
      filtered = filtered.filter(s => s.studentId && s.studentId.includes(studentId));
    }
    if (department) {
      filtered = filtered.filter(s => s.department === department);
    }
    if (admissionYear) {
      filtered = filtered.filter(s => s.admissionYear === Number(admissionYear));
    }
    if (selectedCourses.length > 0) {
      filtered = filtered.filter(s => s.courses && selectedCourses.every(c => (s.courses as string[]).includes(c)));
    }
    if (sort === '学年順') {
      filtered = filtered.slice().sort((a, b) => (a.admissionYear || 0) - (b.admissionYear || 0));
    } else if (sort === '新着順') {
      filtered = filtered.slice().sort((a, b) => (b.admissionYear || 0) - (a.admissionYear || 0));
    } else if (sort === '50音順') {
      filtered = filtered.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    setResults(filtered);
    onResults?.(filtered);
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSearch} style={formRowStyle}>
        <div style={rowStyle}>
          <div style={inputGroupStyle}>
            <span style={iconStyle}>
              <svg width="20" height="20" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
            </span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="名前"
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <input
              type="text"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              placeholder="学籍番号"
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              style={selectStyle}
            >
              <option value="">学科</option>
              {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>
          <div style={inputGroupStyle}>
            <select
              value={admissionYear}
              onChange={e => setAdmissionYear(e.target.value)}
              style={selectStyle}
            >
              <option value="">入学年度</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} style={sortSelectStyle}>
            {SORT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <button type="submit" style={searchBtnStyle}>検索</button>
        </div>
        <div style={coursesGroupStyle}>
          <div style={coursesLabelStyle}>履修授業</div>
          <div style={coursesCheckboxesStyle}>
            {COURSES.map(course => (
              <label key={course} style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={selectedCourses.includes(course)}
                  onChange={() => handleCourseChange(course)}
                  style={checkboxStyle}
                />
                <span>{course}</span>
              </label>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 2px 8px #0001',
  padding: '28px 20px 18px 20px',
  marginBottom: 32,
  width: '100%',
  maxWidth: 1200,
  marginLeft: 'auto',
  marginRight: 'auto',
};
const formRowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  width: '100%',
};
const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap',
  justifyContent: 'space-between',
};
const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  background: '#fafbfc',
  borderRadius: 24,
  border: '1.5px solid #e5e7eb',
  padding: '0 18px',
  height: 44,
  minWidth: 150,
  maxWidth: 200,
  flex: '1 1 160px',
  boxSizing: 'border-box',
};
const iconStyle: React.CSSProperties = {
  marginRight: 8,
  display: 'flex',
  alignItems: 'center',
};
const inputStyle: React.CSSProperties = {
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 15,
  width: '100%',
  height: 32,
  padding: 0,
};
const selectStyle: React.CSSProperties = {
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 15,
  width: '100%',
  height: 32,
  padding: 0,
};
const coursesGroupStyle: React.CSSProperties = {
  background: '#fafbfc',
  borderRadius: 24,
  border: '1.5px solid #e5e7eb',
  padding: '10px 18px',
  minWidth: 220,
  maxWidth: 900,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 6,
};
const coursesLabelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 2,
};
const coursesCheckboxesStyle: React.CSSProperties = {
  display: 'flex',
  gap: 14,
  flexWrap: 'wrap',
};
const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 14,
  background: '#fff',
  borderRadius: 12,
  padding: '2px 8px',
  border: '1px solid #e5e7eb',
};
const checkboxStyle: React.CSSProperties = {
  accentColor: '#2a4d7a',
  width: 16,
  height: 16,
  margin: 0,
};
const sortSelectStyle: React.CSSProperties = {
  background: '#fafbfc',
  border: '1.5px solid #e5e7eb',
  borderRadius: 12,
  padding: '8px 24px 8px 12px',
  fontSize: 15,
  fontWeight: 500,
  color: '#222',
  outline: 'none',
  boxShadow: '0 1px 2px #0001',
  appearance: 'none',
  height: 44,
  minWidth: 110,
};
const searchBtnStyle: React.CSSProperties = {
  background: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: 20,
  padding: '10px 28px',
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
  marginLeft: 8,
  height: 44,
}; 