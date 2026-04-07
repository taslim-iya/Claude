import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean; onClose(): void; title: string; children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl'; footer?: React.ReactNode;
}
export default function Modal({ open, onClose, title, children, size = 'md', footer }: Props) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 animate-fade-in" />
      <div className={`relative w-full ${widths[size]} bg-[#111] border border-[#2a2a2a] rounded-2xl shadow-modal animate-scale-in flex flex-col max-h-[90vh]`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] flex-shrink-0">
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-[#52525b] hover:text-white transition-colors"><X size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#1a1a1a] flex-shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
