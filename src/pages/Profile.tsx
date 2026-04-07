import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, Bell, Shield, Save } from 'lucide-react';

export default function Profile() {
  const { toast } = useApp();
  const [name, setName] = useState('Sarah Miller');
  const [email, setEmail] = useState('sarah.miller@company.com');
  const [title, setTitle] = useState('VP of Sales');
  const [phone, setPhone] = useState('+1 (415) 555-0101');
  const [notifications, setNotifications] = useState({ email:true, slack:true, desktop:false, weekly:true });

  const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v:string)=>void }) => (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
        style={{ color:'rgba(255,255,255,0.4)' }}>{label}</label>
      <input value={value} onChange={e=>onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff' }} />
    </div>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: ()=>void }) => (
    <button onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background:value?'#5b6ef9':'rgba(255,255,255,0.15)' }}>
      <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
        style={{ transform:value?'translateX(20px)':'translateX(0)' }} />
    </button>
  );

  return (
    <div className="p-6 max-w-3xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Profile Settings</h1>
        <p className="text-sm mt-0.5" style={{ color:'rgba(255,255,255,0.4)' }}>Manage your personal account settings.</p>
      </div>

      {/* Profile */}
      <div className="rounded-xl p-6 mb-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="text-sm font-semibold text-white mb-4">Profile</h3>
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ background:'linear-gradient(135deg,#5b6ef9,#8b5cf6)' }}>SM</div>
          <div>
            <p className="font-semibold text-white">{name}</p>
            <p className="text-sm" style={{ color:'rgba(255,255,255,0.4)' }}>{title}</p>
            <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>Admin · Acme Sales Co</p>
          </div>
          <button className="ml-auto text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ background:'rgba(91,110,249,0.12)', color:'#5b6ef9', border:'1px solid rgba(91,110,249,0.2)' }}>
            Change Photo
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name" value={name} onChange={setName} />
          <Field label="Job Title" value={title} onChange={setTitle} />
          <Field label="Email" value={email} onChange={setEmail} />
          <Field label="Phone" value={phone} onChange={setPhone} />
        </div>
        <button onClick={()=>toast('success','Profile saved')}
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl"
          style={{ background:'#5b6ef9', color:'#fff' }}>
          <Save size={13}/>Save Profile
        </button>
      </div>

      {/* Email sender settings */}
      <div className="rounded-xl p-6 mb-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Mail size={14}/>Email Sender Settings</h3>
        <div className="space-y-4">
          {[
            {label:'From Name',defaultValue:'Sarah Miller'},
            {label:'From Email',defaultValue:'sarah@company.com'},
          ].map(f=>(
            <div key={f.label}>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color:'rgba(255,255,255,0.4)' }}>{f.label}</label>
              <input defaultValue={f.defaultValue}
                className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff' }} />
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color:'rgba(255,255,255,0.4)' }}>Email Signature</label>
            <textarea rows={4} defaultValue={"Best,\nSarah Miller\nVP Sales | Acme Sales Co"}
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none resize-none"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff' }} />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl p-6 mb-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Bell size={14}/>Notifications</h3>
        <div className="space-y-4">
          {[
            {key:'email' as const, label:'Email notifications', desc:'Get notified of replies and meetings via email'},
            {key:'slack' as const, label:'Slack notifications', desc:'Send alerts to your connected Slack workspace'},
            {key:'desktop' as const, label:'Desktop notifications', desc:'Browser push notifications for real-time alerts'},
            {key:'weekly' as const, label:'Weekly digest', desc:'Weekly summary of pipeline and campaign performance'},
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between py-2"
              style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p className="text-sm font-medium text-white">{n.label}</p>
                <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>{n.desc}</p>
              </div>
              <Toggle value={notifications[n.key]} onChange={()=>setNotifications(ns=>({...ns,[n.key]:!ns[n.key]}))} />
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl p-6" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Shield size={14}/>Security</h3>
        <div className="space-y-2">
          <button className="w-full text-left flex items-center justify-between p-3 rounded-xl transition-colors"
            style={{ background:'rgba(255,255,255,0.04)' }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.07)'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)'}>
            <div>
              <p className="text-sm font-medium text-white">Change Password</p>
              <p className="text-xs" style={{ color:'rgba(255,255,255,0.35)' }}>Last changed 90 days ago</p>
            </div>
            <span className="text-xs font-medium" style={{ color:'#5b6ef9' }}>Update →</span>
          </button>
          <button className="w-full text-left flex items-center justify-between p-3 rounded-xl transition-colors"
            style={{ background:'rgba(255,255,255,0.04)' }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.07)'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)'}>
            <div>
              <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
              <p className="text-xs" style={{ color:'rgba(255,255,255,0.35)' }}>Add extra security to your account</p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background:'rgba(245,158,11,0.12)', color:'#f59e0b' }}>Not enabled</span>
          </button>
        </div>
      </div>
    </div>
  );
}
