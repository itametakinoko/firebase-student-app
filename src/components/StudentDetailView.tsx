'use client';

import { useEffect, useState } from 'react';
import { studentsService } from '../../lib/firebase';
import type { Student } from '../../lib/types';

export default function StudentDetailView({ id }: { id: string }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudent() {
      try {
        setLoading(true);
        const studentData = await studentsService.getStudentByDocId(id);
        if (studentData) {
          setStudent(studentData);
        } else {
          setError('学生情報が見つかりませんでした。');
        }
      } catch (e) {
        setError('データの取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    }
    fetchStudent();
  }, [id]);

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>読み込み中...</div>;
  }

  if (error) {
    return <div style={{ padding: 32, textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  if (!student) {
    return <div style={{ padding: 32 }}>学生情報が見つかりませんでした。</div>;
  }

  return (
    <div
      style={{
        background: "#fff",
        maxWidth: 500,
        margin: "32px auto",
        borderRadius: 16,
        boxShadow: "0 2px 12px #0002",
        padding: 32,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        {student.avatarUrl && (
          <img
            src={student.avatarUrl}
            alt="avatar"
            width={220}
            height={220}
            style={{
              borderRadius: 24,
              border: "1px solid #ccc",
              objectFit: "cover",
            }}
          />
        )}
      </div>
      <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
        {student.name}
      </h2>
      <div style={{ marginBottom: 8 }}>
        学科: <b>{student.department}</b>
      </div>
      <div style={{ marginBottom: 8 }}>
        入学年度: <b>{student.admissionYear}</b>
      </div>
      <div style={{ marginBottom: 8 }}>
        履修授業:{" "}
        <b>
          {student.courses && student.courses.length > 0
            ? student.courses.join("・")
            : "なし"}
        </b>
      </div>
    </div>
  );
} 