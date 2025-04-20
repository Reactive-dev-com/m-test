import DataTable from '../components/data-table';

import { Suspense } from 'react';

export default function Dashboard() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold mb-6">Payroll Dashboard</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <DataTable />
        </Suspense>
      </main>
    </div>
  );
}
