import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api-server';
import { AddMemberForm } from './components/AddMemberForm';

export const metadata: Metadata = {
  title: 'Thêm Khai sinh | Sổ Giáo Dân',
};

export default async function AddMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  let householdData = null;
  try {
    const res = await serverFetch(`/api/v1/households/${id}`);
    householdData = res?.data;
  } catch (error) {
    console.error(`Error fetching household ${id}:`, error);
  }

  if (!householdData) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <header className="h-16 flex items-center justify-between px-8 border-b border-border-color bg-surface flex-shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <nav className="flex items-center text-muted text-sm font-medium">
            <span className="hover:text-primary cursor-pointer">Hộ giáo</span>
            <span className="material-symbols-outlined text-sm text-muted/60 mx-1">chevron_right</span>
            <span className="hover:text-primary cursor-pointer">Chi tiết Hộ giáo</span>
            <span className="material-symbols-outlined text-sm text-muted/60 mx-1">chevron_right</span>
            <h1 className="font-display font-bold text-lg text-primary">Thêm giáo dân</h1>
          </nav>
        </div>
      </header>
      
      <section className="p-8 flex-1 flex justify-center bg-background-light overflow-y-auto">
        <div className="w-full max-w-4xl pb-12">
          <AddMemberForm household={householdData} />
        </div>
      </section>
    </div>
  );
}
