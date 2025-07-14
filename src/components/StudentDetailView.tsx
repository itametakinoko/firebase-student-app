'use client';

import { useEffect, useState } from 'react';
import { studentsService } from '@/lib/firebase';
import type { Student } from '@/lib/types';
import { useRouter } from 'next/navigation';

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
const YEARS = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i);

export default function StudentDetailView({ id }: { id: string }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 戻るボタンのhover用state
  const [backHover, setBackHover] = useState(false);

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
    const unsub = studentsService.onAuthStateChanged(setCurrentUser);
    return () => unsub && unsub();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('本当に削除しますか？')) return;
    await studentsService.deleteStudent(id);
    router.push('/');
  };

  const handleEditOpen = () => {
    if (!student) return;
    setEditData({ ...student });
    setEditMode(true);
  };
  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleEditCourseChange = (course: string) => {
    setEditData((prev: any) => ({
      ...prev,
      courses: prev.courses.includes(course)
        ? prev.courses.filter((c: string) => c !== course)
        : [...prev.courses, course],
    }));
  };
  const handleEditSave = async () => {
    setSaving(true);
    await studentsService.updateStudent(id, editData);
    setEditMode(false);
    // 最新情報を再取得
    const updated = await studentsService.getStudentByDocId(id);
    setStudent(updated);
    setSaving(false);
  };
  const handleEditCancel = () => {
    setEditMode(false);
  };

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>読み込み中...</div>;
  }

  if (error) {
    return <div style={{ padding: 32, textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  if (!student) {
    return <div style={{ padding: 32 }}>学生情報が見つかりませんでした。</div>;
  }

  // 名前分割（スペース区切りなら姓・名、そうでなければ全体を姓として表示）
  let lastName = '', firstName = '';
  if (student.name) {
    const parts = student.name.split(/\s+/);
    if (parts.length >= 2) {
      lastName = parts[0];
      firstName = parts.slice(1).join(' ');
    } else {
      lastName = student.name;
      firstName = '';
    }
  }

  // 編集・削除ボタンは自分のuidと一致する場合のみ表示
  const isOwner = currentUser && student && student.uid && currentUser.uid === student.uid;

  return (
    <div
      style={{
        background: "#fff",
        maxWidth: 520,
        margin: "32px auto",
        borderRadius: 18,
        boxShadow: "0 2px 16px #0002",
        padding: 36,
        fontFamily: 'sans-serif',
        position: 'relative',
      }}
    >
      {/* 戻るボタン */}
      <button
        onClick={() => router.back()}
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          background: backHover ? '#e3e8f0' : '#f5f7fa',
          color: '#2a4d7a',
          border: 'none',
          borderRadius: 8,
          padding: '6px 18px',
          fontWeight: 600,
          fontSize: 15,
          cursor: 'pointer',
          boxShadow: backHover ? '0 2px 8px #2a4d7a22' : 'none',
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={() => setBackHover(true)}
        onMouseLeave={() => setBackHover(false)}
      >
        ← 戻る
      </button>
      {/* 編集・削除ボタン */}
      {isOwner && (
        <div style={{ position: 'absolute', top: 24, right: 32, display: 'flex', gap: 12 }}>
          <button onClick={handleEditOpen} style={{ background: '#2a4d7a', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>編集</button>
          <button onClick={handleDelete} style={{ background: '#c00', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>削除</button>
        </div>
      )}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        {student.avatarUrl && (
          <img
            src={student.avatarUrl}
            alt="avatar"
            width={180}
            height={180}
            style={{
              borderRadius: 18,
              border: "1.5px solid #bbb",
              objectFit: "cover",
              boxShadow: '0 2px 8px #0001',
            }}
          />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>{lastName}</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>{firstName}</div>
      </div>
      <div style={{ borderTop: '1.5px solid #eee', margin: '18px 0 18px 0' }} />
      <div style={{ marginBottom: 12, fontSize: 16 }}>
        <span style={{ fontWeight: 600, color: '#2a4d7a', marginRight: 8 }}>学籍番号</span>
        <span>{student.studentId || '未登録'}</span>
      </div>
      <div style={{ marginBottom: 12, fontSize: 16 }}>
        <span style={{ fontWeight: 600, color: '#2a4d7a', marginRight: 8 }}>学科</span>
        <span>{student.department || '未登録'}</span>
      </div>
      <div style={{ marginBottom: 12, fontSize: 16 }}>
        <span style={{ fontWeight: 600, color: '#2a4d7a', marginRight: 8 }}>入学年度</span>
        <span>{student.admissionYear || '未登録'}</span>
      </div>
      <div style={{ marginBottom: 12, fontSize: 16 }}>
        <span style={{ fontWeight: 600, color: '#2a4d7a', marginRight: 8 }}>履修授業</span>
        <span>{student.courses && student.courses.length > 0 ? student.courses.join('・') : '未登録'}</span>
      </div>
      <div style={{ marginBottom: 12, fontSize: 16 }}>
        <span style={{ fontWeight: 600, color: '#2a4d7a', marginRight: 8 }}>趣味</span>
        <span>{student.hobby || '未登録'}</span>
      </div>
      <div style={{ marginBottom: 18, fontSize: 16 }}>
        <span style={{ fontWeight: 600, color: '#2a4d7a', marginRight: 8 }}>自己紹介</span>
        <span style={{ whiteSpace: 'pre-line' }}>{student.selfIntro || '未登録'}</span>
      </div>

      {/* 編集モーダル */}
      {editMode && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 340, maxWidth: 420, boxShadow: '0 2px 16px #0003', position: 'relative' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, textAlign: 'center' }}>学生情報の編集</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>姓</label>
              <input type="text" value={editData.name ? editData.name[0] : ''} onChange={e => handleEditChange('name', e.target.value + (editData.name ? editData.name.slice(1) : ''))} style={{ width: 60, marginRight: 12, padding: 6, borderRadius: 6, border: '1px solid #bbb' }} />
              <label style={{ fontWeight: 600, marginRight: 8 }}>名</label>
              <input type="text" value={editData.name ? editData.name.slice(1) : ''} onChange={e => handleEditChange('name', (editData.name ? editData.name[0] : '') + e.target.value)} style={{ width: 100, padding: 6, borderRadius: 6, border: '1px solid #bbb' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>学籍番号</label>
              <input type="text" value={editData.studentId || ''} onChange={e => handleEditChange('studentId', e.target.value)} style={{ width: 120, padding: 6, borderRadius: 6, border: '1px solid #bbb' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>学科</label>
              <select value={editData.department || ''} onChange={e => handleEditChange('department', e.target.value)} style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb' }}>
                {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>入学年度</label>
              <select value={editData.admissionYear || ''} onChange={e => handleEditChange('admissionYear', Number(e.target.value))} style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb' }}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>履修授業</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                {COURSES.map(course => (
                  <label key={course} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, background: '#fafbfc', borderRadius: 8, padding: '2px 8px', border: '1px solid #e5e7eb' }}>
                    <input
                      type="checkbox"
                      checked={editData.courses && editData.courses.includes(course)}
                      onChange={() => handleEditCourseChange(course)}
                      style={{ accentColor: '#2a4d7a' }}
                    />
                    {course}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>趣味</label>
              <input type="text" value={editData.hobby || ''} onChange={e => handleEditChange('hobby', e.target.value)} style={{ width: 180, padding: 6, borderRadius: 6, border: '1px solid #bbb' }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>自己紹介</label>
              <textarea value={editData.selfIntro || ''} onChange={e => handleEditChange('selfIntro', e.target.value)} style={{ width: 220, minHeight: 60, padding: 6, borderRadius: 6, border: '1px solid #bbb', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
              <button onClick={handleEditSave} disabled={saving} style={{ background: '#2a4d7a', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>{saving ? '保存中...' : '保存'}</button>
              <button onClick={handleEditCancel} type="button" style={{ background: '#bbb', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 