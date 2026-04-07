import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import Toasts from './components/ui/Toast';
import CommandPalette from './components/ui/CommandPalette';

import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Accounts from './pages/Accounts';
import Contacts from './pages/Contacts';
import Lists from './pages/Lists';
import Campaigns from './pages/Campaigns';
import SequenceBuilder from './pages/SequenceBuilder';
import OutreachCenter from './pages/OutreachCenter';
import EmailAnalytics from './pages/EmailAnalytics';
import EmailHealth from './pages/EmailHealth';
import Pipeline from './pages/Pipeline';
import Tasks from './pages/Tasks';
import BounceManager from './pages/BounceManager';
import TeamSettings from './pages/TeamSettings';
import Integrations from './pages/Integrations';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import LeadScoring from './pages/LeadScoring';

function AppShell() {
  const { showCmd, setShowCmd } = useApp();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCmd(true);
      }
      if (e.key === 'Escape' && showCmd) setShowCmd(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showCmd, setShowCmd]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/leads"         element={<Leads />} />
            <Route path="/accounts"      element={<Accounts />} />
            <Route path="/contacts"      element={<Contacts />} />
            <Route path="/lists"         element={<Lists />} />
            <Route path="/campaigns"     element={<Campaigns />} />
            <Route path="/sequences"     element={<SequenceBuilder />} />
            <Route path="/outreach"      element={<OutreachCenter />} />
            <Route path="/analytics"     element={<EmailAnalytics />} />
            <Route path="/email-health"  element={<EmailHealth />} />
            <Route path="/pipeline"      element={<Pipeline />} />
            <Route path="/tasks"         element={<Tasks />} />
            <Route path="/bounces"       element={<BounceManager />} />
            <Route path="/team"          element={<TeamSettings />} />
            <Route path="/integrations"  element={<Integrations />} />
            <Route path="/billing"       element={<Billing />} />
            <Route path="/profile"       element={<Profile />} />
            <Route path="/lead-scoring"  element={<LeadScoring />} />
          </Routes>
        </main>
      </div>
      <Toasts />
      {showCmd && <CommandPalette />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <HashRouter>
          <AppShell />
        </HashRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
