import "@/styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ background: '#f5f7fa', minHeight: '100vh' }}>
        <header style={{ padding: '1rem', background: '#2a4d7a', color: '#fff', marginBottom: 24 }}>
          <nav style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>
            <a href="/" style={{ color: '#fff', margin: '0 16px', textDecoration: 'none' }}>学生一覧</a>
            <a href="/register" style={{ color: '#fff', margin: '0 16px', textDecoration: 'none' }}>学生登録</a>
          </nav>
        </header>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>{children}</div>
      </body>
    </html>
  );
}
