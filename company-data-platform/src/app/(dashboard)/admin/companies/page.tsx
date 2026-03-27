'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { VerificationBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';

interface Company {
  id: string;
  companyName: string;
  sicCode: string | null;
  industry: string | null;
  description: string | null;
  revenue: string | null;
  profitBeforeTax: string | null;
  totalAssets: string | null;
  netAssets: string | null;
  website: string | null;
  verificationStatus: string;
  verificationScore: number | null;
  notes: string | null;
  createdAt: string;
  sourceEvidence?: unknown[];
  enrichmentResults?: unknown[];
  companyEdits?: unknown[];
  _count?: { sourceEvidence: number; enrichmentResults: number };
}

interface PaginatedResponse {
  data: Company[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Company>>({});
  const [saving, setSaving] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
    });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);

    const res = await fetch(`/api/admin/companies?${params}`);
    if (res.ok) {
      const data: PaginatedResponse = await res.json();
      setCompanies(data.data);
      setPagination(data.pagination);
    }
    setLoading(false);
  }, [pagination.page, pagination.limit, search, statusFilter]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const fetchDetail = async (id: string) => {
    const res = await fetch(`/api/admin/companies/${id}`);
    if (res.ok) {
      const data = await res.json();
      setDetailCompany(data);
      setShowDetail(true);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setShowCreate(false);
      setEditForm({});
      fetchCompanies();
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!selectedCompany) return;
    setSaving(true);
    const res = await fetch(`/api/admin/companies/${selectedCompany.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setSelectedCompany(null);
      setEditForm({});
      fetchCompanies();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    await fetch(`/api/admin/companies/${id}`, { method: 'DELETE' });
    fetchCompanies();
  };

  const formatCurrency = (val: string | null) => {
    if (!val) return '-';
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(Number(val));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="text-secondary text-sm mt-1">{pagination.total} total records</p>
        </div>
        <Button onClick={() => { setEditForm({}); setShowCreate(true); }}>Add Company</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search companies..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="max-w-sm"
            />
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'VERIFIED', label: 'Verified' },
                { value: 'PARTIAL', label: 'Partial' },
                { value: 'FAILED', label: 'Failed' },
                { value: 'UNREVIEWED', label: 'Unreviewed' },
                { value: 'PENDING_ENRICHMENT', label: 'Pending Enrichment' },
              ]}
              className="w-48"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-secondary">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-secondary">Company Name</th>
                    <th className="px-4 py-3 text-left font-medium text-secondary">SIC</th>
                    <th className="px-4 py-3 text-left font-medium text-secondary">Industry</th>
                    <th className="px-4 py-3 text-right font-medium text-secondary">Revenue</th>
                    <th className="px-4 py-3 text-center font-medium text-secondary">Status</th>
                    <th className="px-4 py-3 text-center font-medium text-secondary">Score</th>
                    <th className="px-4 py-3 text-center font-medium text-secondary">Evidence</th>
                    <th className="px-4 py-3 text-right font-medium text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {companies.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <button onClick={() => fetchDetail(c.id)} className="text-primary hover:underline text-left">
                          {c.companyName}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-secondary">{c.sicCode || '-'}</td>
                      <td className="px-4 py-3 text-secondary">{c.industry || '-'}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(c.revenue)}</td>
                      <td className="px-4 py-3 text-center">
                        <VerificationBadge status={c.verificationStatus} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {c.verificationScore != null ? (
                          <span className={`font-medium ${c.verificationScore >= 70 ? 'text-green-600' : c.verificationScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {c.verificationScore}%
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-secondary">
                        {c._count?.sourceEvidence || 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCompany(c);
                              setEditForm({
                                companyName: c.companyName,
                                sicCode: c.sicCode,
                                industry: c.industry,
                                description: c.description,
                                revenue: c.revenue,
                                profitBeforeTax: c.profitBeforeTax,
                                totalAssets: c.totalAssets,
                                netAssets: c.netAssets,
                                website: c.website,
                                notes: c.notes,
                              });
                            }}
                          >
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-secondary">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Company" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company Name" value={editForm.companyName || ''} onChange={(e) => setEditForm(f => ({ ...f, companyName: e.target.value }))} required />
          <Input label="SIC Code" value={editForm.sicCode || ''} onChange={(e) => setEditForm(f => ({ ...f, sicCode: e.target.value }))} />
          <Input label="Industry" value={editForm.industry || ''} onChange={(e) => setEditForm(f => ({ ...f, industry: e.target.value }))} />
          <Input label="Website" value={editForm.website || ''} onChange={(e) => setEditForm(f => ({ ...f, website: e.target.value }))} />
          <Input label="Revenue" type="number" value={editForm.revenue || ''} onChange={(e) => setEditForm(f => ({ ...f, revenue: e.target.value }))} />
          <Input label="Profit Before Tax" type="number" value={editForm.profitBeforeTax || ''} onChange={(e) => setEditForm(f => ({ ...f, profitBeforeTax: e.target.value }))} />
          <Input label="Total Assets" type="number" value={editForm.totalAssets || ''} onChange={(e) => setEditForm(f => ({ ...f, totalAssets: e.target.value }))} />
          <Input label="Net Assets" type="number" value={editForm.netAssets || ''} onChange={(e) => setEditForm(f => ({ ...f, netAssets: e.target.value }))} />
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
              value={editForm.description || ''}
              onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="col-span-2">
            <Input label="Notes" value={editForm.notes || ''} onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} loading={saving}>Create Company</Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!selectedCompany} onClose={() => setSelectedCompany(null)} title="Edit Company" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company Name" value={editForm.companyName || ''} onChange={(e) => setEditForm(f => ({ ...f, companyName: e.target.value }))} />
          <Input label="SIC Code" value={editForm.sicCode || ''} onChange={(e) => setEditForm(f => ({ ...f, sicCode: e.target.value }))} />
          <Input label="Industry" value={editForm.industry || ''} onChange={(e) => setEditForm(f => ({ ...f, industry: e.target.value }))} />
          <Input label="Website" value={editForm.website || ''} onChange={(e) => setEditForm(f => ({ ...f, website: e.target.value }))} />
          <Input label="Revenue" type="number" value={editForm.revenue || ''} onChange={(e) => setEditForm(f => ({ ...f, revenue: e.target.value }))} />
          <Input label="Profit Before Tax" type="number" value={editForm.profitBeforeTax || ''} onChange={(e) => setEditForm(f => ({ ...f, profitBeforeTax: e.target.value }))} />
          <Input label="Total Assets" type="number" value={editForm.totalAssets || ''} onChange={(e) => setEditForm(f => ({ ...f, totalAssets: e.target.value }))} />
          <Input label="Net Assets" type="number" value={editForm.netAssets || ''} onChange={(e) => setEditForm(f => ({ ...f, netAssets: e.target.value }))} />
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
              value={editForm.description || ''}
              onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="col-span-2">
            <Input label="Notes" value={editForm.notes || ''} onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setSelectedCompany(null)}>Cancel</Button>
          <Button onClick={handleUpdate} loading={saving}>Save Changes</Button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={detailCompany?.companyName || ''} size="xl">
        {detailCompany && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-xs text-secondary">SIC Code</p><p className="font-medium">{detailCompany.sicCode || '-'}</p></div>
              <div><p className="text-xs text-secondary">Industry</p><p className="font-medium">{detailCompany.industry || '-'}</p></div>
              <div><p className="text-xs text-secondary">Website</p><p className="font-medium">{detailCompany.website || '-'}</p></div>
              <div><p className="text-xs text-secondary">Revenue</p><p className="font-medium">{formatCurrency(detailCompany.revenue)}</p></div>
              <div><p className="text-xs text-secondary">Profit Before Tax</p><p className="font-medium">{formatCurrency(detailCompany.profitBeforeTax)}</p></div>
              <div><p className="text-xs text-secondary">Total Assets</p><p className="font-medium">{formatCurrency(detailCompany.totalAssets)}</p></div>
              <div><p className="text-xs text-secondary">Net Assets</p><p className="font-medium">{formatCurrency(detailCompany.netAssets)}</p></div>
              <div><p className="text-xs text-secondary">Verification</p><VerificationBadge status={detailCompany.verificationStatus} /></div>
              <div><p className="text-xs text-secondary">Score</p><p className="font-medium">{detailCompany.verificationScore ?? '-'}%</p></div>
            </div>

            {detailCompany.description && (
              <div>
                <p className="text-xs text-secondary mb-1">Description</p>
                <p className="text-sm">{detailCompany.description}</p>
              </div>
            )}

            {detailCompany.sourceEvidence && (detailCompany.sourceEvidence as unknown[]).length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Source Evidence</h3>
                <div className="space-y-2">
                  {(detailCompany.sourceEvidence as Array<{ id: string; sourceType: string; fieldName: string; extractedValue: string | null; confidence: number | null }>).map((ev) => (
                    <div key={ev.id} className="p-3 rounded-lg bg-gray-50 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ev.fieldName}</span>
                        <span className="text-secondary">via {ev.sourceType}</span>
                        {ev.confidence && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{ev.confidence}%</span>}
                      </div>
                      {ev.extractedValue && <p className="text-secondary mt-1">Extracted: {ev.extractedValue}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailCompany.companyEdits && (detailCompany.companyEdits as unknown[]).length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Edit History</h3>
                <div className="space-y-2">
                  {(detailCompany.companyEdits as Array<{ id: string; fieldName: string; oldValue: string | null; newValue: string | null; createdAt: string }>).map((edit) => (
                    <div key={edit.id} className="p-3 rounded-lg bg-gray-50 text-sm">
                      <span className="font-medium">{edit.fieldName}</span>:
                      <span className="text-red-500 line-through ml-2">{edit.oldValue || 'empty'}</span>
                      <span className="text-green-600 ml-2">{edit.newValue || 'empty'}</span>
                      <span className="text-secondary ml-2 text-xs">{new Date(edit.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
