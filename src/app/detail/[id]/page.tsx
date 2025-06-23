import StudentDetailView from '@/components/StudentDetailView';

// このページはidを受け取り、クライアントコンポーネントに渡すだけのシンプルな構造です
export default function StudentDetailPage({ params }: { params: { id: string } }) {
  return <StudentDetailView id={params.id} />;
}