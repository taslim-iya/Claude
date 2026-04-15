import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { Sparkles, RefreshCw } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose(): void;
  onInsert(text: string): void;
  leadName?: string;
  leadCompany?: string;
  leadTitle?: string;
  lastActivity?: string;
}

type ToneId  = 0 | 1 | 2 | 3;      // Professional | Friendly | Direct | Persuasive
type GoalId  = 0 | 1 | 2 | 3 | 4;  // First Touch | Follow Up | Break-Up | Meeting Request | Proposal

const TONES  = ['Professional', 'Friendly', 'Direct', 'Persuasive'] as const;
const GOALS  = ['First Touch', 'Follow Up', 'Break-Up', 'Meeting Request', 'Proposal'] as const;

// ── Message templates ─────────────────────────────────────────────────────────
// Indexed as TEMPLATES[toneIndex][variantIndex], where variant cycles 0-5.
// Goals are baked into variants deterministically via (goalIndex + variant) % 6.

const TEMPLATES: string[][] = [
  // ── Professional (tone 0) ──────────────────────────────────────────────────
  [
    // variant 0 — First Touch
    `Hi {{FirstName}},\n\nI came across {{Company}} and was impressed by your work in the space. I'm reaching out because ProspectIQ has helped similar companies increase their reply rates by 3x.\n\nWould you have 15 minutes this week for a quick intro call?\n\nBest,\nSarah`,
    // variant 1 — Follow Up
    `Hi {{FirstName}},\n\nJust circling back on my previous note. I know things get busy — I wanted to make sure this didn't slip through the cracks.\n\nWould a quick 15-minute call work this week?\n\nBest,\nSarah`,
    // variant 2 — Break-Up
    `Hi {{FirstName}},\n\nI've reached out a few times and haven't heard back. I'll take this as my last note — but if the timing changes, I'd love to connect.\n\nWishing you and the team at {{Company}} all the best.\n\nSarah`,
    // variant 3 — Meeting Request
    `Hi {{FirstName}},\n\nBased on our conversation, I'd like to schedule a formal demo. Here's a link to book a 30-minute slot that works for you: [calendar link]\n\nLooking forward to it.\n\nBest,\nSarah`,
    // variant 4 — Proposal
    `Hi {{FirstName}},\n\nI've put together a tailored proposal for {{Company}} based on your requirements. Key highlights:\n\n• Custom onboarding for your team\n• Dedicated account manager\n• 30-day free trial\n\nCan we review it together this week?\n\nBest,\nSarah`,
    // variant 5 — alt First Touch
    `Hi {{FirstName}},\n\nI noticed {{Company}} is scaling rapidly — congratulations on the momentum. I help companies at your stage remove the manual overhead from outbound prospecting.\n\nWould a brief 20-minute conversation be worthwhile this week?\n\nBest,\nSarah`,
  ],

  // ── Friendly (tone 1) ──────────────────────────────────────────────────────
  [
    // variant 0 — First Touch
    `Hey {{FirstName}}! 👋\n\nI spotted {{Company}} doing some exciting things and had to reach out. We help sales teams like yours find and close deals faster with AI-powered prospecting.\n\nWould love to chat! Got 15 minutes this week?\n\nCheers,\nSarah`,
    // variant 1 — Follow Up
    `Hey {{FirstName}}!\n\nI sent a note last week and didn't want it to get buried in your inbox. No pressure at all — just curious if there's a fit!\n\nEven a quick "not right now" works — I promise I won't take it personally 😄\n\nCheers,\nSarah`,
    // variant 2 — Break-Up
    `Hey {{FirstName}},\n\nI've tried reaching out a couple of times and totally understand if the timing isn't right. I'll stop cluttering your inbox — for now! 😊\n\nBest of luck to you and everyone at {{Company}}. Feel free to reach out whenever the time is right.\n\nWarmly,\nSarah`,
    // variant 3 — Meeting Request
    `Hey {{FirstName}}!\n\nReally enjoyed our last chat — would love to keep the momentum going with a proper demo. I have a few slots open this week; here's my calendar: [calendar link]\n\nPick whatever works best!\n\nCheers,\nSarah`,
    // variant 4 — Proposal
    `Hey {{FirstName}}!\n\nExcited to share — I put together a custom proposal just for {{Company}}. I think you're going to love the onboarding plan.\n\nGot 20 minutes to walk through it together? I'm flexible all week!\n\nCheers,\nSarah`,
    // variant 5 — alt First Touch
    `Hey {{FirstName}} 👋\n\nQuick one — I came across {{Company}} and honestly, the product you all are building is really cool. I wanted to see if there's any overlap with what we do at ProspectIQ.\n\nCoffee chat? 15 minutes, promise.\n\nCheers,\nSarah`,
  ],

  // ── Direct (tone 2) ────────────────────────────────────────────────────────
  [
    // variant 0 — First Touch
    `{{FirstName}} — quick ask.\n\nDoes ProspectIQ's AI-powered outreach platform make sense for {{Company}}? 3 clients similar to you saw 40% more pipeline in 60 days.\n\n15-min call this week? Yes or no works.\n\nSarah`,
    // variant 1 — Follow Up
    `{{FirstName}},\n\nFollowing up. Still think there's a fit here.\n\nOpen to a 15-min call this week?\n\nSarah`,
    // variant 2 — Break-Up
    `{{FirstName}},\n\nLast message from me. If the timing isn't right, no hard feelings.\n\nReach out when it makes sense for {{Company}}.\n\nSarah`,
    // variant 3 — Meeting Request
    `{{FirstName}},\n\nReady to move forward. Here's a link to book a 30-min demo: [calendar link]\n\nPick a slot. Let's get it on the calendar.\n\nSarah`,
    // variant 4 — Proposal
    `{{FirstName}},\n\nProposal is ready. Tailored specifically for {{Company}}.\n\nTwo highlights: dedicated onboarding + 30-day trial at no cost.\n\nFree for 20 minutes this week to review?\n\nSarah`,
    // variant 5 — alt First Touch
    `{{FirstName}} — straight to it.\n\nProspectIQ cuts prospecting time by 60%. {{Company}} is exactly the type of team we help.\n\nCall this week?\n\nSarah`,
  ],

  // ── Persuasive (tone 3) ────────────────────────────────────────────────────
  [
    // variant 0 — First Touch
    `Hi {{FirstName}},\n\nI'll be direct: companies like {{Company}} that don't automate prospecting are leaving significant revenue on the table. Our clients averaged $180K in new pipeline in their first quarter.\n\nCould we have a 15-minute conversation about your current process?\n\nBest,\nSarah`,
    // variant 1 — Follow Up
    `Hi {{FirstName}},\n\nI reached out last week about a way {{Company}} could unlock more pipeline with less effort. Given the current market pressure on sales teams, I think the timing has never been better.\n\nWorth a 15-minute conversation?\n\nBest,\nSarah`,
    // variant 2 — Break-Up
    `Hi {{FirstName}},\n\nI've sent a few notes without a reply, so I won't keep pushing. But I'd be remiss if I didn't say: the companies that invest in smarter prospecting right now will have a real advantage heading into next year.\n\nWhenever {{Company}} is ready to explore that, I'm here.\n\nBest,\nSarah`,
    // variant 3 — Meeting Request
    `Hi {{FirstName}},\n\nBased on what you've shared, I'm confident we can move the needle significantly for {{Company}}. I've reserved a demo slot that walks through exactly how — here's the link: [calendar link]\n\nI'd strongly encourage grabbing it before the week fills up.\n\nBest,\nSarah`,
    // variant 4 — Proposal
    `Hi {{FirstName}},\n\nThe proposal I've built for {{Company}} is unlike anything I've put together before — because your use case is genuinely compelling. The ROI projections alone are worth 20 minutes of your time.\n\nCan we review it together this week?\n\nBest,\nSarah`,
    // variant 5 — alt First Touch
    `Hi {{FirstName}},\n\nIn the last 90 days, three companies in {{Company}}'s space signed with us and collectively added $540K in new pipeline. I'd hate for that momentum to pass you by.\n\nDoes a 15-minute intro call make sense?\n\nBest,\nSarah`,
  ],
];

// ── Helper ────────────────────────────────────────────────────────────────────

function resolveTemplate(
  toneIdx: ToneId,
  goalIdx: GoalId,
  variantOffset: number,
  leadName?: string,
  leadCompany?: string,
): string {
  const variantIdx = (goalIdx + variantOffset) % 6;
  let text = TEMPLATES[toneIdx][variantIdx];
  text = text.replace(/\{\{FirstName\}\}/g, leadName || 'there');
  text = text.replace(/\{\{Company\}\}/g, leadCompany || 'your company');
  return text;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AIComposeModal({
  open,
  onClose,
  onInsert,
  leadName,
  leadCompany,
  leadTitle,
  lastActivity,
}: Props) {
  const [tone, setTone]           = useState<ToneId>(0);
  const [goal, setGoal]           = useState<GoalId>(0);
  const [context, setContext]     = useState('');
  const [message, setMessage]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [variant, setVariant]     = useState(0);
  const [generated, setGenerated] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-build context whenever lead props change
  useEffect(() => {
    setContext(
      `Hi ${leadName || 'there'} at ${leadCompany || 'your company'} (${leadTitle || 'decision maker'}). Last activity: ${lastActivity || 'none'}.`
    );
  }, [leadName, leadCompany, leadTitle, lastActivity]);

  // Clear state on open
  useEffect(() => {
    if (open) {
      setTone(0);
      setGoal(0);
      setVariant(0);
      setMessage('');
      setGenerated(false);
      setLoading(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open]);

  const generate = (newVariant: number) => {
    setLoading(true);
    setGenerated(false);
    timerRef.current = setTimeout(() => {
      const text = resolveTemplate(tone, goal, newVariant, leadName, leadCompany);
      setMessage(text);
      setLoading(false);
      setGenerated(true);
    }, 800);
  };

  const handleGenerate = () => {
    setVariant(0);
    generate(0);
  };

  const handleRegenerate = () => {
    const next = (variant + 1) % 6;
    setVariant(next);
    generate(next);
  };

  const charCount = message.length;

  // ── Button shared styles ────────────────────────────────────────────────────
  const pillButton = (active: boolean) => ({
    background: active ? '#5b6ef9' : 'var(--surface-2)',
    color:      active ? '#ffffff' : 'var(--text-2)',
    border:     active ? '1px solid #5b6ef9' : '1px solid var(--border)',
  });

  return (
    <Modal open={open} onClose={onClose} title="AI Compose" size="md">
      <div className="space-y-5">

        {/* Tone selector */}
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Tone</p>
          <div className="flex gap-2 flex-wrap">
            {TONES.map((t, i) => (
              <button
                key={t}
                onClick={() => { setTone(i as ToneId); setGenerated(false); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={pillButton(tone === i)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Goal selector */}
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Goal</p>
          <div className="flex gap-2 flex-wrap">
            {GOALS.map((g, i) => (
              <button
                key={g}
                onClick={() => { setGoal(i as GoalId); setGenerated(false); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={pillButton(goal === i)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Context field */}
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Context</p>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            rows={2}
            className="w-full rounded-lg px-3 py-2.5 text-xs resize-none leading-relaxed"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              outline: 'none',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#5b6ef9'; }}
            onBlur={e  => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 w-full justify-center py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: loading ? 'rgba(91,110,249,0.5)' : '#5b6ef9',
            color: '#ffffff',
            opacity: loading ? 0.8 : 1,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading
            ? <><RefreshCw size={14} className="animate-spin" /> Generating…</>
            : <><Sparkles size={14} /> Generate Message</>
          }
        </button>

        {/* Generated message area */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>
              Generated Message
              {generated && (
                <span className="ml-2 font-normal text-[10px]" style={{ color: 'var(--text-3)' }}>
                  Variant {variant + 1} of 6
                </span>
              )}
            </p>
            {generated && (
              <button
                onClick={handleRegenerate}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--text-2)',
                  border: '1px solid var(--border)',
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                <RefreshCw size={11} />
                Regenerate
              </button>
            )}
          </div>
          <div className="relative">
            <textarea
              value={loading ? '' : message}
              onChange={e => setMessage(e.target.value)}
              rows={10}
              placeholder={loading ? '' : 'Click "Generate Message" to create an AI-written email…'}
              className="w-full rounded-lg px-3 py-2.5 text-xs resize-y leading-relaxed"
              style={{
                background: loading ? 'var(--surface-3)' : 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                outline: 'none',
                minHeight: '180px',
              }}
              onFocus={e  => { e.currentTarget.style.borderColor = '#5b6ef9'; }}
              onBlur={e   => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg"
                style={{ background: 'var(--surface-3)' }}>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: '#5b6ef9',
                          animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>Generating…</p>
                </div>
              </div>
            )}
          </div>
          {generated && !loading && (
            <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-3)' }}>
              {charCount} characters
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
          >
            Cancel
          </button>
          <button
            onClick={() => { if (generated && message) { onInsert(message); onClose(); } }}
            disabled={!generated || loading || !message}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: generated && message && !loading ? '#5b6ef9' : 'var(--surface-3)',
              color: generated && message && !loading ? '#ffffff' : 'var(--text-3)',
              border: `1px solid ${generated && message && !loading ? '#5b6ef9' : 'var(--border)'}`,
              cursor: generated && message && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            <Sparkles size={12} />
            Insert into Compose
          </button>
        </div>
      </div>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </Modal>
  );
}
