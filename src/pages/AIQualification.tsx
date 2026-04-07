import { useState } from 'react';
import {
  UserCheck, Brain, CheckCircle, XCircle, Clock, AlertCircle, ChevronRight, Plus,
  Trash2, Zap, TrendingUp, ArrowRight, Filter, MoreHorizontal, Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ── Types ──────────────────────────────────────────────────────────────────

type QualStatus = 'QUALIFIED' | 'DISQUALIFIED' | 'NEEDS_REVIEW';
type FilterTab = 'All' | 'Qualified' | 'Disqualified' | 'Needs Review';

interface QualRule {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic?: 'AND' | 'OR';
}

interface QualEvent {
  id: string;
  name: string;
  company: string;
  status: QualStatus;
  score: number;
  reason: string;
  timestamp: string;
}

interface StageTransition {
  from: string;
  to: string;
  trigger: string;
}

interface StageHistoryRow {
  lead: string;
  from: string;
  to: string;
  time: string;
  triggered: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const FIELD_OPTS = [
  'Lead Score', 'Emails Opened', 'Emails Clicked', 'Title',
  'Company Size', 'Industry', 'Replied', 'Unsubscribed', 'Bounced',
];

const OP_OPTS = ['>', '<', '=', 'contains', 'not contains'];

const DEFAULT_QUALIFY_RULES: QualRule[] = [
  { id: 'q1', field: 'Lead Score',    operator: '>',        value: '70',                    logic: 'AND' },
  { id: 'q2', field: 'Emails Opened', operator: '>',        value: '2',                     logic: 'AND' },
  { id: 'q3', field: 'Title',         operator: 'contains', value: 'VP|Director|Head' },
];

const DEFAULT_DISQUALIFY_RULES: QualRule[] = [
  { id: 'd1', field: 'Bounced',      operator: '=',        value: 'true',           logic: 'OR' },
  { id: 'd2', field: 'Unsubscribed', operator: '=',        value: 'true',           logic: 'OR' },
  { id: 'd3', field: 'Replied',      operator: 'contains', value: 'not_interested' },
];

const QUAL_EVENTS: QualEvent[] = [
  { id: 'e1', name: 'Sarah Chen',    company: 'Stripe',  status: 'QUALIFIED',    score: 84, reason: "Opened 4 emails, replied 'interested in learning more'",        timestamp: '2 min ago' },
  { id: 'e2', name: 'James Park',    company: 'WeWork',  status: 'DISQUALIFIED', score: 12, reason: "Replied 'not the right time, remove me'",                        timestamp: '15 min ago' },
  { id: 'e3', name: 'Maya Patel',    company: 'Shopify', status: 'QUALIFIED',    score: 91, reason: 'Clicked pricing page 3x, title matches VP pattern',              timestamp: '1h ago' },
  { id: 'e4', name: 'Tom Richards',  company: 'HubSpot', status: 'NEEDS_REVIEW', score: 58, reason: 'Mixed signals: opened but no clicks',                            timestamp: '2h ago' },
  { id: 'e5', name: 'Lisa Wang',     company: 'Notion',  status: 'QUALIFIED',    score: 76, reason: 'Booked a discovery call via Calendly',                           timestamp: '3h ago' },
  { id: 'e6', name: 'Chris Davis',   company: 'Slack',   status: 'DISQUALIFIED', score: 5,  reason: "Replied 'unsubscribe'",                                          timestamp: '5h ago' },
  { id: 'e7', name: 'Ana Müller',    company: 'SAP',     status: 'NEEDS_REVIEW', score: 62, reason: 'Long company size mismatch',                                     timestamp: '1d ago' },
  { id: 'e8', name: 'Kevin Lee',     company: 'Zoom',    status: 'QUALIFIED',    score: 88, reason: 'Replied with detailed questions',                                timestamp: '1d ago' },
];

const STAGE_TRANSITIONS: StageTransition[] = [
  { from: 'New',           to: 'Contacted',     trigger: 'Sent first email' },
  { from: 'Contacted',     to: 'Engaged',        trigger: 'Opened or clicked any email' },
  { from: 'Engaged',       to: 'Qualified',      trigger: 'AI score threshold ≥ 70 met' },
  { from: 'Qualified',     to: 'Meeting Booked', trigger: 'Calendly link clicked or replied with meeting request' },
  { from: 'Meeting Booked',to: 'Closed Won',     trigger: 'Marked as won manually' },
  { from: 'Meeting Booked',to: 'Closed Lost',    trigger: 'No response for 30 days or marked lost' },
];

const STAGE_HISTORY: StageHistoryRow[] = [
  { lead: 'Jordan Lee',    from: 'New',            to: 'Contacted',     time: '5 min ago',   triggered: 'First email sent' },
  { lead: 'Emily Chen',    from: 'Contacted',      to: 'Engaged',       time: '2h ago',      triggered: 'Opened email' },
  { lead: 'Marcus Davis',  from: 'Engaged',        to: 'Qualified',     time: 'Yesterday',   triggered: 'Score reached 74' },
  { lead: 'Priya Patel',   from: 'Qualified',      to: 'Meeting Booked',time: '2 days ago',  triggered: 'Calendly booked' },
  { lead: 'Alex Thompson', from: 'Meeting Booked', to: 'Closed Won',    time: '3 days ago',  triggered: 'Manual' },
];

const PIPELINE_STAGES = ['New', 'Contacted', 'Engaged', 'Qualified', 'Meeting Booked', 'Closed Won', 'Closed Lost'];

// ── Toggle ────────────────────────────────────────────────────────────────

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

// ── Rule Builder ──────────────────────────────────────────────────────────

function RuleBuilder({
  rules,
  onUpdate,
  onAdd,
  onDelete,
  thenLabel,
  thenColor,
}: {
  rules: QualRule[];
  onUpdate: (id: string, key: keyof QualRule, value: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  thenLabel: string;
  thenColor: string;
}) {
  return (
    <div className="space-y-2">
      {rules.map((rule, index) => (
        <div
          key={rule.id}
          className="flex items-center gap-2 flex-wrap p-3 rounded-xl"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          {/* Logic connector */}
          {index > 0 && rule.logic && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: 'var(--surface-3)', color: 'var(--text-3)', flexShrink: 0 }}
            >
              {rule.logic}
            </span>
          )}
          {index === 0 && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: 'var(--accent-dim)', color: '#5b6ef9', flexShrink: 0 }}
            >
              IF
            </span>
          )}

          {/* Field */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select
              value={rule.field}
              onChange={e => onUpdate(rule.id, 'field', e.target.value)}
              className="input-field text-xs"
              style={{ padding: '0.25rem 0.5rem', width: 140 }}
            >
              {FIELD_OPTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Operator */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select
              value={rule.operator}
              onChange={e => onUpdate(rule.id, 'operator', e.target.value)}
              className="input-field text-xs"
              style={{ padding: '0.25rem 0.5rem', width: 110 }}
            >
              {OP_OPTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Value */}
          <input
            value={rule.value}
            onChange={e => onUpdate(rule.id, 'value', e.target.value)}
            className="input-field text-xs"
            style={{ padding: '0.25rem 0.5rem', width: 150, flexShrink: 0 }}
            placeholder="value..."
          />

          {/* THEN */}
          {index === rules.length - 1 && (
            <>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-3)', flexShrink: 0 }}>→ THEN</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ background: thenColor === 'green' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                         color: thenColor === 'green' ? '#10b981' : '#ef4444', flexShrink: 0 }}
              >
                {thenLabel}
              </span>
            </>
          )}

          {/* Delete */}
          <button onClick={() => onDelete(rule.id)} className="btn-ghost p-1 ml-auto" style={{ flexShrink: 0 }}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      <button className="btn-ghost text-xs" style={{ padding: '0.25rem 0.5rem' }} onClick={onAdd}>
        <Plus size={12} />Add Condition
      </button>
    </div>
  );
}

// ── Status helpers ─────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: QualStatus }) {
  if (status === 'QUALIFIED')    return <CheckCircle size={15} style={{ color: '#10b981', flexShrink: 0 }} />;
  if (status === 'DISQUALIFIED') return <XCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />;
  return <AlertCircle size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />;
}

function StatusBadge({ status }: { status: QualStatus }) {
  const map: Record<QualStatus, { cls: string; label: string }> = {
    QUALIFIED:    { cls: 'badge-green', label: 'Qualified' },
    DISQUALIFIED: { cls: 'badge-red',   label: 'Disqualified' },
    NEEDS_REVIEW: { cls: 'badge-amber', label: 'Needs Review' },
  };
  const { cls, label } = map[status];
  return <span className={`badge ${cls}`} style={{ fontSize: '0.6875rem' }}>{label}</span>;
}

// ── Section A: Qualification Rules Engine ────────────────────────────────

function SectionRulesEngine() {
  const { toast } = useApp();
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('ai_qual_enabled') ?? 'true'); } catch { return true; }
  });
  const [qualRules, setQualRules] = useState<QualRule[]>(DEFAULT_QUALIFY_RULES);
  const [disqualRules, setDisqualRules] = useState<QualRule[]>(DEFAULT_DISQUALIFY_RULES);

  const updateRule = (setter: React.Dispatch<React.SetStateAction<QualRule[]>>) =>
    (id: string, key: keyof QualRule, value: string) =>
      setter(prev => prev.map(r => r.id === id ? { ...r, [key]: value } : r));

  const addRule = (setter: React.Dispatch<React.SetStateAction<QualRule[]>>, prefix: string) =>
    () => setter(prev => [
      ...prev,
      { id: `${prefix}${Date.now()}`, field: 'Lead Score', operator: '>', value: '', logic: 'AND' },
    ]);

  const delRule = (setter: React.Dispatch<React.SetStateAction<QualRule[]>>) =>
    (id: string) => setter(prev => prev.filter(r => r.id !== id));

  const handleToggle = (v: boolean) => {
    setEnabled(v);
    localStorage.setItem('ai_qual_enabled', JSON.stringify(v));
  };

  return (
    <div className="space-y-5">
      {/* Master toggle */}
      <div className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ background: 'var(--accent-dim)', padding: 8, borderRadius: 10 }}>
            <Brain size={16} style={{ color: '#5b6ef9' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>AI-assisted qualification</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              Automatically qualify or disqualify leads based on your rules
            </p>
          </div>
        </div>
        <Toggle value={enabled} onChange={handleToggle} />
      </div>

      {/* QUALIFY rules */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <CheckCircle size={14} style={{ color: '#10b981' }} />
            Qualify Rules
          </h3>
          <span className="badge badge-green" style={{ fontSize: '0.625rem' }}>→ Mark Qualified</span>
        </div>
        <div className="p-4">
          <RuleBuilder
            rules={qualRules}
            onUpdate={updateRule(setQualRules)}
            onAdd={addRule(setQualRules, 'q')}
            onDelete={delRule(setQualRules)}
            thenLabel="Mark Qualified"
            thenColor="green"
          />
        </div>
      </div>

      {/* DISQUALIFY rules */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <XCircle size={14} style={{ color: '#ef4444' }} />
            Disqualify Rules
          </h3>
          <span className="badge badge-red" style={{ fontSize: '0.625rem' }}>→ Mark Disqualified</span>
        </div>
        <div className="p-4">
          <RuleBuilder
            rules={disqualRules}
            onUpdate={updateRule(setDisqualRules)}
            onAdd={addRule(setDisqualRules, 'd')}
            onDelete={delRule(setDisqualRules)}
            thenLabel="Mark Disqualified"
            thenColor="red"
          />
        </div>
      </div>

      {/* Save */}
      <div>
        <button className="btn-primary" onClick={() => toast('success', 'Qualification rules saved')}>
          <Zap size={13} />Save Rules
        </button>
      </div>
    </div>
  );
}

// ── Section B: Notification Center ──────────────────────────────────────

function SectionNotificationCenter() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [events, setEvents] = useState<QualEvent[]>(QUAL_EVENTS);

  const filterTabs: FilterTab[] = ['All', 'Qualified', 'Disqualified', 'Needs Review'];

  const filtered = events.filter(e => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Qualified')    return e.status === 'QUALIFIED';
    if (activeFilter === 'Disqualified') return e.status === 'DISQUALIFIED';
    if (activeFilter === 'Needs Review') return e.status === 'NEEDS_REVIEW';
    return true;
  });

  const handleRemove = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            style={{
              padding: '0.3rem 0.75rem', borderRadius: 8, fontSize: '0.8125rem',
              fontWeight: activeFilter === tab ? 600 : 400,
              cursor: 'pointer', border: '1px solid',
              borderColor: activeFilter === tab ? '#5b6ef9' : 'var(--border)',
              background: activeFilter === tab ? 'var(--accent-dim)' : 'var(--surface)',
              color: activeFilter === tab ? '#5b6ef9' : 'var(--text-3)',
              transition: 'all 150ms',
            }}
          >
            {tab}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: 'var(--text-3)' }}>
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Event feed */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Filter size={24} style={{ color: 'var(--text-3)', margin: '0 auto 8px' }} />
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>No events match this filter</p>
          </div>
        ) : (
          <div>
            {filtered.map((event, idx) => (
              <div
                key={event.id}
                className="flex items-start gap-4 px-5 py-4"
                style={{
                  borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 100ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Icon */}
                <div style={{ paddingTop: 2 }}>
                  <StatusIcon status={event.status} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{event.name}</span>
                    <span className="text-sm" style={{ color: 'var(--text-3)' }}>/ {event.company}</span>
                    <StatusBadge status={event.status} />
                    <span className="badge badge-blue" style={{ fontSize: '0.625rem' }}>Score: {event.score}</span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-2)', lineHeight: 1.5 }}>{event.reason}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
                      <Clock size={10} />{event.timestamp}
                    </span>
                    <button
                      className="btn-ghost text-xs"
                      style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}
                      onClick={() => { window.location.hash = '/leads'; }}
                    >
                      <Eye size={11} />View Lead
                    </button>
                    {event.status === 'QUALIFIED' && (
                      <button className="btn-primary text-xs" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
                        <Zap size={11} />Start Meeting Flow
                      </button>
                    )}
                    {(event.status === 'DISQUALIFIED' || event.status === 'NEEDS_REVIEW') && (
                      <button
                        className="btn-danger text-xs"
                        style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}
                        onClick={() => handleRemove(event.id)}
                      >
                        <Trash2 size={11} />Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section C: Auto Stage Movement ───────────────────────────────────────

function SectionAutoStageMovement() {
  const { toast } = useApp();
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('auto_stage_enabled') ?? 'true'); } catch { return true; }
  });
  const [triggers, setTriggers] = useState<StageTransition[]>(STAGE_TRANSITIONS);

  const handleToggle = (v: boolean) => {
    setEnabled(v);
    localStorage.setItem('auto_stage_enabled', JSON.stringify(v));
  };

  const updateTrigger = (from: string, to: string, value: string) => {
    setTriggers(prev => prev.map(t => t.from === from && t.to === to ? { ...t, trigger: value } : t));
  };

  // Stage flow colors
  const stageColors: Record<string, string> = {
    'New':            '#5b6ef9',
    'Contacted':      '#8b5cf6',
    'Engaged':        '#f59e0b',
    'Qualified':      '#10b981',
    'Meeting Booked': '#06b6d4',
    'Closed Won':     '#10b981',
    'Closed Lost':    '#ef4444',
  };

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ background: 'var(--accent-dim)', padding: 8, borderRadius: 10 }}>
            <TrendingUp size={16} style={{ color: '#5b6ef9' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Automatically move leads through pipeline stages
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              Trigger stage transitions based on lead behavior and AI signals
            </p>
          </div>
        </div>
        <Toggle value={enabled} onChange={handleToggle} />
      </div>

      {/* Stage flow visualization */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Pipeline Stage Map</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {PIPELINE_STAGES.map((stage, idx) => (
            <div key={stage} className="flex items-center gap-2">
              <div
                style={{
                  padding: '0.3rem 0.65rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                  background: `${stageColors[stage]}18`,
                  color: stageColors[stage],
                  border: `1px solid ${stageColors[stage]}30`,
                  whiteSpace: 'nowrap',
                }}
              >
                {stage}
              </div>
              {idx < PIPELINE_STAGES.length - 1 && (
                <ArrowRight size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Transition triggers */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Stage Transition Triggers</h3>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {triggers.map(t => (
            <div key={`${t.from}-${t.to}`} className="px-5 py-3 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0" style={{ width: 260, flexShrink: 0 }}>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: `${stageColors[t.from]}18`, color: stageColors[t.from], whiteSpace: 'nowrap' }}
                >
                  {t.from}
                </span>
                <ChevronRight size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: `${stageColors[t.to]}18`, color: stageColors[t.to], whiteSpace: 'nowrap' }}
                >
                  {t.to}
                </span>
              </div>
              <input
                value={t.trigger}
                onChange={e => updateTrigger(t.from, t.to, e.target.value)}
                className="input-field text-xs flex-1"
                style={{ padding: '0.3rem 0.6rem', minWidth: 200 }}
              />
            </div>
          ))}
        </div>
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button className="btn-primary text-xs" onClick={() => toast('success', 'Stage triggers saved')}>
            <Zap size={12} />Save Triggers
          </button>
        </div>
      </div>

      {/* Stage Transition History */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Clock size={14} style={{ color: '#5b6ef9' }} />
            Stage Transition History
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              {['Lead', 'Transition', 'Time', 'Triggered By'].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STAGE_HISTORY.map(row => (
              <tr key={`${row.lead}-${row.from}-${row.to}`} className="tr">
                <td className="td font-medium" style={{ color: 'var(--text)' }}>{row.lead}</td>
                <td className="td">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: `${stageColors[row.from]}18`, color: stageColors[row.from], fontWeight: 600 }}
                    >
                      {row.from}
                    </span>
                    <ArrowRight size={11} style={{ color: 'var(--text-3)' }} />
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: `${stageColors[row.to]}18`, color: stageColors[row.to], fontWeight: 600 }}
                    >
                      {row.to}
                    </span>
                  </div>
                </td>
                <td className="td text-xs" style={{ color: 'var(--text-3)' }}>{row.time}</td>
                <td className="td text-xs" style={{ color: 'var(--text-2)' }}>{row.triggered}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

type TabId = 'rules' | 'notifications' | 'stage-movement';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'rules',          label: 'Qualification Rules',  icon: <Brain size={14} /> },
  { id: 'notifications',  label: 'Notification Center',  icon: <UserCheck size={14} /> },
  { id: 'stage-movement', label: 'Auto Stage Movement',  icon: <TrendingUp size={14} /> },
];

export default function AIQualification() {
  const [activeTab, setActiveTab] = useState<TabId>('rules');

  return (
    <div className="p-6 max-w-4xl animate-fade-in space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <UserCheck size={20} style={{ color: '#5b6ef9' }} />
          AI Qualification
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>
          Automatically qualify leads, track status changes, and move prospects through your pipeline
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
      {activeTab === 'rules'          && <SectionRulesEngine />}
      {activeTab === 'notifications'  && <SectionNotificationCenter />}
      {activeTab === 'stage-movement' && <SectionAutoStageMovement />}
    </div>
  );
}
