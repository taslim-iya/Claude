import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Mail, DollarSign, ArrowUpRight, CheckCircle2, Plus, Target, Zap, BarChart2 } from 'lucide-react';

const SETUP_STEPS = [
  { label: 'Add your first lead', sublabel: 'Import or manually add a prospect', path: '/leads', icon: Users, color: '#5b6ef9' },
  { label: 'Create a campaign', sublabel: 'Set up your first outreach campaign', path: '/campaigns', icon: Mail, color: '#10b981' },
  { label: 'Build a sequence', sublabel: 'Automate your follow-up cadence', path: '/sequences', icon: Zap, color: '#f59e0b' },
  { label: 'Add a deal to pipeline', sublabel: 'Track your opportunities', path: '/pipeline', icon: Target, color: '#8b5cf6' },
];

function fmt$(n: number): string {
  if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n/1000).toFixed(0)}K`;
  return `$${n}`;
}

export default function Dashboard() {
  const { contacts, campaigns, opportunities, tasks, profile } = useApp();
  const navigate = useNavigate();

  const isEmpty = contacts.length === 0 && campaigns.length === 0 && opportunities.length === 0;

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const pipelineValue = opportunities.filter(o => o.stage !== 'lost').reduce((a, o) => a + (o.value || 0), 0);
  const avgReplyRate = campaigns.length
    ? Math.round(campaigns.reduce((a, c) => a + (c.replyRate || 0), 0) / campaigns.length * 10) / 10
    : 0;

  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile.name ? profile.name.split(' ')[0] : null;

  if (isEmpty) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            {greeting()}{firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>
            Welcome to ProspectIQ. Let's get you set up.
          </p>
        </div>

        <div className="max-w-2xl">
          <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(91,110,249,0.12)' }}>
                <BarChart2 size={16} style={{ color: '#5b6ef9' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Get started</p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>Complete these steps to start prospecting</p>
              </div>
            </div>
            <div className="space-y-2">
              {SETUP_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <button key={step.path} onClick={() => navigate(step.path)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all group"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#5b6ef9'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${step.color}15` }}>
                      <Icon size={15} style={{ color: step.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{step.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-3)' }}>{step.sublabel}</p>
                    </div>
                    <Plus size={14} style={{ color: 'var(--text-3)' }} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: 'rgba(91,110,249,0.06)', border: '1px solid rgba(91,110,249,0.15)' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>💡 Quick tip</p>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              Start by importing your leads via CSV or adding them manually. Once you have leads, create a campaign and attach a sequence to automate your outreach.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
          {greeting()}{firstName ? `, ${firstName}` : ''} 👋
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>Here's what's happening with your pipeline today.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: contacts.length.toLocaleString(), icon: Users, color: '#5b6ef9' },
          { label: 'Active Campaigns', value: String(activeCampaigns), icon: Mail, color: '#10b981' },
          { label: 'Pipeline Value', value: fmt$(pipelineValue), icon: DollarSign, color: '#f59e0b' },
          { label: 'Avg Reply Rate', value: `${avgReplyRate}%`, icon: TrendingUp, color: '#8b5cf6' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl p-5 transition-all hover:shadow-glass"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                  <Icon size={15} style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Pipeline Stages</h3>
          {opportunities.length === 0 ? (
            <div className="text-center py-8">
              <Target size={24} className="mx-auto mb-2" style={{ color: 'var(--border-2)' }} />
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>No deals in pipeline yet</p>
              <button onClick={() => navigate('/pipeline')} className="mt-3 text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(91,110,249,0.12)', color: '#5b6ef9' }}>Add first deal</button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {[
                { stage: 'New', key: 'new', color: '#6b7280' },
                { stage: 'Contacted', key: 'contacted', color: '#5b6ef9' },
                { stage: 'Interested', key: 'interested', color: '#f59e0b' },
                { stage: 'Meeting Booked', key: 'meeting_booked', color: '#ec4899' },
                { stage: 'Proposal Sent', key: 'proposal_sent', color: '#ef4444' },
                { stage: 'Won', key: 'won', color: '#10b981' },
              ].map(({ stage, key, color }) => {
                const count = opportunities.filter(o => o.stage === key).length;
                const val = opportunities.filter(o => o.stage === key).reduce((a, o) => a + (o.value || 0), 0);
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs flex-1" style={{ color: 'var(--text-2)' }}>{stage}</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>{count} deal{count !== 1 ? 's' : ''}</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{fmt$(val)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Pending Tasks</h3>
            {pendingTasks.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(91,110,249,0.15)', color: '#5b6ef9' }}>
                {tasks.filter(t => !t.completed).length} open
              </span>
            )}
          </div>
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 size={24} className="mx-auto mb-2" style={{ color: 'var(--border-2)' }} />
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>All caught up!</p>
              <button onClick={() => navigate('/tasks')} className="mt-3 text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(91,110,249,0.12)', color: '#5b6ef9' }}>Add a task</button>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: 'var(--surface-2)' }}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <p className="text-xs flex-1 truncate" style={{ color: 'var(--text)' }}>{t.title}</p>
                  {t.dueDate && <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{t.dueDate}</span>}
                </div>
              ))}
              {tasks.filter(t => !t.completed).length > 5 && (
                <button onClick={() => navigate('/tasks')} className="text-xs w-full text-center py-1.5"
                  style={{ color: '#5b6ef9' }}>
                  +{tasks.filter(t => !t.completed).length - 5} more tasks
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {campaigns.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Active Campaigns</h3>
            <button onClick={() => navigate('/campaigns')} className="text-xs" style={{ color: '#5b6ef9' }}>View all →</button>
          </div>
          <div className="space-y-2">
            {campaigns.filter(c => c.status === 'active').slice(0, 3).map(c => (
              <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{c.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{c.emailsSent || 0} sent</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>{c.openRate || 0}%</p>
                    <p style={{ color: 'var(--text-3)' }}>opens</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>{c.replyRate || 0}%</p>
                    <p style={{ color: 'var(--text-3)' }}>replies</p>
                  </div>
                </div>
              </div>
            ))}
            {campaigns.filter(c => c.status !== 'active').length > 0 && activeCampaigns === 0 && (
              <p className="text-xs text-center py-4" style={{ color: 'var(--text-3)' }}>No active campaigns — <button onClick={() => navigate('/campaigns')} style={{ color: '#5b6ef9' }}>start one</button></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
