import StudentDetailView from '@/components/StudentDetailView';

// 型定義を完全に削除
export default function StudentDetailPage(props: any) {
  // idの取得方法もpropsから直接取得
  const id = props?.params?.id;
  return <StudentDetailView id={id} />;
}