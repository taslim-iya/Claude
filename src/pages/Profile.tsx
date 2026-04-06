import { useState } from 'react';
import { Mail, Phone, Globe, Bell, Shield, Moon } from 'lucide-react';

export default function Profile() {
  const [name, setName] = useState('Sarah Miller');
  const [email, setEmail] = useState('sarah.miller@company.com');
  const [title, setTitle] = useState('VP of Sales');
  const [notifications, setNotifications] = useState({ email:true, slack:true, desktop:false, weekly:true });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-500">Manage your personal account settings.</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <h3 className="font-semibold text-gray-900 mb-4">Profile</h3>
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">SM</div>
          <div>
            <p className="font-semibold text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">Admin · Acme Sales Co</p>
          </div>
          <button className="ml-auto text-sm font-medium text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">Change Photo</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            {label:'Full Name', value:name, setter:setName, icon:null},
            {label:'Job Title', value:title, setter:setTitle, icon:null},
            {label:'Email', value:email, setter:setEmail, icon:Mail},
            {label:'Phone', value:'+1 (415) 555-0101', setter:()=>{}, icon:Phone},
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
              <input defaultValue={f.value} onChange={e=>f.setter(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          ))}
        </div>
        <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">Save Profile</button>
      </div>

      {/* Sender settings */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Mail size={15}/>Email Sender Settings</h3>
        <div className="space-y-4">
          {[
            {label:'From Name', placeholder:'Sarah Miller'},
            {label:'From Email', placeholder:'sarah@company.com'},
            {label:'Email Signature', placeholder:'Best,\nSarah Miller\nVP Sales | Acme Sales Co'},
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
              {f.label === 'Email Signature' ?
                <textarea rows={3} defaultValue="Best,\nSarah Miller\nVP Sales | Acme Sales Co" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" /> :
                <input placeholder={f.placeholder} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue={f.placeholder} />
              }
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Bell size={15}/>Notifications</h3>
        <div className="space-y-4">
          {[
            {key:'email' as const, label:'Email notifications', desc:'Get notified of replies and meetings via email'},
            {key:'slack' as const, label:'Slack notifications', desc:'Send alerts to your connected Slack workspace'},
            {key:'desktop' as const, label:'Desktop notifications', desc:'Browser push notifications for real-time alerts'},
            {key:'weekly' as const, label:'Weekly digest', desc:'Weekly summary of pipeline and campaign performance'},
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-800">{n.label}</p>
                <p className="text-xs text-gray-400">{n.desc}</p>
              </div>
              <button onClick={()=>setNotifications(ns=>({...ns,[n.key]:!ns[n.key]}))} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${notifications[n.key]?'bg-indigo-600':'bg-gray-200'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[n.key]?'translate-x-5':''}`}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Shield size={15}/>Security</h3>
        <div className="space-y-3">
          <button className="w-full text-left flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div><p className="text-sm font-medium text-gray-800">Change Password</p><p className="text-xs text-gray-400">Last changed 90 days ago</p></div>
            <span className="text-xs text-indigo-600 font-medium">Update →</span>
          </button>
          <button className="w-full text-left flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div><p className="text-sm font-medium text-gray-800">Two-Factor Authentication</p><p className="text-xs text-gray-400">Add extra security to your account</p></div>
            <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">Not enabled</span>
          </button>
        </div>
      </div>
    </div>
  );
}
