'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface UsageLog {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number | null;
  createdAt: string;
}

export default function ClientUsagePage() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0 });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pagination.page), limit: String(pagination.limit) });
    const res = await fetch(`/api/client/usage?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.data);
      setPagination(data.pagination);
    }
    setLoading(false);
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchLogs();
    fetch('/api/client/info').then(r => r.json()).then(d => setStats(d.usage));
  }, [fetchLogs]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">API Usage</h1>
        <p className="text-secondary text-sm mt-1">Monitor your API consumption</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-secondary">Total Calls</p>
            <p className="text-2xl font-bold mt-1">{stats.total.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-secondary">Today</p>
            <p className="text-2xl font-bold mt-1">{stats.today.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-secondary">This Week</p>
            <p className="text-2xl font-bold mt-1">{stats.thisWeek.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Recent API Calls</h2>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-secondary">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-secondary">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">Method</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">Endpoint</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-secondary">Response Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-secondary whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs font-medium ${log.method === 'GET' ? 'text-green-600' : 'text-blue-600'}`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{log.endpoint}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${log.statusCode >= 200 && log.statusCode < 300 ? 'bg-green-100 text-green-800' : log.statusCode >= 400 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-secondary">{log.responseTime ? `${log.responseTime}ms` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-secondary">Page {pagination.page} of {pagination.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Previous</Button>
                <Button variant="secondary" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
