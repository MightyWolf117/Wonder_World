import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { TacticalCoreView } from './views/TacticalCoreView';
import { EgoSyncView } from './views/EgoSyncView';
import { DailyLifeView } from './views/DailyLifeView';
import { StoreView } from './views/StoreView';
import { HuntingZoneView } from './views/HuntingZoneView';
import { LairView } from './views/LairView';
import { DialogProvider } from './components/ui/DialogContext';
import { PassDayFAB } from './components/ui/PassDayFAB';
import './styles/global.css';

const GlobalWidgets: React.FC = () => {
  const location = useLocation();
  if (location.pathname === '/store') return null;
  return <PassDayFAB />;
};

const App: React.FC = () => {
  return (
    <DialogProvider>
      <Router>
        <GlobalWidgets />
        <Routes>
          <Route path="/" element={<TacticalCoreView />} />
          <Route path="/ego" element={<EgoSyncView />} />
          <Route path="/daily-life" element={<DailyLifeView />} />
          <Route path="/store" element={<StoreView />} />
          <Route path="/hunting" element={<HuntingZoneView />} />
          <Route path="/lair" element={<LairView />} />
        </Routes>
      </Router>
    </DialogProvider>
  );
};

export default App;
