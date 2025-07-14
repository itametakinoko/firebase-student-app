'use client';
import { useState, useRef } from "react";
import { studentsService } from "@/lib/firebase";
import '@/styles/globals.css';
import Cropper from 'react-easy-crop';

const YEARS = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i);
const COURSES = [
  "経営学入門",
  "統計学入門",
  "データ分析",
  "ゲーム理論概論",
  "異文化コミュニケーション",
];
const DEPARTMENTS = [
  "経営学科",
  "ビジネスエコノミクス学科",
  "国際デザイン経営学科",
];

type Crop = { x: number; y: number };
type CroppedAreaPixels = { x: number; y: number; width: number; height: number };

function getCroppedImg(imageSrc: string, crop: CroppedAreaPixels, zoom: number, aspect = 1): Promise<Blob | null> {
  // 画像トリミング用のcanvas処理
  return new Promise((resolve) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      // cropはピクセル単位
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    };
  });
}

export default function StudentForm() {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [admissionYear, setAdmissionYear] = useState(YEARS[0]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [hobby, setHobby] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [selfIntro, setSelfIntro] = useState("");
  const [message, setMessage] = useState("");
  // cropper state
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<CroppedAreaPixels | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [studentId, setStudentId] = useState("");
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  const handleCourseChange = (course: string) => {
    setSelectedCourses(prev =>
      prev.includes(course)
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (!ev.target) return;
        setAvatarUrl(ev.target.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
      setAvatar(file); // 一時的に保存
    }
  };

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: CroppedAreaPixels) => {
    setCroppedArea({ ...croppedAreaPixels });
  };

  const handleCropSave = async () => {
    if (!avatarUrl || !croppedArea) return;
    const croppedBlob = await getCroppedImg(avatarUrl, croppedArea, zoom);
    if (!croppedBlob) return;
    const croppedFile = new File([croppedBlob as BlobPart], 'avatar.jpg', { type: 'image/jpeg' });
    setAvatar(croppedFile);
    setAvatarUrl(URL.createObjectURL(croppedFile));
    setShowCropper(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 必須項目チェック
    const errors: string[] = [];
    if (!lastName) errors.push('lastName');
    if (!firstName) errors.push('firstName');
    if (!studentId) errors.push('studentId');
    if (!department) errors.push('department');
    if (!admissionYear) errors.push('admissionYear');
    if (!hobby) errors.push('hobby');
    if (!selfIntro) errors.push('selfIntro');
    if (errors.length > 0) {
      setErrorFields(errors);
      setTimeout(() => setErrorFields([]), 600); // シェイク後リセット
      setMessage('必須項目を入力してください');
      return;
    }
    setErrorFields([]);
    setSubmitting(true);
    setShowCheck(false);
    try {
      const user = studentsService.getCurrentUser();
      const student = {
        name: lastName + ' ' + firstName,
        studentId,
        admissionYear,
        department,
        courses: selectedCourses,
        hobby,
        selfIntro,
        uid: user ? user.uid : '',
      };
      await studentsService.createStudent(student, avatar || undefined);
      setMessage("登録成功！");
      setShowCheck(true);
      setTimeout(() => setShowCheck(false), 1200);
      setLastName("");
      setFirstName("");
      setStudentId("");
      setAdmissionYear(YEARS[0]);
      setDepartment(DEPARTMENTS[0]);
      setSelectedCourses([]);
      setHobby("");
      setAvatar(null);
      setAvatarUrl("");
      setSelfIntro("");
    } catch (err) {
      setMessage("登録失敗: " + (err as Error).message);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h1 style={titleStyle}>登録フォーム</h1>
      {/* ローディングスピナー */}
      {submitting && (
        <div className="spinner" style={{ marginBottom: 16 }} />
      )}
      {/* チェックマークアニメーション */}
      {showCheck && (
        <svg className="checkmark" viewBox="0 0 52 52">
          <circle className="checkmark__circle" cx="26" cy="26" r="24" />
          <path className="checkmark__check" fill="none" d="M14 27l7 7 16-16" />
        </svg>
      )}
      <div style={rowStyle}>
        <div style={colStyle}>
          <label style={labelStyle}>姓<span style={asteriskStyle}>*</span></label>
          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="空欄" style={inputStyle} className={errorFields.includes('lastName') ? 'shake' : ''} />
        </div>
        <div style={colStyle}>
          <label style={labelStyle}>名<span style={asteriskStyle}>*</span></label>
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="空欄" style={inputStyle} className={errorFields.includes('firstName') ? 'shake' : ''} />
        </div>
      </div>
      <div style={rowStyle}>
        <div style={colStyleFull}>
          <label style={labelStyle}>学籍番号<span style={asteriskStyle}>*</span></label>
          <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} required placeholder="例: 8925001" style={inputStyle} className={errorFields.includes('studentId') ? 'shake' : ''} />
        </div>
      </div>
      <div style={rowStyle}>
        <div style={{ ...colStyle, flex: 1 }}>
          <label style={labelStyle}>学科<span style={asteriskStyle}>*</span></label>
          <select value={department} onChange={e => setDepartment(e.target.value)} required style={{ ...inputStyle, appearance: 'none' }} className={errorFields.includes('department') ? 'shake' : ''}>
            {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
        </div>
      </div>
      <div style={rowStyle}>
        <div style={{ ...colStyle, flex: 1 }}>
          <label style={labelStyle}>入学年度<span style={asteriskStyle}>*</span></label>
          <select value={admissionYear} onChange={e => setAdmissionYear(Number(e.target.value))} required style={{ ...inputStyle, appearance: 'none' }} className={errorFields.includes('admissionYear') ? 'shake' : ''}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div style={coursesGroupStyle}>
        <div style={coursesLabelStyle}>履修授業<span style={asteriskStyle}>*</span></div>
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
      <div style={rowStyle}>
        <div style={colStyleFull}>
          <label style={labelStyle}>顔写真<span style={asteriskStyle}>*</span></label>
          <div style={avatarBoxStyle}>
            <input type="file" accept="image/*" onChange={handleAvatarChange} required style={{ display: 'none' }} id="avatar-upload" ref={fileInputRef} />
            <label htmlFor="avatar-upload" style={avatarLabelStyle}>
              <span style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }}>📤</span>
              Drop Or Upload Your File
            </label>
            {avatarUrl && !showCropper && (
              <div style={{ marginTop: 12 }}>
                <img src={avatarUrl} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, border: '1px solid #ccc' }} />
              </div>
            )}
            {showCropper && (
              <div style={{ position: 'relative', width: 260, height: 260, background: '#222', margin: '16px auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Cropper
                  image={avatarUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1} // 四角形
                  cropShape="rect"
                  showGrid={true}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            )}
            {showCropper && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <button type="button" onClick={handleCropSave} style={{ background: '#07190f', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 28px', fontWeight: 600, fontSize: 16 }}>トリミングして決定</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={rowStyle}>
        <div style={colStyleFull}>
          <label style={labelStyle}>趣味<span style={asteriskStyle}>*</span></label>
          <input type="text" value={hobby} onChange={e => setHobby(e.target.value)} required placeholder="空欄" style={inputStyle} className={errorFields.includes('hobby') ? 'shake' : ''} />
        </div>
      </div>
      <div style={rowStyle}>
        <div style={colStyleFull}>
          <label style={labelStyle}>自己紹介<span style={asteriskStyle}>*</span></label>
          <textarea value={selfIntro} onChange={e => setSelfIntro(e.target.value)} required placeholder="空欄" style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} className={errorFields.includes('selfIntro') ? 'shake' : ''} />
        </div>
      </div>
      <button type="submit" style={buttonStyle}>完了</button>
      {message && <div style={messageStyle}>{message}</div>}
    </form>
  );
}

const formStyle: React.CSSProperties = {
  maxWidth: 700,
  margin: '0 auto',
  background: '#fff',
  borderRadius: 16,
  padding: '40px 32px',
  boxShadow: '0 2px 8px #0001',
};
const titleStyle: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 700,
  marginBottom: 32,
};
const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 24,
  marginBottom: 24,
  flexWrap: 'wrap',
};
const colStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 180,
  display: 'flex',
  flexDirection: 'column',
};
const colStyleFull: React.CSSProperties = {
  flex: '0 0 100%',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
};
const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  marginBottom: 4,
};
const asteriskStyle: React.CSSProperties = {
  color: 'red',
  marginLeft: 2,
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  border: '1.5px solid #bbb',
  borderRadius: 8,
  fontSize: 16,
  marginTop: 8,
  background: '#fafbfc',
  outline: 'none',
  marginBottom: 0,
  boxSizing: 'border-box',
};
const coursesGroupStyle: React.CSSProperties = {
  background: '#fafbfc',
  borderRadius: 16,
  border: '1.5px solid #e5e7eb',
  padding: '14px 18px',
  marginBottom: 24,
  marginTop: -8,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 8,
};
const coursesLabelStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  marginBottom: 4,
};
const coursesCheckboxesStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  flexWrap: 'wrap',
};
const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 15,
  background: '#fff',
  borderRadius: 12,
  padding: '2px 10px',
  border: '1px solid #e5e7eb',
};
const checkboxStyle: React.CSSProperties = {
  accentColor: '#2a4d7a',
  width: 16,
  height: 16,
  margin: 0,
};
const avatarBoxStyle: React.CSSProperties = {
  border: '1.5px dashed #bbb',
  borderRadius: 10,
  background: '#fafbfc',
  padding: 24,
  textAlign: 'center',
  marginTop: 8,
  marginBottom: 8,
};
const avatarLabelStyle: React.CSSProperties = {
  cursor: 'pointer',
  color: '#222',
  fontWeight: 500,
  display: 'inline-block',
};
const buttonStyle: React.CSSProperties = {
  width: 180,
  height: 44,
  background: '#07190f',
  color: '#fff',
  border: 'none',
  borderRadius: 24,
  fontWeight: 600,
  fontSize: 18,
  display: 'block',
  margin: '0 auto',
  letterSpacing: 2,
};
const messageStyle: React.CSSProperties = {
  marginTop: 20,
  color: '#008000',
  textAlign: 'center',
  fontWeight: 600,
}; 