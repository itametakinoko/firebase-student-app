import "@/styles/globals.css";
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ background: '#f5f7fa', minHeight: '100vh' }}>
        <nav style={{ background: '#fff', borderBottom: '1.5px solid #eee', padding: '12px 0', marginBottom: 32 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 32, alignItems: 'center', fontWeight: 600, fontSize: 17 }}>
            <Link href="/" style={{ color: '#2a4d7a', textDecoration: 'none' }}>学生リスト</Link>
            <Link href="/register" style={{ color: '#2a4d7a', textDecoration: 'none' }}>新規登録</Link>
            <Link href="/myaccount" style={{ color: '#2a4d7a', textDecoration: 'none' }}>マイアカウント</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
