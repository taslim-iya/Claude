'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/companies',
    description: 'List companies matching your criteria with pagination and filtering.',
    params: [
      { name: 'page', type: 'number', desc: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', desc: 'Results per page (default: 20, max: 100)' },
      { name: 'search', type: 'string', desc: 'Search company name or industry' },
      { name: 'industry', type: 'string', desc: 'Filter by industry (partial match)' },
      { name: 'sic_code', type: 'string', desc: 'Filter by exact SIC code' },
      { name: 'verified', type: 'boolean', desc: 'Only return verified companies' },
      { name: 'sort_by', type: 'string', desc: 'Sort field: companyName, industry, revenue, createdAt' },
      { name: 'sort_order', type: 'string', desc: 'asc or desc' },
    ],
    response: `{
  "data": [
    {
      "id": "clx...",
      "companyName": "Acme Ltd",
      "sicCode": "62020",
      "industry": "Technology",
      "description": "...",
      "revenue": "1500000.00",
      "profitBeforeTax": "250000.00",
      "totalAssets": "3000000.00",
      "netAssets": "1800000.00",
      "website": "https://acme.com",
      "websiteDomain": "acme.com",
      "verificationStatus": "VERIFIED",
      "verificationScore": 85,
      "lastVerifiedAt": "2025-01-15T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/companies/:id',
    description: 'Get a single company by ID. Only returns the company if it matches your criteria.',
    params: [{ name: 'id', type: 'string', desc: 'Company ID (path parameter)' }],
    response: `{
  "id": "clx...",
  "companyName": "Acme Ltd",
  "sicCode": "62020",
  ...
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/search',
    description: 'Advanced search with multiple filters. Send filters in the request body.',
    params: [
      { name: 'companyName', type: 'string', desc: 'Search by company name' },
      { name: 'sicCode', type: 'string', desc: 'Filter by SIC code' },
      { name: 'industry', type: 'string', desc: 'Filter by industry' },
      { name: 'revenueMin', type: 'number', desc: 'Minimum revenue' },
      { name: 'revenueMax', type: 'number', desc: 'Maximum revenue' },
      { name: 'verifiedOnly', type: 'boolean', desc: 'Only verified companies' },
      { name: 'websiteExists', type: 'boolean', desc: 'Must have website' },
      { name: 'keywords', type: 'string', desc: 'Search in name, description, industry' },
      { name: 'page', type: 'number', desc: 'Page number' },
      { name: 'limit', type: 'number', desc: 'Results per page' },
      { name: 'sortBy', type: 'string', desc: 'Sort field' },
      { name: 'sortOrder', type: 'string', desc: 'asc or desc' },
    ],
    response: `// Same pagination response as GET /companies`,
  },
  {
    method: 'GET',
    path: '/api/v1/industries',
    description: 'List all unique industries with company counts.',
    params: [],
    response: `{
  "data": [
    { "industry": "Technology", "count": 45 },
    { "industry": "Finance", "count": 32 }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/sic-codes',
    description: 'List all unique SIC codes with company counts.',
    params: [],
    response: `{
  "data": [
    { "sicCode": "62020", "count": 28 },
    { "sicCode": "64110", "count": 15 }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/stats',
    description: 'Get aggregate statistics about available companies.',
    params: [],
    response: `{
  "totalCompanies": 500,
  "verified": 320,
  "partial": 100,
  "failed": 30,
  "unreviewed": 50,
  "uniqueIndustries": 25,
  "withWebsite": 420
}`,
  },
];

export default function DocsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">API Documentation</h1>
        <p className="text-secondary text-sm mt-1">Company Data Platform REST API v1</p>
      </div>

      {/* Authentication */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Authentication</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            All API requests must include a Bearer token in the Authorization header.
            API keys are provided by your account administrator.
          </p>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
            <p>curl -H &quot;Authorization: Bearer cdp_your_api_key_here&quot; \</p>
            <p className="ml-4">{`https://your-domain.com/api/v1/companies`}</p>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Rate Limiting</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Each API key has a configured rate limit (default: 1000 requests/minute).
            When exceeded, the API returns <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">429 Too Many Requests</code>.
          </p>
        </CardContent>
      </Card>

      {/* Client Criteria */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Client-Specific Filtering</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Your API key is linked to filter criteria set by your administrator.
            These criteria are automatically applied to all queries, ensuring you only receive
            companies that match your account&apos;s permissions. You cannot bypass these filters.
          </p>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <div className="space-y-6">
        {endpoints.map((ep) => (
          <Card key={`${ep.method} ${ep.path}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase
                  ${ep.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {ep.method}
                </span>
                <code className="text-sm font-mono font-semibold">{ep.path}</code>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-secondary">{ep.description}</p>

              {ep.params.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Parameters</h4>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left font-medium text-secondary">Name</th>
                          <th className="px-3 py-2 text-left font-medium text-secondary">Type</th>
                          <th className="px-3 py-2 text-left font-medium text-secondary">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {ep.params.map((p) => (
                          <tr key={p.name}>
                            <td className="px-3 py-2 font-mono text-xs">{p.name}</td>
                            <td className="px-3 py-2 text-secondary text-xs">{p.type}</td>
                            <td className="px-3 py-2 text-secondary text-xs">{p.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-2">Response</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono overflow-auto max-h-64">
                  {ep.response}
                </pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error Codes */}
      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Error Codes</h2>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left font-medium text-secondary">Code</th>
                <th className="px-3 py-2 text-left font-medium text-secondary">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td className="px-3 py-2 font-mono">400</td><td className="px-3 py-2">Bad request - invalid parameters</td></tr>
              <tr><td className="px-3 py-2 font-mono">401</td><td className="px-3 py-2">Unauthorized - invalid or missing API key</td></tr>
              <tr><td className="px-3 py-2 font-mono">404</td><td className="px-3 py-2">Resource not found or not accessible</td></tr>
              <tr><td className="px-3 py-2 font-mono">429</td><td className="px-3 py-2">Rate limit exceeded</td></tr>
              <tr><td className="px-3 py-2 font-mono">500</td><td className="px-3 py-2">Internal server error</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
