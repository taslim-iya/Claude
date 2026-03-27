'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface Client {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  clientCriteria: { criteria: Record<string, unknown>; canEdit: boolean } | null;
  _count: { apiKeys: number; apiUsageLogs: number };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', canEdit: false });
  const [criteriaJson, setCriteriaJson] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchClients = useCallback(async () => {
    const res = await fetch('/api/admin/clients');
    if (res.ok) {
      const data = await res.json();
      setClients(data.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleCreate = async () => {
    setSaving(true);
    let criteria;
    try { criteria = criteriaJson ? JSON.parse(criteriaJson) : undefined; } catch { alert('Invalid JSON for criteria'); setSaving(false); return; }

    const res = await fetch('/api/admin/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, criteria, canEdit: form.canEdit }),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', canEdit: false });
      setCriteriaJson('');
      fetchClients();
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!selectedClient) return;
    setSaving(true);
    let criteria;
    try { criteria = criteriaJson ? JSON.parse(criteriaJson) : undefined; } catch { alert('Invalid JSON for criteria'); setSaving(false); return; }

    await fetch(`/api/admin/clients/${selectedClient.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        isActive: selectedClient.isActive,
        criteria,
        canEdit: form.canEdit,
      }),
    });
    setShowEdit(false);
    fetchClients();
    setSaving(false);
  };

  const openEdit = (client: Client) => {
    setSelectedClient(client);
    setForm({ name: client.name, email: client.email, password: '', canEdit: client.clientCriteria?.canEdit || false });
    setCriteriaJson(client.clientCriteria ? JSON.stringify(client.clientCriteria.criteria, null, 2) : '');
    setShowEdit(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Client Management</h1>
          <p className="text-secondary text-sm mt-1">{clients.length} clients</p>
        </div>
        <Button onClick={() => { setForm({ name: '', email: '', password: '', canEdit: false }); setCriteriaJson(''); setShowCreate(true); }}>
          Add Client
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-secondary">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-secondary">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">Email</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">Status</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">API Keys</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">API Calls</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">Has Criteria</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">Last Login</th>
                  <th className="px-4 py-3 text-right font-medium text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-secondary">{c.email}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={c.isActive ? 'success' : 'danger'}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">{c._count.apiKeys}</td>
                    <td className="px-4 py-3 text-center">{c._count.apiUsageLogs}</td>
                    <td className="px-4 py-3 text-center">
                      {c.clientCriteria ? <Badge variant="info">Yes</Badge> : <Badge>No</Badge>}
                    </td>
                    <td className="px-4 py-3 text-secondary text-xs">
                      {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create Client Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Client" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} required />
          <div>
            <label className="block text-sm font-medium mb-1">Filter Criteria (JSON)</label>
            <textarea
              className="w-full rounded-lg border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={8}
              value={criteriaJson}
              onChange={(e) => setCriteriaJson(e.target.value)}
              placeholder={`{
  "sicCodes": ["62020"],
  "revenueMin": 100000,
  "verifiedOnly": true
}`}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.canEdit} onChange={(e) => setForm(f => ({ ...f, canEdit: e.target.checked }))} />
            Allow client to edit their own criteria
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} loading={saving}>Create Client</Button>
        </div>
      </Modal>

      {/* Edit Client Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Client" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Filter Criteria (JSON)</label>
            <textarea
              className="w-full rounded-lg border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={8}
              value={criteriaJson}
              onChange={(e) => setCriteriaJson(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.canEdit} onChange={(e) => setForm(f => ({ ...f, canEdit: e.target.checked }))} />
            Allow client to edit their own criteria
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdate} loading={saving}>Save Changes</Button>
        </div>
      </Modal>
    </div>
  );
}
