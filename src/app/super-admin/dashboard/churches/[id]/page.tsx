import ChurchDetailClientPage from './client-page';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChurchDetailPage({ params }: Props) {
  const { id } = await params;
  return <ChurchDetailClientPage id={id} />;
}
