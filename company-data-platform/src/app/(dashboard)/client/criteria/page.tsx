'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function ClientCriteriaPage() {
  const [criteria, setCriteria] = useState<string>('');
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/client/info');
      if (res.ok) {
        const data = await res.json();
        setCriteria(data.criteria ? JSON.stringify(data.criteria, null, 2) : '');
        setCanEdit(data.canEditCriteria);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const parsed = JSON.parse(criteria);
      const res = await fetch('/api/client/criteria', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria: parsed }),
      });
      if (res.ok) {
        setMessage('Criteria saved successfully');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to save');
      }
    } catch {
      setMessage('Invalid JSON format');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-12 text-center text-secondary">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Filter Criteria</h1>
        <p className="text-secondary text-sm mt-1">
          {canEdit ? 'Edit your API filter criteria' : 'View your API filter criteria (read-only)'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Criteria Definition</h2>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Available Filter Fields</label>
            <div className="grid grid-cols-3 gap-2 text-xs text-secondary mb-4">
              <span>sicCodes: string[]</span>
              <span>sicCodeRanges: {'{from, to}[]'}</span>
              <span>industryInclude: string[]</span>
              <span>industryExclude: string[]</span>
              <span>revenueMin / revenueMax: number</span>
              <span>profitBeforeTaxMin / Max: number</span>
              <span>totalAssetsMin / Max: number</span>
              <span>netAssetsMin / Max: number</span>
              <span>websiteExists: boolean</span>
              <span>verifiedOnly: boolean</span>
              <span>descriptionKeywords: string[]</span>
              <span>industryKeywords: string[]</span>
            </div>
          </div>

          <textarea
            className="w-full rounded-lg border border-border px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-50"
            rows={15}
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            disabled={!canEdit}
            placeholder={`{
  "sicCodes": ["62020", "62090"],
  "revenueMin": 100000,
  "verifiedOnly": true
}`}
          />

          {message && (
            <p className={`mt-2 text-sm ${message.includes('success') ? 'text-green-600' : 'text-danger'}`}>
              {message}
            </p>
          )}

          {canEdit && (
            <div className="flex justify-end mt-4">
              <Button onClick={handleSave} loading={saving}>Save Criteria</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
