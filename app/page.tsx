// app/page.tsx
import { Suspense } from 'react';
import HomeClient from './Homeclient';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-600">Loading…</div>}>
      <HomeClient />
    </Suspense>
  );
}
