import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Settings, Users, Crown, Shield, Eye, Mail, MoreHorizontal } from 'lucide-react';
import Modal from '../components/ui/Modal';

const ROLES = ['admin','manager','member','viewer'] as const;
const roleColors: Record<string,{color:string,bg:string}> = {
  admin: { color:'#f59e0b', bg:'rgba(245,158,11,0.12)' },
  manager: { color:'#5b6ef9', bg:'rgba(91,110,249,0.12)' },
  member: { color:'#10b981', bg:'rgba(16,185,129,0.12)' },
  viewer: { color:'var(--text-2)', bg:'var(--surface-2)' },
};

export default function TeamSettings() {
  const { team } = useApp();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<typeof ROLES[number]>('member');
  const { toast } = useApp();

  const handleInvite = () => {
    if (!inviteEmail) { toast('error','Email required'); return; }
    toast('success', `Invite sent to ${inviteEmail}`);
    setInviteEmail('');
    setShowInvite(false);
  };

  return (
    <div className="p-6 max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color:"var(--text)" }}>Team Settings</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--text-2)' }}>Manage your team and permissions</p>
        </div>
        <button onClick={()=>setShowInvite(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background:'#5b6ef9', color:'var(--text)' }}>
          <Plus size={13}/>Invite Member
        </button>
      </div>

      {/* Team overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {label:'Total Members',value:team.length,icon:Users},
          {label:'Admins',value:team.filter(m=>m.role==='admin').length,icon:Crown},
          {label:'Active Seats',value:team.length,icon:Shield},
        ].map(s=>{
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl p-4"
              style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={13} style={{ color:'var(--text-2)' }} />
                <span className="text-xs" style={{ color:'var(--text-2)' }}>{s.label}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color:"var(--text)" }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Members list */}
      <div className="rounded-xl overflow-hidden" style={{ border:'1px solid var(--border)' }}>
        <div className="px-4 py-3" style={{ background:'var(--surface)', borderBottom:'1px solid var(--border)' }}>
          <p className="text-xs font-semibold" style={{ color:'var(--text-2)' }}>MEMBERS ({team.length})</p>
        </div>
        {team.map((m, i) => {
          const rc = roleColors[m.role] || roleColors.member;
          return (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3 group"
              style={{ borderBottom: i<team.length-1?'1px solid var(--border)':'none' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#5b6ef9,#8b5cf6)' }}>
                {m.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium" style={{ color:"var(--text)" }}>{m.name}</p>
                  {m.role==='admin' && <Crown size={11} style={{ color:'#f59e0b' }} />}
                </div>
                <p className="text-xs" style={{ color:'var(--text-2)' }}>{m.email}</p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                style={{ background:rc.bg, color:rc.color }}>{m.role}</span>
              <button className="w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color:'var(--text-3)' }}>
                <MoreHorizontal size={14}/>
              </button>
            </div>
          );
        })}
      </div>

      {/* Workspace settings */}
      <div className="mt-6 rounded-xl p-5" style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold  mb-4 flex items-center gap-2" style={{ color:"var(--text)" }}>
          <Settings size={14}/>Workspace Settings
        </h3>
        <div className="space-y-3">
          {[
            {label:'Workspace Name',value:'Acme Sales Co'},
            {label:'Default Timezone',value:'America/Los_Angeles'},
            {label:'Sender Domain',value:'acmecorp.com'},
          ].map(f=>(
            <div key={f.label} className="flex items-center justify-between">
              <span className="text-sm" style={{ color:'var(--text-2)' }}>{f.label}</span>
              <input defaultValue={f.value}
                className="px-3 py-1.5 text-sm rounded-lg outline-none text-right"
                style={{ background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text)', width:220 }} />
            </div>
          ))}
        </div>
        <button className="mt-4 text-xs font-semibold px-4 py-2 rounded-lg"
          style={{ background:'#5b6ef9', color:'var(--text)' }}
          onClick={()=>toast('success','Workspace settings saved')}>
          Save Changes
        </button>
      </div>

      <Modal open={showInvite} onClose={()=>setShowInvite(false)} title="Invite Team Member" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color:'var(--text-2)' }}>Email Address</label>
            <input placeholder="colleague@company.com" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color:'var(--text-2)' }}>Role</label>
            <select value={inviteRole} onChange={e=>setInviteRole(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background:'var(--surface-2)', border:'1px solid var(--border-2)', color:'var(--text)' }}>
              {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={()=>setShowInvite(false)}
              className="px-4 py-2 text-sm rounded-lg"
              style={{ background:'var(--surface-2)', color:'var(--text-2)' }}>Cancel</button>
            <button onClick={handleInvite}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg"
              style={{ background:'#5b6ef9', color:'var(--text)' }}>
              <Mail size={12}/>Send Invite
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
