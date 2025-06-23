import { studentsService } from "../../../lib/firebase";
import type { Student } from "../../../lib/types";
import { notFound } from "next/navigation";

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  // FirestoreのドキュメントIDで直接取得
  const student: Student | null = await studentsService.getStudentByDocId(params.id);

  if (!student) {
    notFound();
  }

  return (
    <div style={{
      background: '#fff', maxWidth: 500, margin: '32px auto', borderRadius: 16, boxShadow: '0 2px 12px #0002', padding: 32
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {student.avatarUrl && <img src={student.avatarUrl} alt="avatar" width={220} height={220} style={{ borderRadius: 24, border: '1px solid #ccc', objectFit: 'cover', width: 220, height: 220 }} />}
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>{student.name}</h2>
      <div style={{ marginBottom: 8 }}>学科: <b>{student.department}</b></div>
      <div style={{ marginBottom: 8 }}>入学年度: <b>{student.admissionYear}</b></div>
      <div style={{ marginBottom: 8 }}>履修授業: <b>{student.courses && student.courses.length > 0 ? student.courses.join('・') : 'なし'}</b></div>
    </div>
  );
} 