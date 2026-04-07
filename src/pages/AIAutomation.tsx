import { useState, useEffect } from 'react';
import {
  Sparkles, Brain, Reply, Clock, AlarmClock, CheckCircle, XCircle, AlertCircle,
  RefreshCw, Zap, ChevronDown, ChevronRight, Flame, Calendar, MoreHorizontal,
  Play, Pause, Settings, Plus, Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ── Types ──────────────────────────────────────────────────────────────────

type TabId = 'auto-responder' | 'follow-up' | 'sequence-intelligence';

type ReplyIntent = 'Interested' | 'Not Now' | 'Out of Office' | 'Referral' | 'Objection' | 'Unsubscribe';

interface ResponderRule {
  intent: ReplyIntent;
  template: string;
  delay: string;
  humanReview: boolean;
}

type SnoozeOption = '1 day' | '3 days' | '1 week';

interface FollowUpItem {
  id: string;
  name: string;
  company: string;
  suggestedTime: string;
  reason: string;
  sendingStatus: 'idle' | 'sending' | 'sent';
  snoozeOpen: boolean;
  snoozeSelected: SnoozeOption | null;
  snoozed: boolean;
  skipped: boolean;
}

interface Sequence {
  id: string;
  name: string;
  steps: number;
  aiScore: number;
  openRate: number;
  replyRate: number;
  meetingRate: number;
  optimizing: boolean;
  optimized: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────

const INTENT_COLORS: Record<ReplyIntent, string> = {
  Interested:     'badge-green',
  'Not Now':      'badge-amber',
  'Out of Office':'badge-blue',
  Referral:       'badge-purple',
  Objection:      'badge-amber',
  Unsubscribe:    'badge-red',
};

const DEFAULT_TEMPLATES: Record<ReplyIntent, string> = {
  Interested:
    "Hi {{FirstName}}, great to hear you're interested! I'd love to schedule a quick 15-minute call to learn more about your needs. Here's my calendar: [link]. Looking forward to connecting!",
  'Not Now':
    "Hi {{FirstName}}, totally understand the timing. I'll circle back in 30 days — feel free to reach out sooner if anything changes. Have a great {season}!",
  'Out of Office':
    "Thanks for the heads up, {{FirstName}}! I'll follow up when you're back. Enjoy your time away.",
  Referral:
    "Hi {{FirstName}}, thanks for the referral! I'll reach out to {{ReferralName}} directly and mention your name. Appreciate it!",
  Objection:
    "Hi {{FirstName}}, I hear you on that concern. Many of our customers had similar doubts before trying ProspectIQ. Would a quick demo address it? No pressure.",
  Unsubscribe:
    "Hi {{FirstName}}, understood — I'll remove you from our list immediately. Sorry for the interruption. Best of luck!",
};

const DELAY_OPTIONS = ['Immediately', '15 min', '1 hour', 'Next business day'];

const INTENTS: ReplyIntent[] = ['Interested', 'Not Now', 'Out of Office', 'Referral', 'Objection', 'Unsubscribe'];

const INITIAL_FOLLOW_UP: FollowUpItem[] = [
  { id:'f1', name:'Jordan Lee',     company:'Stripe', suggestedTime:'Tomorrow 9:00 AM',  reason:'Opened email 3x this week',         sendingStatus:'idle', snoozeOpen:false, snoozeSelected:null, snoozed:false, skipped:false },
  { id:'f2', name:'Emily Chen',     company:'Notion', suggestedTime:'Today 3:30 PM',     reason:'Clicked pricing link twice',         sendingStatus:'idle', snoozeOpen:false, snoozeSelected:null, snoozed:false, skipped:false },
  { id:'f3', name:'Marcus Davis',   company:'Figma',  suggestedTime:'Thu 10:00 AM',      reason:'Company announced funding',          sendingStatus:'idle', snoozeOpen:false, snoozeSelected:null, snoozed:false, skipped:false },
  { id:'f4', name:'Priya Patel',    company:'Linear', suggestedTime:'Mon 8:00 AM',       reason:'Re-engaged after 14 days',           sendingStatus:'idle', snoozeOpen:false, snoozeSelected:null, snoozed:false, skipped:false },
  { id:'f5', name:'Alex Thompson',  company:'Vercel', suggestedTime:'Wed 2:00 PM',       reason:'LinkedIn profile viewed',            sendingStatus:'idle', snoozeOpen:false, snoozeSelected:null, snoozed:false, skipped:false },
];

const INITIAL_SEQUENCES: Sequence[] = [
  { id:'s1', name:'Q2 SaaS Outreach',      steps:5, aiScore:82, openRate:24, replyRate:8,  meetingRate:3,   optimizing:false, optimized:false },
  { id:'s2', name:'VP Sales Cold Outreach', steps:7, aiScore:67, openRate:18, replyRate:5,  meetingRate:1.5, optimizing:false, optimized:false },
  { id:'s3', name:'SaaS Demo Request',      steps:4, aiScore:91, openRate:31, replyRate:12, meetingRate:4,   optimizing:false, optimized:false },
];

// ── Toggle component ──────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: value ? '#5b6ef9' : 'var(--border-2)',
        border: 'none', cursor: 'pointer', position: 'relative',
        flexShrink: 0, transition: 'background 200ms',
      }}
    >
      <span style={{
        display: 'block', width: 16, height: 16, borderRadius: 8,
        background: 'var(--surface)',
        position: 'absolute', top: 3,
        left: value ? 21 : 3,
        transition: 'left 200ms',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

// ── Section A: Auto-Responder Rules ───────────────────────────────────────

function SectionAutoResponder() {
  const { toast } = useApp();
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('auto_responder_enabled') ?? 'false'); } catch { return false; }
  });
  const [rules, setRules] = useState<ResponderRule[]>(() =>
    INTENTS.map(intent => ({
      intent,
      template: DEFAULT_TEMPLATES[intent],
      delay: 'Immediately',
      humanReview: intent === 'Interested' || intent === 'Objection',
    }))
  );

  useEffect(() => {
    localStorage.setItem('auto_responder_enabled', JSON.stringify(enabled));
  }, [enabled]);

  const updateRule = (intent: ReplyIntent, key: keyof ResponderRule, value: string | boolean) => {
    setRules(prev => prev.map(r => r.intent === intent ? { ...r, [key]: value } : r));
  };

  return (
    <div className="space-y-5">
      {/* Master toggle */}
      <div className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ background: 'var(--accent-dim)', padding: 8, borderRadius: 10 }}>
            <Reply size={16} style={{ color: '#5b6ef9' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Auto-respond to replies</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              Automatically send context-aware responses based on reply intent
            </p>
          </div>
        </div>
        <Toggle value={enabled} onChange={setEnabled} />
      </div>

      {/* Rules */}
      {enabled && (
        <div className="space-y-4">
          {rules.map(rule => (
            <div key={rule.intent} className="card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <span className={`badge ${INTENT_COLORS[rule.intent]}`}>{rule.intent}</span>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>Auto-response template</span>
              </div>

              {/* Template */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Response Template</label>
                  <button
                    className="btn-ghost"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', gap: 4 }}
                    onClick={() => toast('info', `Generating AI template for "${rule.intent}"...`)}
                  >
                    <Sparkles size={11} style={{ color: '#5b6ef9' }} />
                    AI Generate
                  </button>
                </div>
                <textarea
                  className="input-field"
                  rows={3}
                  value={rule.template}
                  onChange={e => updateRule(rule.intent, 'template', e.target.value)}
                  style={{ resize: 'vertical', fontSize: '0.8125rem' }}
                />
              </div>

              {/* Bottom row */}
              <div className="flex items-center gap-4 flex-wrap">
                {/* Delay */}
                <div className="flex items-center gap-2">
                  <Clock size={13} style={{ color: 'var(--text-3)' }} />
                  <label className="text-xs" style={{ color: 'var(--text-3)' }}>Send</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={rule.delay}
                      onChange={e => updateRule(rule.intent, 'delay', e.target.value)}
                      className="input-field text-xs"
                      style={{ padding: '0.25rem 2rem 0.25rem 0.6rem', width: 'auto' }}
                    >
                      {DELAY_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown size={11} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Human review */}
                <div className="flex items-center gap-2 ml-auto">
                  <label className="text-xs" style={{ color: 'var(--text-3)' }}>Human review before sending</label>
                  <Toggle value={rule.humanReview} onChange={v => updateRule(rule.intent, 'humanReview', v)} />
                </div>
              </div>
            </div>
          ))}

          {/* Save */}
          <div className="pt-1">
            <button
              className="btn-primary"
              onClick={() => toast('success', 'Auto-responder rules saved')}
            >
              <CheckCircle size={13} />
              Save Rules
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section B: Smart Follow-Up Engine ────────────────────────────────────

function SectionFollowUp() {
  const { toast } = useApp();
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('ai_followup_enabled') ?? 'false'); } catch { return false; }
  });
  const [items, setItems] = useState<FollowUpItem[]>(INITIAL_FOLLOW_UP);

  useEffect(() => {
    localStorage.setItem('ai_followup_enabled', JSON.stringify(enabled));
  }, [enabled]);

  const updateItem = (id: string, patch: Partial<FollowUpItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
  };

  const handleSendNow = (id: string) => {
    updateItem(id, { sendingStatus: 'sending' });
    setTimeout(() => updateItem(id, { sendingStatus: 'sent' }), 1200);
  };

  const handleSnoozeConfirm = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item?.snoozeSelected) return;
    updateItem(id, { snoozed: true, snoozeOpen: false });
    toast('success', `Snoozed for ${item.snoozeSelected}`);
  };

  const handleSkip = (id: string) => {
    updateItem(id, { skipped: true });
  };

  const visible = items.filter(i => !i.skipped && !i.snoozed);

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ background: 'var(--accent-dim)', padding: 8, borderRadius: 10 }}>
            <Brain size={16} style={{ color: '#5b6ef9' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>AI decides follow-up timing</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              Let AI optimize when to reach out for maximum reply rates
            </p>
          </div>
        </div>
        <Toggle value={enabled} onChange={setEnabled} />
      </div>

      {enabled && (
        <>
          {/* Explanation */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'var(--accent-dim)', border: '1px solid rgba(91,110,249,0.2)' }}
          >
            <Sparkles size={15} style={{ color: '#5b6ef9', marginTop: 1, flexShrink: 0 }} />
            <p className="text-xs" style={{ color: '#5b6ef9', lineHeight: 1.6 }}>
              AI analyzes open time, click patterns, and company signals to suggest the optimal follow-up window.
            </p>
          </div>

          {/* Queue table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <AlarmClock size={14} style={{ color: '#5b6ef9' }} />
                Follow-up Queue
                <span className="badge badge-blue" style={{ fontSize: '0.625rem' }}>{visible.length}</span>
              </h3>
            </div>

            {visible.length === 0 ? (
              <div className="p-10 text-center">
                <CheckCircle size={24} style={{ color: '#10b981', margin: '0 auto 8px' }} />
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>Queue is clear — you're all caught up!</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    {['Lead', 'Suggested Time', 'Reason', 'Actions'].map(h => (
                      <th key={h} className="th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map(item => (
                    <tr key={item.id} className="tr">
                      {/* Lead */}
                      <td className="td">
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-3)' }}>{item.company}</p>
                        </div>
                      </td>
                      {/* Suggested time */}
                      <td className="td">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} style={{ color: '#5b6ef9' }} />
                          <span className="text-sm" style={{ color: 'var(--text-2)' }}>{item.suggestedTime}</span>
                        </div>
                      </td>
                      {/* Reason */}
                      <td className="td">
                        <span className="text-xs" style={{ color: 'var(--text-3)' }}>{item.reason}</span>
                      </td>
                      {/* Actions */}
                      <td className="td">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Send Now */}
                          {item.sendingStatus === 'sent' ? (
                            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                              <CheckCircle size={10} /> Sent
                            </span>
                          ) : (
                            <button
                              className="btn-primary"
                              style={{ padding: '0.2rem 0.55rem', fontSize: '0.7rem' }}
                              disabled={item.sendingStatus === 'sending'}
                              onClick={() => handleSendNow(item.id)}
                            >
                              {item.sendingStatus === 'sending' ? (
                                <><RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} />Sending...</>
                              ) : (
                                <><Zap size={11} />Send Now</>
                              )}
                            </button>
                          )}

                          {/* Snooze */}
                          <div style={{ position: 'relative' }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: '0.2rem 0.55rem', fontSize: '0.7rem' }}
                              onClick={() => updateItem(item.id, { snoozeOpen: !item.snoozeOpen })}
                            >
                              <Clock size={11} />Snooze<ChevronDown size={10} />
                            </button>
                            {item.snoozeOpen && (
                              <div
                                style={{
                                  position: 'absolute', top: '110%', left: 0, zIndex: 20,
                                  background: 'var(--surface)', border: '1px solid var(--border)',
                                  borderRadius: 10, padding: '0.5rem', minWidth: 140,
                                  boxShadow: 'var(--shadow-modal)',
                                }}
                              >
                                {(['1 day', '3 days', '1 week'] as SnoozeOption[]).map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => updateItem(item.id, { snoozeSelected: opt })}
                                    style={{
                                      display: 'block', width: '100%', textAlign: 'left',
                                      padding: '0.3rem 0.5rem', borderRadius: 6, cursor: 'pointer',
                                      background: item.snoozeSelected === opt ? 'var(--accent-dim)' : 'transparent',
                                      color: item.snoozeSelected === opt ? '#5b6ef9' : 'var(--text-2)',
                                      fontSize: '0.75rem', border: 'none', fontWeight: item.snoozeSelected === opt ? 600 : 400,
                                    }}
                                  >
                                    {opt}
                                  </button>
                                ))}
                                <button
                                  className="btn-primary"
                                  style={{ marginTop: 6, width: '100%', fontSize: '0.7rem', padding: '0.25rem 0' }}
                                  onClick={() => handleSnoozeConfirm(item.id)}
                                  disabled={!item.snoozeSelected}
                                >
                                  Confirm
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Skip */}
                          <button
                            className="btn-ghost"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                            onClick={() => handleSkip(item.id)}
                          >
                            <XCircle size={11} />Skip
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Section C: Sequence Step Intelligence ────────────────────────────────

const OPTIMIZE_DIFFS = [
  'Changed step 3 delay: 2 days → 4 days',
  "Rewrote subject: 'Quick question' → 'Your Q2 pipeline, {{FirstName}}'",
  'Added LinkedIn touch after step 2',
];

function aiScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function aiScoreBadgeClass(score: number): string {
  if (score >= 80) return 'badge-green';
  if (score >= 60) return 'badge-amber';
  return 'badge-red';
}

function SectionSequenceIntelligence() {
  const { toast } = useApp();
  const [sequences, setSequences] = useState<Sequence[]>(INITIAL_SEQUENCES);

  const handleOptimize = (id: string) => {
    setSequences(prev => prev.map(s => s.id === id ? { ...s, optimizing: true } : s));
    setTimeout(() => {
      setSequences(prev => prev.map(s => s.id === id ? { ...s, optimizing: false, optimized: true } : s));
    }, 1000);
  };

  const handleAccept = (id: string) => {
    setSequences(prev => prev.map(s => s.id === id ? { ...s, optimized: false } : s));
    toast('success', 'AI optimizations applied to sequence');
  };

  const handleReject = (id: string) => {
    setSequences(prev => prev.map(s => s.id === id ? { ...s, optimized: false } : s));
    toast('info', 'Optimizations discarded');
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          AI analyzes your active sequences and suggests optimizations to improve performance.
        </p>
      </div>

      {sequences.map(seq => (
        <div key={seq.id} className="card overflow-hidden">
          <div className="p-5">
            {/* Sequence header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div style={{ background: 'var(--accent-dim)', padding: 8, borderRadius: 10 }}>
                  <Flame size={15} style={{ color: '#5b6ef9' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{seq.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{seq.steps} steps</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${aiScoreBadgeClass(seq.aiScore)}`} style={{ fontSize: '0.7rem' }}>
                  <Brain size={10} />
                  AI Score: {seq.aiScore}
                </span>
              </div>
            </div>

            {/* Predicted stats */}
            <div
              className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              {[
                { label: 'Open Rate',    value: `${seq.openRate}%`,    color: '#5b6ef9' },
                { label: 'Reply Rate',   value: `${seq.replyRate}%`,   color: '#10b981' },
                { label: 'Meeting Rate', value: `${seq.meetingRate}%`, color: '#f59e0b' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="text-xs font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p style={{ fontSize: '0.625rem', color: 'var(--text-3)', marginTop: 2 }}>Predicted {stat.label}</p>
                </div>
              ))}
            </div>

            {/* Progress bar for AI score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: '0.625rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>
                  AI Score
                </span>
                <span style={{ fontSize: '0.75rem', color: aiScoreColor(seq.aiScore), fontWeight: 700 }}>{seq.aiScore}/100</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'var(--border-2)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${seq.aiScore}%`, background: aiScoreColor(seq.aiScore), transition: 'width 600ms ease' }}
                />
              </div>
            </div>

            {/* Optimize button */}
            {!seq.optimized && (
              <button
                className="btn-primary text-xs"
                onClick={() => handleOptimize(seq.id)}
                disabled={seq.optimizing}
              >
                {seq.optimizing ? (
                  <><RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />Analyzing...</>
                ) : (
                  <><Sparkles size={12} />Optimize with AI</>
                )}
              </button>
            )}
          </div>

          {/* Diff panel */}
          {seq.optimized && (
            <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <Sparkles size={12} style={{ color: '#5b6ef9' }} />
                  AI Suggested Changes
                </p>
              </div>
              <div className="p-4 space-y-2">
                {OPTIMIZE_DIFFS.map((diff, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 rounded-lg"
                    style={{ background: 'var(--accent-dim)', border: '1px solid rgba(91,110,249,0.15)' }}
                  >
                    <ChevronRight size={13} style={{ color: '#5b6ef9', marginTop: 1, flexShrink: 0 }} />
                    <span className="text-xs" style={{ color: 'var(--text-2)', lineHeight: 1.5 }}>{diff}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 flex items-center gap-2">
                <button className="btn-primary text-xs" onClick={() => handleAccept(seq.id)}>
                  <CheckCircle size={12} />Accept
                </button>
                <button className="btn-secondary text-xs" onClick={() => handleReject(seq.id)}>
                  <XCircle size={12} />Reject
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'auto-responder',         label: 'Auto-Responder Rules',      icon: <Reply size={14} /> },
  { id: 'follow-up',              label: 'Smart Follow-Up Engine',     icon: <Brain size={14} /> },
  { id: 'sequence-intelligence',  label: 'Sequence Step Intelligence', icon: <Sparkles size={14} /> },
];

export default function AIAutomation() {
  const [activeTab, setActiveTab] = useState<TabId>('auto-responder');

  return (
    <div className="p-6 max-w-4xl animate-fade-in space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Zap size={20} style={{ color: '#5b6ef9' }} />
          AI Automation
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>
          Automate your outreach workflow with AI-powered responses, follow-ups, and sequence optimization
        </p>
      </div>

      {/* Tab bar */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', width: 'fit-content' }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.375rem 0.875rem', borderRadius: 9, fontSize: '0.8125rem', fontWeight: 500,
              cursor: 'pointer', border: 'none', transition: 'all 150ms',
              background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text)' : 'var(--text-3)',
              boxShadow: activeTab === tab.id ? 'var(--shadow-card)' : 'none',
            }}
          >
            <span style={{ color: activeTab === tab.id ? '#5b6ef9' : 'var(--text-3)' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'auto-responder'        && <SectionAutoResponder />}
      {activeTab === 'follow-up'             && <SectionFollowUp />}
      {activeTab === 'sequence-intelligence' && <SectionSequenceIntelligence />}
    </div>
  );
}
