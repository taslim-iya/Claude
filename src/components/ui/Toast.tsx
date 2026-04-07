import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const configs = {
  success: { icon: CheckCircle,   bar: '#10b981', bg: 'rgba(16,185,129,0.08)'  },
  error:   { icon: AlertCircle,   bar: '#ef4444', bg: 'rgba(239,68,68,0.08)'   },
  warning: { icon: AlertTriangle, bar: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
  info:    { icon: Info,          bar: '#5b6ef9', bg: 'rgba(91,110,249,0.08)'  },
};

export default function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const { icon: Icon, bar, bg } = configs[t.type];
        return (
          <div key={t.id} className="flex items-center gap-3 pr-3 pl-0 py-3 rounded-xl animate-toast-in pointer-events-auto overflow-hidden"
            style={{ minWidth: 300, maxWidth: 420, background: 'var(--modal-bg)', border: '1px solid var(--border-2)', boxShadow: 'var(--shadow-modal)' }}>
            <div className="w-1 self-stretch rounded-r flex-shrink-0" style={{ background: bar, marginLeft: 0 }} />
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: bg }}>
              <Icon size={14} style={{ color: bar }} />
            </div>
            <p className="flex-1 text-sm font-medium" style={{ color: 'var(--text)' }}>{t.message}</p>
            <button onClick={() => dismissToast(t.id)}
              className="w-5 h-5 flex items-center justify-center rounded flex-shrink-0"
              style={{ color: 'var(--text-3)' }}>
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
