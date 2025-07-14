import StudentDetailView from '@/components/StudentDetailView';

// Next.js 15の新しい非同期パラメータ取得方式
export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentDetailView id={id} />;
}