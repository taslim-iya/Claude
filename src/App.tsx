import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Accounts from './pages/Accounts';
import Contacts from './pages/Contacts';
import Lists from './pages/Lists';
import Campaigns from './pages/Campaigns';
import SequenceBuilder from './pages/SequenceBuilder';
import OutreachCenter from './pages/OutreachCenter';
import Pipeline from './pages/Pipeline';
import Tasks from './pages/Tasks';
import TeamSettings from './pages/TeamSettings';
import Integrations from './pages/Integrations';
import Billing from './pages/Billing';
import Profile from './pages/Profile';

type AppState = 'login' | 'onboarding' | 'app';

export default function App() {
  const [appState, setAppState] = useState<AppState>('login');

  if (appState === 'login') return <Login onLogin={() => setAppState('onboarding')} />;
  if (appState === 'onboarding') return <Onboarding onComplete={() => setAppState('app')} />;

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/sequence" element={<SequenceBuilder />} />
          <Route path="/outreach" element={<OutreachCenter />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/team" element={<TeamSettings />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
