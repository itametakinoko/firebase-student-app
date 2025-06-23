'use client';
import { useState } from "react";
import { studentsService } from "../lib/firebase";
import type { Department, Course } from "../lib/types";

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

export default function StudentForm() {
  const [name, setName] = useState("");
  const [admissionYear, setAdmissionYear] = useState(new Date().getFullYear());
  const [department, setDepartment] = useState<Department>(DEPARTMENTS[0]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleCourseChange = (course: Course) => {
    setCourses(prev =>
      prev.includes(course)
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studentsService.createStudent({ name, admissionYear, department, courses }, avatar || undefined);
      setMessage("登録成功！");
      setName("");
      setAdmissionYear(new Date().getFullYear());
      setDepartment(DEPARTMENTS[0]);
      setCourses([]);
      setAvatar(null);
    } catch (err) {
      setMessage("登録失敗: " + (err as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #0001', maxWidth: 500, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 16 }}>学生登録フォーム</h2>
      <div style={{ marginBottom: 12 }}>
        <label>名前:<br />
          <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>入学年度:<br />
          <input type="number" value={admissionYear} onChange={e => setAdmissionYear(Number(e.target.value))} required style={{ width: '100%' }} />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>学科:<br />
          <select value={department} onChange={e => setDepartment(e.target.value as Department)} style={{ width: '100%' }}>
            {DEPARTMENTS.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>履修授業:<br /></label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {COURSES.map(course => (
            <label key={course} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f5f5f5', borderRadius: 6, padding: '2px 8px' }}>
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
      <div style={{ marginBottom: 12 }}>
        <label>アバター画像:<br />
          <input type="file" accept="image/*" onChange={e => setAvatar(e.target.files?.[0] || null)} />
        </label>
      </div>
      <button type="submit" style={{ width: '100%', padding: 8, background: '#2a4d7a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', fontSize: 16 }}>登録</button>
      <div style={{ marginTop: 12, color: message.includes('成功') ? 'green' : 'red' }}>{message}</div>
    </form>
  );
} 