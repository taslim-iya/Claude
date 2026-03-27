'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
    });
    if (actionFilter) params.set('action', actionFilter);

    const res = await fetch(`/api/admin/audit-logs?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.data);
      setPagination(data.pagination);
    }
    setLoading(false);
  }, [pagination.page, pagination.limit, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-secondary text-sm mt-1">Track all platform activity</p>
      </div>

      <Card>
        <CardHeader>
          <Input
            placeholder="Filter by action..."
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-secondary">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-secondary">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">User</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">Entity</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-secondary whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{log.user?.name || 'System'}</td>
                    <td className="px-4 py-3 font-medium">{log.action}</td>
                    <td className="px-4 py-3 text-secondary">
                      {log.entityType}
                      {log.entityId && <span className="text-xs ml-1">({log.entityId.slice(0, 8)}...)</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-secondary max-w-xs truncate">
                      {log.newValues ? JSON.stringify(log.newValues).slice(0, 100) : '-'}
                    </td>
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
