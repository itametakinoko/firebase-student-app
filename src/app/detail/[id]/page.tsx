import StudentDetailView from '@/components/StudentDetailView';

// The page component is now a simple, non-async component
export default function StudentDetailPage({ params }: { params: { id: string } }) {
  // It renders the client component and passes the id
  return <StudentDetailView id={params.id} />;
}