import { useState, useEffect } from 'react';
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
import AIAutomation from './pages/AIAutomation';
import AIQualification from './pages/AIQualification';
import MeetingScheduler from './pages/MeetingScheduler';
import AIAssistant from './components/ui/AIAssistant';
import Login from './pages/Login';

function AppShellWithLogout({ onLogout }: { onLogout: () => void }) {
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
      <Sidebar onLogout={onLogout} />
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
            <Route path="/lead-scoring"      element={<LeadScoring />} />
            <Route path="/ai-automation"     element={<AIAutomation />} />
            <Route path="/ai-qualification"  element={<AIQualification />} />
            <Route path="/meetings"          element={<MeetingScheduler />} />
          </Routes>
        </main>
      </div>
      <Toasts />
      {showCmd && <CommandPalette />}
      <AIAssistant />
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('piq_auth') === 'true');
  const [demoDismissed, setDemoDismissed] = useState(false);
  const isDemo = localStorage.getItem('piq_demo') === 'true';

  const handleLogin = () => setAuthed(true);
  const handleLogout = () => {
    localStorage.removeItem('piq_auth');
    localStorage.removeItem('piq_demo');
    setAuthed(false);
  };

  if (!authed) {
    return (
      <ThemeProvider>
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AppProvider>
        <HashRouter>
          {isDemo && !demoDismissed && (
            <div style={{ background: '#5b6ef9', color: '#fff', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, position: 'relative', flexShrink: 0, zIndex: 100 }}>
              🎉 Demo Mode — You're viewing sample data. No real emails will be sent.
              <button onClick={() => setDemoDismissed(true)} style={{ position: 'absolute', right: 16, background: 'transparent', color: 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          )}
          <AppShellWithLogout onLogout={handleLogout} />
        </HashRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
