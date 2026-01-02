'use client';

import { useEffect, useState } from 'react';

export default function TestClientPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    console.log('[TestClient] Component mounted');
    setMounted(true);
    
    fetch('/api/properties/public')
      .then(r => r.json())
      .then(d => {
        console.log('[TestClient] API response:', d);
        setData(d);
      })
      .catch(e => console.error('[TestClient] Error:', e));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Client-Side Test Page</h1>
      <p>Mounted: {mounted ? 'YES' : 'NO'}</p>
      <p>Data: {data ? JSON.stringify(data, null, 2) : 'Loading...'}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
