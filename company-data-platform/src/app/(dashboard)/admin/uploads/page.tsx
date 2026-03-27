'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';

interface FilePreview {
  headers: string[];
  sampleRows: Record<string, string>[];
  totalRows: number;
  schemaFields: string[];
}

export default function UploadsPage() {
  const [uploads, setUploads] = useState<Array<{
    id: string; fileName: string; fileType: string; totalRows: number | null;
    importedRows: number | null; duplicatesFound: number | null; status: string;
    createdAt: string; user: { name: string }; _count: { companies: number };
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number; duplicatesSkipped: number; errors: { row: number; error: string }[];
  } | null>(null);

  const fetchUploads = useCallback(async () => {
    const res = await fetch('/api/admin/uploads');
    if (res.ok) {
      const data = await res.json();
      setUploads(data.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUploads(); }, [fetchUploads]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', f);
    formData.append('action', 'preview');

    setUploading(true);
    const res = await fetch('/api/admin/uploads', { method: 'POST', body: formData });
    if (res.ok) {
      const data: FilePreview = await res.json();
      setPreview(data);
      // Auto-map matching column names
      const autoMapping: Record<string, string> = {};
      for (const header of data.headers) {
        const normalized = header.toLowerCase().replace(/[_\s-]/g, '');
        const match = data.schemaFields.find(
          (f) => f.toLowerCase() === normalized ||
          f.toLowerCase().replace(/[_\s-]/g, '') === normalized
        );
        if (match) autoMapping[header] = match;
      }
      setMapping(autoMapping);
    }
    setUploading(false);
  };

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    formData.append('action', 'import');

    const res = await fetch('/api/admin/uploads', { method: 'POST', body: formData });
    if (res.ok) {
      const data = await res.json();
      setImportResult(data);
      setPreview(null);
      setFile(null);
      fetchUploads();
    }
    setUploading(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Upload Companies</h1>
        <p className="text-secondary text-sm mt-1">Import company data from CSV or Excel files</p>
      </div>

      {/* Upload Area */}
      <Card className="mb-6">
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-secondary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-4 text-sm text-secondary">
              <label className="text-primary hover:underline cursor-pointer">
                Choose a file
                <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} />
              </label>
              {' '}or drag and drop
            </p>
            <p className="text-xs text-secondary mt-1">CSV, XLS, XLSX up to 50MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Preview & Mapping */}
      {preview && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Column Mapping</h2>
                <p className="text-sm text-secondary">{preview.totalRows} rows found in {file?.name}</p>
              </div>
              <Button onClick={handleImport} loading={uploading} disabled={!mapping || Object.keys(mapping).length === 0}>
                Import {preview.totalRows} Records
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {preview.headers.map((header) => (
                <div key={header} className="flex items-center gap-4">
                  <span className="w-48 text-sm font-medium truncate" title={header}>{header}</span>
                  <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <Select
                    value={mapping[header] || ''}
                    onChange={(e) => setMapping(m => ({ ...m, [header]: e.target.value }))}
                    options={[
                      { value: '', label: '-- Skip --' },
                      ...preview.schemaFields.map(f => ({ value: f, label: f })),
                    ]}
                    className="w-56"
                  />
                  {preview.sampleRows[0] && (
                    <span className="text-xs text-secondary truncate max-w-xs">
                      e.g. &quot;{preview.sampleRows[0][header]}&quot;
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Preview</h3>
              <div className="overflow-x-auto rounded border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      {preview.headers.map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-secondary">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preview.sampleRows.map((row, i) => (
                      <tr key={i}>
                        {preview.headers.map(h => (
                          <td key={h} className="px-3 py-2 truncate max-w-xs">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Result */}
      {importResult && (
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-green-700">Import Complete</h3>
                <p className="text-sm text-secondary mt-1">
                  {importResult.imported} imported, {importResult.duplicatesSkipped} duplicates skipped, {importResult.errors.length} errors
                </p>
              </div>
            </div>
            {importResult.errors.length > 0 && (
              <div className="mt-4 max-h-48 overflow-y-auto">
                {importResult.errors.slice(0, 20).map((e, i) => (
                  <p key={i} className="text-xs text-danger">Row {e.row}: {e.error}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload History */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Upload History</h2>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-secondary">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-secondary">File</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">Uploaded By</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">Total Rows</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">Imported</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">Duplicates</th>
                  <th className="px-4 py-3 text-center font-medium text-secondary">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-secondary">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {uploads.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.fileName}</td>
                    <td className="px-4 py-3 text-secondary">{u.user.name}</td>
                    <td className="px-4 py-3 text-center">{u.totalRows ?? '-'}</td>
                    <td className="px-4 py-3 text-center">{u.importedRows ?? '-'}</td>
                    <td className="px-4 py-3 text-center">{u.duplicatesFound ?? '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={u.status === 'completed' ? 'success' : u.status === 'completed_with_errors' ? 'warning' : 'default'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
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
