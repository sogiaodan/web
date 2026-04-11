'use client';

import { useState } from 'react';
import { SacramentTabs } from '../../components/SacramentTabs';
import { SacramentForm } from './SacramentForm';
import { MarriageForm } from './MarriageForm';
import { SacramentType } from '@/types/sacrament';

export function NewSacramentClient() {
  const [activeTab, setActiveTab] = useState<SacramentType>('BAPTISM');

  return (
    <>
      <SacramentTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="mt-6">
        {activeTab === 'MARRIAGE' ? (
          <MarriageForm />
        ) : (
          <SacramentForm type={activeTab} />
        )}
      </div>
    </>
  );
}
