'use client';
import { useEffect, useState } from "react";
import { studentsService } from "@/lib/firebase";
import type { Student } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function StudentList({ students: propStudents }: { students?: Student[] }) {
  const [students, setStudents] = useState<Student[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!propStudents) {
      studentsService.searchStudents().then(setStudents);
    } else {
      setStudents(propStudents);
    }
  }, [propStudents]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
      {students.map(s => (
        <div
          key={s.id}
          style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 8px #0002',
            padding: 20,
            width: 260,
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
          }}
          onClick={() => router.push(`/detail/${s.id}`)}
        >
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            {s.avatarUrl && <img src={s.avatarUrl} alt="avatar" width={180} height={180} style={{ borderRadius: 24, border: '1px solid #ccc', objectFit: 'cover', width: 180, height: 180 }} />}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>{s.name}</div>
          <div style={{ color: '#555', marginBottom: 4 }}>{s.department}</div>
          <div style={{ color: '#888', fontSize: 13 }}>{s.admissionYear}年入学</div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#2a4d7a' }}>
            {s.courses && s.courses.length > 0 && s.courses.join('・')}
          </div>
        </div>
      ))}
    </div>
  );
} 