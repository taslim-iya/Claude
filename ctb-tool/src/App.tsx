import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Itineraries from './pages/Itineraries';
import Templates from './pages/Templates';
import Support from './pages/Support';
import Experiences from './pages/Experiences';
import Content from './pages/Content';
import Tools from './pages/Tools';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/itineraries" element={<Itineraries />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/support" element={<Support />} />
        <Route path="/experiences" element={<Experiences />} />
        <Route path="/content" element={<Content />} />
        <Route path="/tools" element={<Tools />} />
      </Route>
    </Routes>
  );
}
