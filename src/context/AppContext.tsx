import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  accounts as initAccounts, contacts as initContacts, campaigns as initCampaigns,
  opportunities as initOpportunities, tasks as initTasks, prospectLists as initLists,
  teamMembers as initTeam,
} from '../data/sampleData';
import type { Account, Contact, Campaign, Opportunity, Task, ProspectList, TeamMember } from '../types';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface Toast { id: string; type: ToastType; message: string; }
export interface Profile { name: string; email: string; title: string; phone: string; company: string; }

function ls<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function setLs(key: string, val: unknown) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

// Always wipe legacy demo data — bump version string to force re-clear
const DATA_VERSION = 'v4-live';
if (localStorage.getItem('piq_data_version') !== DATA_VERSION) {
  Object.keys(localStorage)
    .filter(k => k.startsWith('piq_') && k !== 'piq_auth')
    .forEach(k => localStorage.removeItem(k));
  localStorage.setItem('piq_data_version', DATA_VERSION);
}

type CrudOps<T> = { add(item: T): void; update(id: string, patch: Partial<T>): void; del(id: string): void; };

interface Ctx {
  accounts: Account[]; contacts: Contact[]; campaigns: Campaign[];
  opportunities: Opportunity[]; tasks: Task[]; lists: ProspectList[];
  team: TeamMember[];
  accountOps: CrudOps<Account>; contactOps: CrudOps<Contact>; campaignOps: CrudOps<Campaign>;
  opportunityOps: CrudOps<Opportunity>; taskOps: CrudOps<Task>; listOps: CrudOps<ProspectList>;
  integrations: Record<string, boolean>; currentPlan: string; profile: Profile;
  toasts: Toast[]; showCmd: boolean;
  addAccount(a: Account): void; updateAccount(id: string, p: Partial<Account>): void; deleteAccount(id: string): void;
  addContact(c: Contact): void; updateContact(id: string, p: Partial<Contact>): void; deleteContact(id: string): void;
  addCampaign(c: Campaign): void; updateCampaign(id: string, p: Partial<Campaign>): void; deleteCampaign(id: string): void;
  addOpportunity(o: Opportunity): void; updateOpportunity(id: string, p: Partial<Opportunity>): void; deleteOpportunity(id: string): void;
  addTask(t: Task): void; updateTask(id: string, p: Partial<Task>): void; deleteTask(id: string): void;
  addList(l: ProspectList): void; updateList(id: string, p: Partial<ProspectList>): void; deleteList(id: string): void;
  toggleIntegration(id: string): void; updateProfile(p: Partial<Profile>): void; setPlan(p: string): void;
  toast(type: ToastType, message: string): void; dismissToast(id: string): void; setShowCmd(v: boolean): void;
}

const AppCtx = createContext<Ctx>(null as any);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(() => ls('piq_accounts', initAccounts));
  const [team] = useState<TeamMember[]>(initTeam);
  const [contacts, setContacts] = useState<Contact[]>(() => ls('piq_contacts', initContacts));
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => ls('piq_campaigns', initCampaigns));
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => ls('piq_opportunities', initOpportunities));
  const [tasks, setTasks] = useState<Task[]>(() => ls('piq_tasks', initTasks));
  const [lists, setLists] = useState<ProspectList[]>(() => ls('piq_lists', initLists));
  const [integrations, setIntegrations] = useState<Record<string,boolean>>(() => ls('piq_integrations', {}));
  const [currentPlan, setCurrentPlan] = useState(() => ls('piq_plan', 'Starter'));
  const [profile, setProfile] = useState<Profile>(() => ls('piq_profile', { name:'', email:'', title:'', phone:'', company:'' }));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showCmd, setShowCmd] = useState(false);

  useEffect(() => setLs('piq_accounts', accounts), [accounts]);
  useEffect(() => setLs('piq_contacts', contacts), [contacts]);
  useEffect(() => setLs('piq_campaigns', campaigns), [campaigns]);
  useEffect(() => setLs('piq_opportunities', opportunities), [opportunities]);
  useEffect(() => setLs('piq_tasks', tasks), [tasks]);
  useEffect(() => setLs('piq_lists', lists), [lists]);
  useEffect(() => setLs('piq_integrations', integrations), [integrations]);
  useEffect(() => setLs('piq_plan', currentPlan), [currentPlan]);
  useEffect(() => setLs('piq_profile', profile), [profile]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), []);

  const crud = <T extends { id: string }>(set: React.Dispatch<React.SetStateAction<T[]>>, name: string) => ({
    add: (item: T) => { set(s => [item, ...s]); toast('success', `${name} created`); },
    update: (id: string, patch: Partial<T>) => { set(s => s.map(x => x.id === id ? { ...x, ...patch } : x)); toast('success', `${name} updated`); },
    del: (id: string) => { set(s => s.filter(x => x.id !== id)); toast('success', `${name} deleted`); },
  });

  const acc = crud<Account>(setAccounts, 'Account');
  const con = crud<Contact>(setContacts, 'Contact');
  const cam = crud<Campaign>(setCampaigns, 'Campaign');
  const opp = crud<Opportunity>(setOpportunities, 'Opportunity');
  const tsk = crud<Task>(setTasks, 'Task');
  const lst = crud<ProspectList>(setLists, 'List');

  return (
    <AppCtx.Provider value={{
      accounts, contacts, campaigns, opportunities, tasks, lists, team,
      accountOps: acc, contactOps: con, campaignOps: cam, opportunityOps: opp, taskOps: tsk, listOps: lst,
      integrations, currentPlan, profile, toasts, showCmd,
      addAccount: acc.add, updateAccount: acc.update, deleteAccount: acc.del,
      addContact: con.add, updateContact: con.update, deleteContact: con.del,
      addCampaign: cam.add, updateCampaign: cam.update, deleteCampaign: cam.del,
      addOpportunity: opp.add, updateOpportunity: opp.update, deleteOpportunity: opp.del,
      addTask: tsk.add, updateTask: tsk.update, deleteTask: tsk.del,
      addList: lst.add, updateList: lst.update, deleteList: lst.del,
      toggleIntegration: (id) => { setIntegrations(s => ({ ...s, [id]: !s[id] })); toast('success', integrations[id] ? 'Integration disconnected' : 'Integration connected'); },
      updateProfile: (p) => { setProfile(s => ({ ...s, ...p })); toast('success', 'Profile saved'); },
      setPlan: (p) => { setCurrentPlan(p); toast('success', `Switched to ${p} plan`); },
      toast, dismissToast, setShowCmd,
    }}>
      {children}
    </AppCtx.Provider>
  );
}
