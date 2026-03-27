'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';

const ENDPOINTS = [
  { value: 'GET /api/v1/companies', label: 'GET /api/v1/companies' },
  { value: 'GET /api/v1/companies/:id', label: 'GET /api/v1/companies/:id' },
  { value: 'POST /api/v1/search', label: 'POST /api/v1/search' },
  { value: 'GET /api/v1/industries', label: 'GET /api/v1/industries' },
  { value: 'GET /api/v1/sic-codes', label: 'GET /api/v1/sic-codes' },
  { value: 'GET /api/v1/stats', label: 'GET /api/v1/stats' },
];

export default function ApiExplorerPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0].value);
  const [apiKey, setApiKey] = useState('');
  const [params, setParams] = useState('');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const executeRequest = async () => {
    setLoading(true);
    setResponse(null);
    setStatusCode(null);

    const [method, path] = selectedEndpoint.split(' ');
    let url = path;

    if (params) {
      const paramStr = params.includes('?') ? params : `?${params}`;
      url += paramStr;
    }

    const start = Date.now();
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      };

      if (method === 'POST' && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const elapsed = Date.now() - start;
      setResponseTime(elapsed);
      setStatusCode(res.status);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponseTime(Date.now() - start);
      setResponse(err instanceof Error ? err.message : 'Request failed');
      setStatusCode(0);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">API Explorer</h1>
        <p className="text-secondary text-sm mt-1">Test API endpoints with your credentials</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Request</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="API Key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="cdp_..."
              />
              <Select
                label="Endpoint"
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                options={ENDPOINTS}
              />
              <Input
                label="Query Parameters"
                value={params}
                onChange={(e) => setParams(e.target.value)}
                placeholder="page=1&limit=10&search=tech"
              />
              {selectedEndpoint.startsWith('POST') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Request Body (JSON)</label>
                  <textarea
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={`{
  "companyName": "tech",
  "revenueMin": 100000,
  "verifiedOnly": true
}`}
                  />
                </div>
              )}
              <Button onClick={executeRequest} loading={loading} disabled={!apiKey} className="w-full">
                Send Request
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Response</h2>
                {statusCode !== null && (
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusCode >= 200 && statusCode < 300 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {statusCode}
                    </span>
                    {responseTime !== null && (
                      <span className="text-xs text-secondary">{responseTime}ms</span>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {response ? (
                <pre className="text-xs font-mono bg-gray-50 p-4 rounded-lg overflow-auto max-h-[600px] whitespace-pre-wrap">
                  {response}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-48 text-secondary text-sm">
                  Send a request to see the response
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
