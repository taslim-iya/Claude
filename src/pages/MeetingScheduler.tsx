import { useState, useEffect } from 'react';
import {
  Calendar, Clock, Link2, Check, ChevronDown, Sparkles,
  Settings, Inbox, CalendarCheck, BarChart2,
  ExternalLink, RefreshCw, X, Brain, TrendingUp,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

// ── Types ────────────────────────────────────────────────────────────────────

type Tab = 'availability' | 'requests' | 'upcoming' | 'analytics';
type RequestStatus = 'pending' | 'accepted' | 'declined';
type MeetingStatus = 'Confirmed' | 'Pending' | 'Cancelled';

interface MeetingRequest {
  id: string;
  name: string;
  company: string;
  type: string;
  time: string;
  status: RequestStatus;
  avatarGrad: [string, string];
}

interface UpcomingMeeting {
  id: string;
  name: string;
  company: string;
  type: string;
  time: string;
  status: MeetingStatus;
  link?: string;
  linkType?: 'zoom' | 'meet';
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17] as const;

function fmtHour(h: number) {
  if (h === 12) return '12pm';
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

function defaultSlots(): Set<string> {
  const s = new Set<string>();
  for (const d of DAYS) {
    for (const h of HOURS) {
      if (h >= 9 && h < 17) s.add(`${d}-${h}`);
    }
  }
  return s;
}

const AI_BEST: Set<string> = new Set(['Mon-10', 'Mon-14', 'Tue-10', 'Tue-14', 'Wed-10', 'Wed-14']);

const TIMEZONES = [
  'America/New_York (EST)',
  'America/Chicago (CST)',
  'America/Denver (MST)',
  'America/Los_Angeles (PST)',
  'America/Anchorage (AKST)',
  'Pacific/Honolulu (HST)',
  'Europe/London (GMT)',
  'Europe/Paris (CET)',
  'Asia/Tokyo (JST)',
  'Asia/Singapore (SGT)',
];

const INITIAL_REQUESTS: MeetingRequest[] = [
  { id: 'r1', name: 'Jordan Lee',      company: 'Stripe',  type: 'Discovery Call', time: 'Tomorrow 10:00 AM PST', status: 'pending',  avatarGrad: ['#5b6ef9', '#8b5cf6'] },
  { id: 'r2', name: 'Emily Chen',      company: 'Notion',  type: 'Product Demo',   time: 'Thu 2:00 PM PST',       status: 'pending',  avatarGrad: ['#10b981', '#059669'] },
  { id: 'r3', name: 'Marcus Davis',    company: 'Figma',   type: 'Follow-up',      time: 'Wed 11:00 AM PST',      status: 'pending',  avatarGrad: ['#f59e0b', '#ef4444'] },
  { id: 'r4', name: 'Priya Patel',     company: 'Linear',  type: 'Strategy Call',  time: 'Fri 3:00 PM PST',       status: 'accepted', avatarGrad: ['#8b5cf6', '#5b6ef9'] },
  { id: 'r5', name: 'Alex Thompson',   company: 'Vercel',  type: 'Discovery Call', time: 'Mon 9:00 AM PST',       status: 'declined', avatarGrad: ['#6b7280', '#9ca3af'] },
];

const UPCOMING_MEETINGS: UpcomingMeeting[] = [
  { id: 'm1', name: 'Priya Patel',   company: 'Linear',  type: 'Discovery Call', time: 'Tomorrow 3:00 PM',  status: 'Confirmed', link: 'https://zoom.us/j/mock001',              linkType: 'zoom' },
  { id: 'm2', name: 'Sophie Wang',   company: 'Loom',    type: 'Product Demo',   time: 'Wed 11:00 AM',      status: 'Confirmed', link: 'https://meet.google.com/mock-abc-def',   linkType: 'meet' },
  { id: 'm3', name: 'Jordan Lee',    company: 'Stripe',  type: 'Strategy Call',  time: 'Thu 2:00 PM',       status: 'Pending',   link: 'https://zoom.us/j/mock003',              linkType: 'zoom' },
  { id: 'm4', name: 'Tom Richards',  company: 'HubSpot', type: 'Follow-up',      time: 'Fri 10:00 AM',      status: 'Confirmed', link: 'https://zoom.us/j/mock004',              linkType: 'zoom' },
  { id: 'm5', name: 'Ana Müller',    company: 'SAP',     type: 'Discovery Call', time: 'Mon 9:00 AM',       status: 'Cancelled' },
  { id: 'm6', name: 'Kevin Lee',     company: 'Zoom',    type: 'Demo',           time: 'Tue 2:00 PM',       status: 'Confirmed', link: 'https://meet.google.com/mock-ghi-jkl',   linkType: 'meet' },
];

const WEEKLY_DATA = [
  { week: 'W1', meetings: 2 },
  { week: 'W2', meetings: 4 },
  { week: 'W3', meetings: 3 },
  { week: 'W4', meetings: 6 },
  { week: 'W5', meetings: 5 },
  { week: 'W6', meetings: 7 },
  { week: 'W7', meetings: 6 },
  { week: 'W8', meetings: 8 },
];

const MEETING_BREAKDOWN = [
  { type: 'Discovery Call', count: 12, showRate: '82%', conversion: '38%' },
  { type: 'Product Demo',   count: 8,  showRate: '75%', conversion: '29%' },
  { type: 'Follow-up',      count: 4,  showRate: '71%', conversion: '24%' },
];

const AI_BRIEF_BULLETS = (name: string, company: string) => [
  `Company recently raised Series B ($50M) — good signal for budget`,
  `${name.split(' ')[0]} opened your pricing email 3 times — price-sensitive`,
  `Competitor: they currently use Salesforce based on tech stack`,
  `Talking point: mention your SaaS customer case study`,
  `Objection prep: likely to ask about integrations — see deck slide 8`,
];

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ name, grad }: { name: string; grad: [string, string] }) {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{
        background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
        color: '#ffffff',
      }}
    >
      {initials}
    </div>
  );
}

function AvatarAuto({ name, company }: { name: string; company: string }) {
  const colors: Array<[string, string]> = [
    ['#5b6ef9', '#8b5cf6'], ['#10b981', '#059669'], ['#f59e0b', '#ef4444'],
    ['#8b5cf6', '#5b6ef9'], ['#ef4444', '#f59e0b'], ['#06b6d4', '#5b6ef9'],
  ];
  const idx = (name.charCodeAt(0) + company.charCodeAt(0)) % colors.length;
  return <Avatar name={name} grad={colors[idx]} />;
}

function StatusBadge({ status }: { status: RequestStatus | MeetingStatus }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    pending:   { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b',  label: 'Pending' },
    accepted:  { bg: 'rgba(16,185,129,0.15)',  color: '#10b981',  label: 'Accepted' },
    declined:  { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444',  label: 'Declined' },
    Confirmed: { bg: 'rgba(16,185,129,0.15)',  color: '#10b981',  label: 'Confirmed' },
    Pending:   { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b',  label: 'Pending' },
    Cancelled: { bg: 'rgba(107,114,128,0.15)', color: '#6b7280',  label: 'Cancelled' },
  };
  const c = cfg[status] ?? cfg['pending'];
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(91,110,249,0.12)', color: '#5b6ef9' }}>
      {type}
    </span>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange(v: boolean): void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        className="relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0"
        style={{ background: checked ? '#5b6ef9' : 'var(--surface-3)' }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200"
          style={{
            background: checked ? '#ffffff' : 'var(--text-3)',
            transform: checked ? 'translateX(18px)' : 'translateX(2px)',
          }}
        />
      </div>
      <span className="text-sm" style={{ color: 'var(--text-2)' }}>{label}</span>
    </label>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs"
      style={{ background: 'var(--modal-bg)', border: '1px solid var(--border-2)', color: 'var(--text)' }}>
      <p style={{ color: 'var(--text-2)' }}>{label}</p>
      <p className="font-semibold">{payload[0].value} meetings</p>
    </div>
  );
};

// ── Section A: Availability ────────────────────────────────────────────────────

function AvailabilitySection() {
  const [slots, setSlots] = useState<Set<string>>(defaultSlots);
  const [duration, setDuration] = useState<15 | 30 | 45 | 60>(30);
  const [buffer, setBuffer] = useState<'none' | '15' | '30'>('15');
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [aiOptimal, setAiOptimal] = useState(() => localStorage.getItem('ai_optimal_times') === 'true');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSlot = (key: string) => {
    setSlots(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleAiToggle = (v: boolean) => {
    setAiOptimal(v);
    localStorage.setItem('ai_optimal_times', String(v));
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Weekly grid */}
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Weekly Availability</h3>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-3)' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#5b6ef9' }} /> Available
            </span>
            {aiOptimal && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'rgba(91,110,249,0.35)', boxShadow: '0 0 6px rgba(91,110,249,0.6)' }} /> AI Optimal
              </span>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[520px]" style={{ gridTemplateColumns: '52px repeat(5, 1fr)', gap: '2px' }}>
            {/* Header row */}
            <div />
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold py-1.5" style={{ color: 'var(--text-2)' }}>{d}</div>
            ))}
            {/* Hour rows */}
            {HOURS.map(h => (
              <>
                <div key={`label-${h}`} className="flex items-center justify-end pr-2 text-[10px]" style={{ color: 'var(--text-3)' }}>
                  {fmtHour(h)}
                </div>
                {DAYS.map(d => {
                  const key = `${d}-${h}`;
                  const isAvail = slots.has(key);
                  const isAI = aiOptimal && AI_BEST.has(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleSlot(key)}
                      className="rounded transition-all duration-150 h-8"
                      title={`${d} ${fmtHour(h)}`}
                      style={{
                        background: isAvail ? (isAI ? 'rgba(91,110,249,0.7)' : '#5b6ef9') : 'var(--surface-2)',
                        border: isAI && !isAvail ? '1px dashed rgba(91,110,249,0.5)' : '1px solid transparent',
                        boxShadow: isAI && isAvail ? '0 0 8px rgba(91,110,249,0.5)' : 'none',
                        opacity: isAvail ? 1 : 0.6,
                      }}
                    />
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Settings row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Duration presets */}
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-2)' }}>Meeting Duration</p>
          <div className="flex gap-2">
            {([15, 30, 45, 60] as const).map(m => (
              <button
                key={m}
                onClick={() => setDuration(m)}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: duration === m ? '#5b6ef9' : 'var(--surface-2)',
                  color: duration === m ? '#ffffff' : 'var(--text-2)',
                  border: duration === m ? '1px solid #5b6ef9' : '1px solid var(--border)',
                }}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* Buffer time */}
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-2)' }}>Buffer Time</p>
          <div className="flex gap-2">
            {(['none', '15', '30'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBuffer(b)}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: buffer === b ? '#5b6ef9' : 'var(--surface-2)',
                  color: buffer === b ? '#ffffff' : 'var(--text-2)',
                  border: buffer === b ? '1px solid #5b6ef9' : '1px solid var(--border)',
                }}
              >
                {b === 'none' ? 'None' : `${b} min`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timezone + AI + Actions */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-2 gap-4">
          {/* Timezone selector */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Timezone</p>
            <div className="relative">
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full appearance-none rounded-lg px-3 py-2 text-xs pr-8"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-3)' }} />
            </div>
          </div>

          {/* AI optimal toggle */}
          <div className="flex items-end pb-0.5">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>AI Optimal Times</p>
              <Toggle checked={aiOptimal} onChange={handleAiToggle} label="Highlight best slots" />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: copied ? 'rgba(16,185,129,0.15)' : 'var(--surface-2)',
              color: copied ? '#10b981' : 'var(--text-2)',
              border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
            }}
          >
            {copied ? <Check size={13} /> : <Link2 size={13} />}
            {copied ? 'Copied!' : 'Copy booking link'}
          </button>
          <span className="text-xs truncate" style={{ color: 'var(--text-3)' }}>
            https://prospectiq.io/book/sarah-chen
          </span>
          <div className="flex-1" />
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: saved ? 'rgba(16,185,129,0.15)' : '#5b6ef9',
              color: saved ? '#10b981' : '#ffffff',
              border: `1px solid ${saved ? 'rgba(16,185,129,0.3)' : '#5b6ef9'}`,
            }}
          >
            {saved ? <Check size={13} /> : <Settings size={13} />}
            {saved ? 'Saved!' : 'Save Availability'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section B: Requests ────────────────────────────────────────────────────────

function RequestsSection() {
  const [autoAccept, setAutoAccept] = useState(() => localStorage.getItem('auto_accept_meetings') === 'true');
  const [requests, setRequests] = useState<MeetingRequest[]>(INITIAL_REQUESTS);
  const [proposing, setProposing] = useState<string | null>(null);
  const [proposeDay, setProposeDay] = useState('Mon');
  const [proposeTime, setProposeTime] = useState('10:00 AM');

  const handleAutoAccept = (v: boolean) => {
    setAutoAccept(v);
    localStorage.setItem('auto_accept_meetings', String(v));
  };

  const accept = (id: string) => {
    setRequests(r => r.map(x => x.id === id ? { ...x, status: 'accepted' } : x));
  };

  const decline = (id: string) => {
    setRequests(r => r.map(x => x.id === id ? { ...x, status: 'declined' } : x));
    setProposing(null);
  };

  const confirmPropose = (id: string) => {
    setRequests(r => r.map(x => x.id === id ? { ...x, time: `${proposeDay} ${proposeTime} PST` } : x));
    setProposing(null);
  };

  return (
    <div className="space-y-4">
      {/* Auto-accept toggle */}
      <div className="rounded-xl p-4 flex items-center justify-between"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Auto-accept qualified leads</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Automatically accept meetings from leads scoring 80+</p>
        </div>
        <Toggle checked={autoAccept} onChange={handleAutoAccept} label="" />
      </div>

      {/* Request list */}
      <div className="space-y-3">
        {requests.map(req => {
          const isPending = req.status === 'pending';
          const isProposing = proposing === req.id;

          return (
            <div
              key={req.id}
              className="rounded-xl p-4 transition-all"
              style={{
                background: req.status === 'accepted' ? 'rgba(16,185,129,0.05)'
                  : req.status === 'declined' ? 'rgba(107,114,128,0.05)'
                  : 'var(--surface)',
                border: `1px solid ${
                  req.status === 'accepted' ? 'rgba(16,185,129,0.25)'
                  : req.status === 'declined' ? 'var(--border)'
                  : 'var(--border)'
                }`,
              }}
            >
              <div className="flex items-start gap-3">
                <Avatar name={req.name} grad={req.avatarGrad} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{req.name}</span>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>·</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{req.company}</span>
                    <TypeBadge type={req.type} />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={11} style={{ color: 'var(--text-3)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>{req.time}</span>
                  </div>

                  {/* Propose new time inline */}
                  {isProposing && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <select
                        value={proposeDay}
                        onChange={e => setProposeDay(e.target.value)}
                        className="rounded-lg px-2 py-1.5 text-xs appearance-none"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      >
                        {DAYS.map(d => <option key={d}>{d}</option>)}
                      </select>
                      <select
                        value={proposeTime}
                        onChange={e => setProposeTime(e.target.value)}
                        className="rounded-lg px-2 py-1.5 text-xs appearance-none"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      >
                        {['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'].map(t => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => confirmPropose(req.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: '#5b6ef9', color: '#ffffff' }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setProposing(null)}
                        className="px-2 py-1.5 rounded-lg text-xs"
                        style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isPending && !isProposing ? (
                    <>
                      <button
                        onClick={() => accept(req.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
                      >
                        Accept & Send Invite
                      </button>
                      <button
                        onClick={() => setProposing(req.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                      >
                        Propose New Time
                      </button>
                      <button
                        onClick={() => decline(req.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                      >
                        Decline
                      </button>
                    </>
                  ) : !isProposing ? (
                    <StatusBadge status={req.status} />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Section C: Upcoming ────────────────────────────────────────────────────────

function UpcomingSection() {
  const [expandedBriefs, setExpandedBriefs] = useState<Set<string>>(new Set());

  const toggleBrief = (id: string) => {
    setExpandedBriefs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {UPCOMING_MEETINGS.map(m => {
        const briefOpen = expandedBriefs.has(m.id);
        const bullets = AI_BRIEF_BULLETS(m.name, m.company);

        return (
          <div key={m.id} className="rounded-xl overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="p-4 flex items-start gap-3">
              <AvatarAuto name={m.name} company={m.company} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{m.name}</span>
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>·</span>
                  <span className="text-xs" style={{ color: 'var(--text-2)' }}>{m.company}</span>
                  <TypeBadge type={m.type} />
                  <StatusBadge status={m.status} />
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Calendar size={11} style={{ color: 'var(--text-3)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>{m.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* AI Prep Brief */}
                {m.status !== 'Cancelled' && (
                  <button
                    onClick={() => toggleBrief(m.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: briefOpen ? 'rgba(91,110,249,0.15)' : 'var(--surface-2)',
                      color: briefOpen ? '#5b6ef9' : 'var(--text-2)',
                      border: `1px solid ${briefOpen ? 'rgba(91,110,249,0.3)' : 'var(--border)'}`,
                    }}
                  >
                    <Brain size={12} />
                    AI Prep Brief
                  </button>
                )}
                {/* Join link */}
                {m.link && m.status !== 'Cancelled' && (
                  <a
                    href={m.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: '#5b6ef9', color: '#ffffff', textDecoration: 'none' }}
                  >
                    <ExternalLink size={11} />
                    {m.linkType === 'zoom' ? 'Join Zoom' : 'Join Meet'}
                  </a>
                )}
              </div>
            </div>

            {/* AI Brief panel */}
            {briefOpen && (
              <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="mt-3 rounded-lg p-3" style={{ background: 'rgba(91,110,249,0.06)', border: '1px solid rgba(91,110,249,0.15)' }}>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Sparkles size={12} style={{ color: '#5b6ef9' }} />
                    <span className="text-xs font-semibold" style={{ color: '#5b6ef9' }}>AI Prep Brief</span>
                  </div>
                  <ul className="space-y-1.5">
                    {bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
                        <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{ background: 'rgba(91,110,249,0.15)', color: '#5b6ef9' }}>
                          {i + 1}
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Section D: Analytics ──────────────────────────────────────────────────────

function AnalyticsSection() {
  const stats = [
    { label: 'Meetings Booked', value: '24', sub: 'This month', icon: CalendarCheck, color: '#5b6ef9' },
    { label: 'Show Rate',       value: '78%', sub: 'Of scheduled',  icon: TrendingUp,   color: '#10b981' },
    { label: 'Avg Meeting',     value: '28m', sub: 'Average length', icon: Clock,        color: '#f59e0b' },
    { label: 'Conversion to Won', value: '34%', sub: 'Meetings → deals', icon: BarChart2, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${s.color}20` }}>
                <Icon size={15} style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{s.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Area chart */}
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Meetings Booked</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>Last 8 weeks</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={WEEKLY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="meetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#5b6ef9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#5b6ef9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="meetings" stroke="#5b6ef9" strokeWidth={2} fill="url(#meetGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>By Meeting Type</h3>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Meeting Type', 'Count', 'Show Rate', 'Conversion'].map(h => (
                <th key={h} className="px-5 py-2.5 text-left font-semibold" style={{ color: 'var(--text-3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEETING_BREAKDOWN.map((row, i) => (
              <tr key={row.type}
                style={{
                  borderBottom: i < MEETING_BREAKDOWN.length - 1 ? '1px solid var(--border)' : 'none',
                  background: i % 2 === 1 ? 'var(--bg-2)' : 'transparent',
                }}>
                <td className="px-5 py-3 font-medium" style={{ color: 'var(--text)' }}>{row.type}</td>
                <td className="px-5 py-3" style={{ color: 'var(--text-2)' }}>{row.count}</td>
                <td className="px-5 py-3" style={{ color: '#10b981' }}>{row.showRate}</td>
                <td className="px-5 py-3" style={{ color: '#5b6ef9' }}>{row.conversion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: typeof Calendar }[] = [
  { id: 'availability', label: 'Availability', icon: Settings },
  { id: 'requests',     label: 'Requests',     icon: Inbox },
  { id: 'upcoming',     label: 'Upcoming',     icon: CalendarCheck },
  { id: 'analytics',   label: 'Analytics',    icon: BarChart2 },
];

export default function MeetingScheduler() {
  const [tab, setTab] = useState<Tab>('availability');

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Meeting Scheduler</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>
          Manage your availability, handle meeting requests, and review upcoming calls.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: active ? '#5b6ef9' : 'transparent',
                color: active ? '#ffffff' : 'var(--text-2)',
              }}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'availability' && <AvailabilitySection />}
      {tab === 'requests'     && <RequestsSection />}
      {tab === 'upcoming'     && <UpcomingSection />}
      {tab === 'analytics'    && <AnalyticsSection />}
    </div>
  );
}
