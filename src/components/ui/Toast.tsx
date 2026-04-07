import { useApp } from '../../context/AppContext';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const cfg = {
  success: { icon: CheckCircle, bar: 'bg-emerald-500', iconCls: 'text-emerald-400' },
  error:   { icon: XCircle,     bar: 'bg-red-500',     iconCls: 'text-red-400' },
  warning: { icon: AlertTriangle, bar: 'bg-amber-500', iconCls: 'text-amber-400' },
  info:    { icon: Info,         bar: 'bg-blue-500',   iconCls: 'text-blue-400' },
};

export default function Toasts() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-80">
      {toasts.map(t => {
        const { icon: Icon, bar, iconCls } = cfg[t.type];
        return (
          <div key={t.id} className="animate-toast-in flex items-start gap-3 bg-[#161616] border border-[#2a2a2a] rounded-xl p-3.5 shadow-modal overflow-hidden relative">
            <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${bar}`} />
            <Icon size={15} className={`${iconCls} flex-shrink-0 mt-0.5`} />
            <p className="text-sm text-white flex-1 leading-relaxed">{t.message}</p>
            <button onClick={() => dismissToast(t.id)} className="text-[#52525b] hover:text-white transition-colors flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
