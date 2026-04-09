import { Metadata } from 'next';
import { Suspense } from 'react';
import LoadingHouseholds from './loading';
import HouseholdsClient from './HouseholdsClient';

export const metadata: Metadata = {
  title: 'Danh sách Hộ giáo | Sổ Giáo Dân',
};

export default function HouseholdsPage() {
  return (
    <Suspense fallback={<LoadingHouseholds />}>
      <HouseholdsClient />
    </Suspense>
  );
}
