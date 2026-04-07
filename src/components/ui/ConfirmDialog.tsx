import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface Props {
  open: boolean;
  onClose(): void;
  onConfirm(): void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
  variant?: 'danger' | 'confirm';
}

export default function ConfirmDialog({
  open, onClose, onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  danger = true,
  variant,
}: Props) {
  const isDanger = danger || variant === 'danger';
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex gap-3 p-3 rounded-lg" style={{ background: isDanger ? 'rgba(239,68,68,0.08)' : 'rgba(91,110,249,0.08)' }}>
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: isDanger ? '#ef4444' : '#5b6ef9' }} />
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>{message}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg"
            style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 text-sm font-semibold rounded-lg"
            style={{ background: isDanger ? '#ef4444' : '#5b6ef9', color: 'var(--text)' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
