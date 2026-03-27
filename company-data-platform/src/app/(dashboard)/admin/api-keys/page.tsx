'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface ApiKeyEntry {
  id: string;
  keyPrefix: string;
  name: string;
  status: string;
  rateLimit: number;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
  user: { name: string; email: string };
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string; email: string }[]>([]);
  const [form, setForm] = useState({ userId: '', name: '', rateLimit: 1000 });
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    const res = await fetch('/api/admin/api-keys');
    if (res.ok) {
      const data = await res.json();
      setKeys(data.data);
    }
    setLoading(false);
  }, []);

  const fetchClients = useCallback(async () => {
    const res = await fetch('/api/admin/clients?limit=100');
    if (res.ok) {
      const data = await res.json();
      setClients(data.data);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
    fetchClients();
  }, [fetchKeys, fetchClients]);

  const handleCreate = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setNewKey(data.key);
      fetchKeys();
    }
    setSaving(false);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    await fetch(`/api/admin/api-keys/${id}/revoke`, { method: 'POST' });
    fetchKeys();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-secondary text-sm mt-1">Manage client API access</p>
        </div>
        <Button onClick={() => { setForm({ userId: '', name: '', rateLimit: 1000 }); setNewKey(null); setShowCreate(true); }}>
          Create API Key
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
                  <th className="px-4 py-3 text-left font-medium text-secondary">Key Prefix</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">Client</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">Status</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">Rate Limit</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">Last Used</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">Created</th>
                  <th className="px-4 py-3 text-right font-medium text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{k.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-secondary">{k.keyPrefix}...</td>
                    <td className="px-4 py-3 text-secondary">{k.user.name}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={k.status === 'ACTIVE' ? 'success' : 'danger'}>{k.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">{k.rateLimit}/min</td>
                    <td className="px-4 py-3 text-secondary text-xs">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-secondary text-xs">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {k.status === 'ACTIVE' && (
                        <Button variant="danger" size="sm" onClick={() => handleRevoke(k.id)}>Revoke</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create API Key">
        {newKey ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">API Key Created Successfully</p>
              <p className="text-xs text-green-700 mb-2">Copy this key now. It will not be shown again.</p>
              <div className="bg-white p-3 rounded border font-mono text-xs break-all select-all">{newKey}</div>
            </div>
            <Button variant="secondary" onClick={() => setShowCreate(false)} className="w-full">Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Client</label>
              <select
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.userId}
                onChange={(e) => setForm(f => ({ ...f, userId: e.target.value }))}
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>
            <Input label="Key Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Production Key" />
            <Input label="Rate Limit (per minute)" type="number" value={String(form.rateLimit)} onChange={(e) => setForm(f => ({ ...f, rateLimit: parseInt(e.target.value) || 1000 }))} />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} loading={saving} disabled={!form.userId || !form.name}>Create Key</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
