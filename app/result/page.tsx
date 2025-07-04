// app/result/page.tsx
import { Suspense } from 'react';
import SearchResult from './SearchResult';

export default function Page() {
  return (
    <div className="pt-32">
      {/* You can also put a heading or layout here */}
      <Suspense fallback={<p>Loading search results…</p>}>
        <SearchResult />
      </Suspense>
    </div>
  );
}
