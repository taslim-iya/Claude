import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, ChevronRight, Copy, RotateCcw, Wand2, Scissors, TrendingUp, Globe } from 'lucide-react';

type Mode = 'write_email' | 'improve_subject' | 'shorten' | 'persuasive' | 'translate';

const MODES: { id: Mode; label: string; icon: typeof Wand2 }[] = [
  { id: 'write_email',      label: 'Write Email',        icon: Sparkles },
  { id: 'improve_subject',  label: 'Improve Subject',    icon: TrendingUp },
  { id: 'shorten',          label: 'Shorten',            icon: Scissors },
  { id: 'persuasive',       label: 'Make Persuasive',    icon: Wand2 },
  { id: 'translate',        label: 'Translate',          icon: Globe },
];

const OUTPUTS: Record<Mode, string[]> = {
  write_email: [
    "Hi {{FirstName}},\n\nI came across {{Company}} and noticed you're expanding your sales team. ProspectIQ has helped similar companies increase reply rates by 3x.\n\nWould you have 15 minutes this week?\n\nBest,\nSarah",
    "Hi {{FirstName}}, quick question — are you currently using any tools to automate your prospecting? We've helped {{Company}}-sized teams book 40% more meetings. Worth a chat?\n\nSarah",
  ],
  improve_subject: [
    "Your Q2 pipeline, {{FirstName}} — let's talk",
    "Quick question about {{Company}}'s growth",
    "3x more replies — how {{Company}} peers do it",
  ],
  shorten: [
    "Hi {{FirstName}} — ProspectIQ triples reply rates for teams like yours at {{Company}}. 15 min this week?\n\nSarah",
    "{{FirstName}} — quick ask. ProspectIQ → 3x replies. 15-min call? Yes/no works.\nSarah",
  ],
  persuasive: [
    "Hi {{FirstName}},\n\nI'll be direct: companies not using AI prospecting are leaving serious revenue behind. Our clients average $180K in new pipeline in Q1 alone.\n\nCould we have a 15-minute conversation?\n\nSarah",
    "Hi {{FirstName}},\n\nWhile {{Company}}'s competitors are closing deals with AI-assisted outreach, manual prospecting is costing you time and money. Let's fix that.\n\nSarah",
  ],
  translate: [
    "Hola {{FirstName}},\n\nMe pongo en contacto porque ProspectIQ ha ayudado a empresas como {{Company}} a triplicar sus tasas de respuesta.\n\n¿Tiene 15 minutos esta semana?\n\nSaludos,\nSarah",
    "Bonjour {{FirstName}},\n\nJe vous contacte car ProspectIQ a aidé des entreprises comme {{Company}} à tripler leur taux de réponse.\n\nDisponible 15 minutes cette semaine?\n\nCordialement,\nSarah",
  ],
};

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('write_email');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState(0);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const generate = () => {
    setLoading(true);
    setOutput('');
    setTimeout(() => {
      const variants = OUTPUTS[mode];
      setOutput(variants[variant % variants.length]);
      setLoading(false);
    }, 900);
  };

  const regenerate = () => {
    setVariant(v => v + 1);
    const variants = OUTPUTS[mode];
    setOutput(variants[(variant + 1) % variants.length]);
  };

  const copy = () => {
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
        style={{ background: 'linear-gradient(135deg,#5b6ef9,#8b5cf6)', color: '#fff' }}
        title="AI Copywriting Assistant">
        <Sparkles size={20} />
      </button>

      {/* Slide-over panel */}
      {open && (
        <div ref={panelRef}
          className="fixed bottom-20 right-6 z-50 w-80 rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: '#5b6ef9' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>AI Copywriting</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: 'var(--text-3)' }}>
              <X size={15} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Quick action chips */}
            <div className="flex flex-wrap gap-1.5">
              {MODES.map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.id} onClick={() => { setMode(m.id); setOutput(''); }}
                    className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors"
                    style={{
                      background: mode === m.id ? 'rgba(91,110,249,0.2)' : 'var(--surface-2)',
                      color: mode === m.id ? '#5b6ef9' : 'var(--text-2)',
                      border: mode === m.id ? '1px solid rgba(91,110,249,0.3)' : '1px solid var(--border)',
                    }}>
                    <Icon size={10} />{m.label}
                  </button>
                );
              })}
            </div>

            {/* Input */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-3)' }}>
                {mode === 'write_email' ? 'What do you need?' : mode === 'improve_subject' ? 'Paste subject line' : mode === 'translate' ? 'Paste text to translate' : 'Paste text to improve'}
              </label>
              <textarea rows={3} value={input} onChange={e => setInput(e.target.value)}
                placeholder={
                  mode === 'write_email' ? 'e.g. cold email to VP Sales at SaaS company about ProspectIQ...' :
                  mode === 'improve_subject' ? 'e.g. Quick question' :
                  mode === 'translate' ? 'Paste text to translate to Spanish/French...' :
                  'Paste your text here...'
                }
                className="w-full px-3 py-2 text-xs rounded-lg outline-none resize-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>

            <button onClick={generate} disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-lg"
              style={{ background: '#5b6ef9', color: '#fff', opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <><span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>
              ) : (
                <><Sparkles size={12} />Generate</>
              )}
            </button>

            {/* Output */}
            {output && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-3)' }}>Result</label>
                  <div className="flex items-center gap-1.5">
                    <button onClick={regenerate}
                      className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                      <RotateCcw size={9} />Regenerate
                    </button>
                    <button onClick={copy}
                      className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded"
                      style={{ background: copied ? 'rgba(16,185,129,0.15)' : 'var(--surface-2)', color: copied ? '#10b981' : 'var(--text-2)' }}>
                      <Copy size={9} />{copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <textarea rows={5} value={output} onChange={e => setOutput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg outline-none resize-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)' }} />
                <p className="text-right text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>
                  {output.length} chars
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
