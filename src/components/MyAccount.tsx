'use client';
import { useEffect, useState } from 'react';
import { studentsService } from '@/lib/firebase';
import type { Student } from '@/lib/types';
import { useRouter } from 'next/navigation';

const buttonBase = {
  border: 'none',
  borderRadius: 8,
  padding: '10px 32px',
  fontWeight: 600,
  fontSize: 17,
  cursor: 'pointer',
  transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
};
const buttonPrimary = {
  ...buttonBase,
  background: '#2a4d7a',
  color: '#fff',
};
const buttonPrimaryHover = {
  ...buttonPrimary,
  background: '#16325c',
  boxShadow: '0 2px 8px #2a4d7a33',
};
const buttonDanger = {
  ...buttonBase,
  background: '#c00',
  color: '#fff',
};
const buttonDangerHover = {
  ...buttonDanger,
  background: '#a00',
  boxShadow: '0 2px 8px #c003',
};
const buttonLogout = {
  ...buttonBase,
  background: '#444',
  color: '#fff',
};
const buttonLogoutHover = {
  ...buttonLogout,
  background: '#222',
  boxShadow: '0 2px 8px #2223',
};

export default function MyAccount() {
  const [user, setUser] = useState<any>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [logoutHover, setLogoutHover] = useState(false);
  const [editHover, setEditHover] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);
  const [backHover, setBackHover] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = studentsService.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const all = await studentsService.searchStudents();
        const mine = all.find((s: any) => s.uid === u.uid);
        setStudent(mine || null);
        if (mine) setAuthMode('login');
      } else {
        setStudent(null);
      }
      setLoading(false);
    });
    return () => unsub && unsub();
  }, []);

  const handleRegister = async () => {
    setAuthError('');
    try {
      await studentsService.registerWithEmail(email, password);
      router.push('/register');
    } catch (e: any) {
      setAuthError(e.message || '登録に失敗しました');
    }
  };
  const handleLogin = async () => {
    setAuthError('');
    try {
      await studentsService.loginWithEmail(email, password);
    } catch (e: any) {
      setAuthError(e.message || 'ログインに失敗しました');
    }
  };
  const handleLogout = async () => {
    await studentsService.logout();
  };
  const handleDeleteAccount = async () => {
    if (!window.confirm('本当にアカウントを削除しますか？')) return;
    if (student) {
      await studentsService.deleteStudent(student.id ?? "");
    }
    await studentsService.deleteCurrentUser();
    setUser(null);
    setStudent(null);
  };
  const handleEditOpen = () => {
    if (!student) return;
    setEditData({ ...student });
    setEditMode(true);
  };
  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleEditSave = async () => {
    setSaving(true);
    if (student) {
      await studentsService.updateStudent(student.id ?? "", editData);
    }
    setEditMode(false);
    setStudent({ ...student, ...editData });
    setSaving(false);
  };
  const handleEditCancel = () => {
    setEditMode(false);
  };

  if (loading) return <div style={{ padding: 32, textAlign: 'center' }}>読み込み中...</div>;

  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0002', padding: 32, textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>マイアカウント</h2>
        <div style={{ marginBottom: 18 }}>
          {/* 学生情報が未登録の場合のみ新規登録タブを表示 */}
          <button onClick={() => setAuthMode('login')} style={{ background: authMode === 'login' ? '#2a4d7a' : '#eee', color: authMode === 'login' ? '#fff' : '#222', border: 'none', borderRadius: 8, padding: '7px 24px', fontWeight: 600, fontSize: 15, marginRight: 8, cursor: 'pointer' }}>ログイン</button>
          {student === null && (
            <button onClick={() => setAuthMode('register')} style={{ background: authMode === 'register' ? '#2a4d7a' : '#eee', color: authMode === 'register' ? '#fff' : '#222', border: 'none', borderRadius: 8, padding: '7px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>新規登録</button>
          )}
        </div>
        <div style={{ marginBottom: 14 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="メールアドレス" style={{ width: 220, padding: 8, borderRadius: 8, border: '1px solid #bbb', marginBottom: 10 }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="パスワード" style={{ width: 220, padding: 8, borderRadius: 8, border: '1px solid #bbb' }} />
        </div>
        {authError && <div style={{ color: 'red', marginBottom: 10 }}>{authError}</div>}
        {authMode === 'login' ? (
          <button onClick={handleLogin} style={{ background: '#2a4d7a', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 600, fontSize: 17, cursor: 'pointer', marginBottom: 8 }}>ログイン</button>
        ) : (
          <button onClick={handleRegister} style={{ background: '#2a4d7a', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 600, fontSize: 17, cursor: 'pointer', marginBottom: 8 }}>新規登録</button>
        )}
      </div>
    );
  }

  // プロフィール画像の優先順位: 学生情報のavatarUrl > Firebase AuthのphotoURL
  const profileImg = student && student.avatarUrl ? student.avatarUrl : (user.photoURL || undefined);

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0002', padding: 36, fontFamily: 'sans-serif', position: 'relative' }}>
      {/* 戻るボタン */}
      <button
        onClick={() => window.history.back()}
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
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18, textAlign: 'center' }}>
        マイアカウント
      </h2>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        {profileImg && (
          <img src={profileImg ?? ''} alt="avatar" width={80} height={80} style={{ borderRadius: '50%', border: '1.5px solid #bbb', objectFit: 'cover', marginBottom: 8 }} />
        )}
        <div style={{ fontWeight: 600 }}>{user.displayName || user.email}</div>
        <div style={{ color: '#888', fontSize: 13 }}>{user.email}</div>
      </div>
      {student ? (
        <div style={{ marginBottom: 18 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>あなたの学生情報</div>
          <div style={{ background: '#fafbfc', borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <div style={{ marginBottom: 6 }}><b>名前:</b> {student.name}</div>
            <div style={{ marginBottom: 6 }}><b>学籍番号:</b> {student.studentId}</div>
            <div style={{ marginBottom: 6 }}><b>学科:</b> {student.department}</div>
            <div style={{ marginBottom: 6 }}><b>入学年度:</b> {student.admissionYear}</div>
            <div style={{ marginBottom: 6 }}><b>履修授業:</b> {student.courses && student.courses.length > 0 ? student.courses.join('・') : '未登録'}</div>
            <div style={{ marginBottom: 6 }}><b>趣味:</b> {student.hobby}</div>
            <div style={{ marginBottom: 6 }}><b>自己紹介:</b> {student.selfIntro}</div>
          </div>
          <button
            onClick={handleEditOpen}
            style={editHover ? buttonPrimaryHover : buttonPrimary}
            onMouseEnter={() => setEditHover(true)}
            onMouseLeave={() => setEditHover(false)}
          >編集</button>
          <button
            onClick={handleDeleteAccount}
            style={deleteHover ? buttonDangerHover : buttonDanger}
            onMouseEnter={() => setDeleteHover(true)}
            onMouseLeave={() => setDeleteHover(false)}
          >アカウント削除</button>
        </div>
      ) : (
        <div style={{ marginBottom: 18, color: '#888', textAlign: 'center' }}>まだ学生情報が登録されていません。</div>
      )}
      <button
        onClick={handleLogout}
        style={logoutHover ? buttonLogoutHover : buttonLogout}
        onMouseEnter={() => setLogoutHover(true)}
        onMouseLeave={() => setLogoutHover(false)}
      >ログアウト</button>

      {/* 編集モーダル */}
      {editMode && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 340, maxWidth: 420, boxShadow: '0 2px 16px #0003', position: 'relative' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, textAlign: 'center' }}>学生情報の編集</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>名前</label>
              <input type="text" value={editData.name || ''} onChange={e => handleEditChange('name', e.target.value)} style={{ width: 160, padding: 6, borderRadius: 6, border: '1px solid #bbb' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>学籍番号</label>
              <input type="text" value={editData.studentId || ''} onChange={e => handleEditChange('studentId', e.target.value)} style={{ width: 120, padding: 6, borderRadius: 6, border: '1px solid #bbb' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>学科</label>
              <input type="text" value={editData.department || ''} onChange={e => handleEditChange('department', e.target.value)} style={{ width: 120, padding: 6, borderRadius: 6, border: '1px solid #bbb' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>入学年度</label>
              <input type="number" value={editData.admissionYear || ''} onChange={e => handleEditChange('admissionYear', Number(e.target.value))} style={{ width: 100, padding: 6, borderRadius: 6, border: '1px solid #bbb' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>履修授業</label>
              <input type="text" value={editData.courses ? editData.courses.join(',') : ''} onChange={e => handleEditChange('courses', e.target.value.split(','))} style={{ width: 180, padding: 6, borderRadius: 6, border: '1px solid #bbb' }} />
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