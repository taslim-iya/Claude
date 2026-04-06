import { useState } from 'react';
import { Users, Plus, Shield, Mail, Clock, MoreHorizontal, CheckCircle } from 'lucide-react';
import { teamMembers } from '../data/sampleData';

const roleStyle: Record<string, string> = {
  admin: 'bg-indigo-50 text-indigo-700',
  member: 'bg-emerald-50 text-emerald-700',
  viewer: 'bg-gray-100 text-gray-500',
};

export default function TeamSettings() {
  const [tab, setTab] = useState<'members'|'roles'|'workspace'>('members');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Team Settings</h1>
          <p className="text-sm text-gray-500">Manage team members, roles, and workspace settings.</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors"><Plus size={14}/> Invite Member</button>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[['members','Members'],['roles','Roles & Permissions'],['workspace','Workspace']].map(([k,l]) => (
          <button key={k} onClick={()=>setTab(k as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab===k?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>{l}</button>
        ))}
      </div>

      {tab === 'members' && (
        <div className="space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[{l:'Total Members', v:teamMembers.length},{l:'Admins', v:teamMembers.filter(m=>m.role==='admin').length},{l:'Active Today', v:2}].map(s=>(
              <div key={s.l} className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-2xl font-bold text-gray-900">{s.v}</p><p className="text-xs text-gray-500 mt-0.5">{s.l}</p></div>
            ))}
          </div>
          {teamMembers.map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {m.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleStyle[m.role]}`}>{m.role}</span>
                    {m.lastActive === '2026-03-25' && <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle size={11}/>Active</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Mail size={11}/>{m.email}</span>
                    <span className="flex items-center gap-1"><Clock size={11}/>Last active {m.lastActive}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 ml-4">
                <div className="text-right"><p className="text-sm font-bold text-gray-900">{m.emailsSent.toLocaleString()}</p><p className="text-xs text-gray-400">Emails Sent</p></div>
                <div className="text-right"><p className="text-sm font-bold text-gray-900">{m.meetingsBooked}</p><p className="text-xs text-gray-400">Meetings</p></div>
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal size={15}/></button>
              </div>
            </div>
          ))}
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer">
            <Plus size={20} className="mx-auto text-gray-300 mb-2"/>
            <p className="text-sm font-medium text-gray-500">Invite a team member</p>
            <p className="text-xs text-gray-400 mt-0.5">They'll get an email invite to join your workspace</p>
          </div>
        </div>
      )}

      {tab === 'roles' && (
        <div className="space-y-4">
          {[
            {role:'Admin', desc:'Full access to all features, settings, and team management.', perms:['Create & delete campaigns','Manage team members','Billing access','All data access','Integration management']},
            {role:'Member', desc:'Can create campaigns, manage leads, and view team data.', perms:['Create & edit campaigns','Manage own leads','View shared lists','Run enrichment','Export data']},
            {role:'Viewer', desc:'Read-only access to campaigns, reports, and pipeline.', perms:['View campaigns','View pipeline','View reports','View contacts','No edit access']},
          ].map(r => (
            <div key={r.role} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center"><Shield size={16} className="text-indigo-600"/></div>
                <div><h3 className="font-semibold text-gray-900">{r.role}</h3><p className="text-xs text-gray-500">{r.desc}</p></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.perms.map(p => <span key={p} className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1 rounded-lg">{p}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'workspace' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h3 className="font-semibold text-gray-900">Workspace Settings</h3>
          {[
            {label:'Workspace Name', value:'Acme Sales Co', type:'input'},
            {label:'Workspace Domain', value:'acme.com', type:'input'},
            {label:'Default Timezone', value:'America/Los_Angeles (PST)', type:'select'},
            {label:'Default Send Window', value:'9:00 AM – 5:00 PM', type:'select'},
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
              <input defaultValue={f.value} className="w-full max-w-md border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          ))}
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">Save Changes</button>
        </div>
      )}
    </div>
  );
}
