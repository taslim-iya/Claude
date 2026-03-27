type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}

export function VerificationBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    VERIFIED: 'success',
    PARTIAL: 'warning',
    FAILED: 'danger',
    UNREVIEWED: 'default',
    PENDING_ENRICHMENT: 'info',
  };
  return <Badge variant={map[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
}
