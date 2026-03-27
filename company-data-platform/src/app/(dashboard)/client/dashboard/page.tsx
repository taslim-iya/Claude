'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ClientDashboardPage() {
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; keyPrefix: string; name: string; status: string; rateLimit: number; lastUsedAt: string | null }>>([]);
  const [criteria, setCriteria] = useState<Record<string, unknown> | null>(null);
  const [usage, setUsage] = useState<{ total: number; today: number; thisWeek: number }>({ total: 0, today: 0, thisWeek: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [meRes] = await Promise.all([
        fetch('/api/auth/me'),
      ]);
      if (meRes.ok) {
        const me = await meRes.json();
        // Fetch client-specific data
        const detailRes = await fetch(`/api/client/info`);
        if (detailRes.ok) {
          const detail = await detailRes.json();
          setApiKeys(detail.apiKeys || []);
          setCriteria(detail.criteria);
          setUsage(detail.usage);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="p-12 text-center text-secondary">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-secondary text-sm mt-1">Your API access overview</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-secondary">Total API Calls</p>
            <p className="text-2xl font-bold mt-1">{usage.total.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-secondary">Today</p>
            <p className="text-2xl font-bold mt-1">{usage.today.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-secondary">This Week</p>
            <p className="text-2xl font-bold mt-1">{usage.thisWeek.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">API Keys</h2>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <p className="text-secondary text-sm">No API keys assigned yet. Contact your admin.</p>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((k) => (
                  <div key={k.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{k.name}</p>
                      <p className="text-xs text-secondary font-mono">{k.keyPrefix}...</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={k.status === 'ACTIVE' ? 'success' : 'danger'}>{k.status}</Badge>
                      <p className="text-xs text-secondary mt-1">{k.rateLimit}/min</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold">Active Criteria</h2>
          </CardHeader>
          <CardContent>
            {criteria ? (
              <pre className="text-xs font-mono bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
                {JSON.stringify(criteria, null, 2)}
              </pre>
            ) : (
              <p className="text-secondary text-sm">No filter criteria configured.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
