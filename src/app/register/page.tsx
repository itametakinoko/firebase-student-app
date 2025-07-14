'use client';
import StudentForm from "@/components/StudentForm";
import { studentsService } from "@/lib/firebase";
import { useEffect, useState } from "react";
import "@/styles/globals.css";
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [user, setUser] = useState<any>(null);
  const [studentRegistered, setStudentRegistered] = useState<boolean>(false);
  const [backHover, setBackHover] = useState(false);
  useEffect(() => {
    setUser(studentsService.getCurrentUser());
    const unsub = studentsService.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const all = await studentsService.searchStudents();
        const mine = all.find((s: any) => s.uid === u.uid);
        setStudentRegistered(!!mine);
      } else {
        setStudentRegistered(false);
      }
    });
    return () => unsub && unsub();
  }, []);

  if (!user) {
    return (
      <main style={{ background: '#f5f7fa', minHeight: '100vh', padding: '32px 0' }}>
        {/* 戻るボタン */}
        <button
          onClick={() => window.history.back()}
          style={{
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
            marginBottom: 16,
            marginLeft: 0,
            display: 'block',
          }}
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
        >
          ← 戻る
        </button>
        <div style={{ maxWidth: 420, margin: '60px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0002', padding: 36, textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>学生登録にはログインが必要です</h2>
          {/* メール認証への案内文 */}
          <div style={{ color: '#555', fontSize: 16, marginBottom: 12 }}>
            画面右上の「マイアカウント」からログインまたは新規登録してください。
          </div>
        </div>
      </main>
    );
  }

  if (studentRegistered) {
    return (
      <main style={{ background: '#f5f7fa', minHeight: '100vh', padding: '32px 0' }}>
        {/* 戻るボタン */}
        <button
          onClick={() => window.history.back()}
          style={{
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
            marginBottom: 16,
            marginLeft: 0,
            display: 'block',
          }}
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
        >
          ← 戻る
        </button>
        <div style={{ maxWidth: 420, margin: '60px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0002', padding: 36, textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>学生情報は既に登録済みです</h2>
          <div style={{ color: '#555', fontSize: 16, marginBottom: 12 }}>
            学生情報の編集は「マイアカウント」から行ってください。
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: '#f5f7fa', minHeight: '100vh', padding: '32px 0' }}>
      {/* 戻るボタン */}
      <button
        onClick={() => window.history.back()}
        style={{
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
          marginBottom: 16,
          marginLeft: 0,
          display: 'block',
        }}
        onMouseEnter={() => setBackHover(true)}
        onMouseLeave={() => setBackHover(false)}
      >
        ← 戻る
      </button>
      <StudentForm />
    </main>
  );
} 