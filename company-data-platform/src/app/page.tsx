import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-2xl mx-auto px-6">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4">
          Company Data Platform
        </h1>
        <p className="text-lg text-secondary mb-8 max-w-lg mx-auto">
          Upload, enrich, verify, and distribute company data through
          client-specific API access with configurable filtering criteria.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white px-6 py-3 font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-foreground border border-border px-6 py-3 font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 text-left">
          <div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Upload &amp; Map</h3>
            <p className="text-sm text-secondary">Import CSV/Excel files with intelligent column mapping and duplicate detection.</p>
          </div>
          <div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Enrich &amp; Verify</h3>
            <p className="text-sm text-secondary">Automated enrichment pipeline with website checks and confidence scoring.</p>
          </div>
          <div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Secure API Access</h3>
            <p className="text-sm text-secondary">Client-specific API keys with criteria-based filtering and rate limiting.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
