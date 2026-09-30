import React from 'react';
import { EnkaProvider, useEnka } from './context';
import { AppLayout } from './components/layout/AppLayout';
import { TodayView } from './features/today/TodayView';
import { CalendarView } from './features/calendar/CalendarView';
import { PlanningView } from './features/planning/PlanningView';
import { MoreView } from './features/more/MoreView';
import { CreateActivityModal } from './features/create/CreateActivityModal';
import './styles/global.css';

const MainRouter: React.FC = () => {
  const { currentTab } = useEnka();

  return (
    <AppLayout>
      {currentTab === 'today' && <TodayView />}
      {currentTab === 'calendar' && <CalendarView />}
      {currentTab === 'planning' && <PlanningView />}
      {currentTab === 'more' && <MoreView />}
      <CreateActivityModal />
    </AppLayout>
  );
};

export function App() {
  return (
    <EnkaProvider>
      <MainRouter />
    </EnkaProvider>
  );
}

export default App;
