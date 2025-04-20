import Link from 'next/link';
import DataTable from './components/data-table';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <ul>
          <li>
            <Link href="/data-table">Data table</Link>
          </li>
          <li>
            <Link href="/form">Form</Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
