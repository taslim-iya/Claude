'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface EnrichmentJob {
  id: string;
  status: string;
  totalRecords: number;
  processed: number;
  succeeded: number;
  failed: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export default function EnrichmentPage() {
  const [jobs, setJobs] = useState<EnrichmentJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [stats, setStats] = useState<{ pending: number; unreviewed: number }>({ pending: 0, unreviewed: 0 });

  const fetchJobs = useCallback(async () => {
    const res = await fetch('/api/admin/enrichment');
    if (res.ok) {
      const data = await res.json();
      setJobs(data.data);
    }
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/companies?status=PENDING_ENRICHMENT&limit=1');
    if (res.ok) {
      const data = await res.json();
      setStats(s => ({ ...s, pending: data.pagination.total }));
    }
    const res2 = await fetch('/api/admin/companies?status=UNREVIEWED&limit=1');
    if (res2.ok) {
      const data = await res2.json();
      setStats(s => ({ ...s, unreviewed: data.pagination.total }));
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [fetchJobs, fetchStats]);

  const startEnrichment = async () => {
    setStarting(true);
    const res = await fetch('/api/admin/enrichment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    if (res.ok) {
      fetchJobs();
      fetchStats();
    }
    setStarting(false);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      COMPLETED: 'success',
      RUNNING: 'info',
      FAILED: 'danger',
      PENDING: 'default',
      CANCELLED: 'warning',
    };
    return <Badge variant={map[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Enrichment Pipeline</h1>
          <p className="text-secondary text-sm mt-1">Verify and enrich company data</p>
        </div>
        <Button
          onClick={startEnrichment}
          loading={starting}
          disabled={stats.pending + stats.unreviewed === 0}
        >
          Enrich All Pending ({stats.pending + stats.unreviewed})
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-secondary">Pending Enrichment</p>
            <p className="text-2xl font-bold mt-1">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-secondary">Unreviewed</p>
            <p className="text-2xl font-bold mt-1">{stats.unreviewed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-secondary">Total Jobs Run</p>
            <p className="text-2xl font-bold mt-1">{jobs.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Job History</h2>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-secondary">Loading...</div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-secondary">No enrichment jobs yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-secondary">Job ID</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">Status</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">Progress</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">Succeeded</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">Failed</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">Started</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{job.id.slice(0, 12)}...</td>
                    <td className="px-4 py-3 text-center">{statusBadge(job.status)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${job.totalRecords > 0 ? (job.processed / job.totalRecords) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-secondary whitespace-nowrap">
                          {job.processed}/{job.totalRecords}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">{job.succeeded}</td>
                    <td className="px-4 py-3 text-center text-red-600 font-medium">{job.failed}</td>
                    <td className="px-4 py-3 text-secondary text-xs">
                      {job.startedAt ? new Date(job.startedAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-secondary text-xs">
                      {job.completedAt ? new Date(job.completedAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
