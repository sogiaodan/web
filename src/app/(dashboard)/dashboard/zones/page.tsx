import { Metadata } from 'next';
import ZonesClient from './ZonesClient';

export const metadata: Metadata = {
  title: 'Danh sách Giáo khu | Sổ Giáo Dân',
};

export default function ZonesPage() {
  return <ZonesClient />;
}
