import React from 'react';
import { AuthProvider, useAuth, EnkaProvider, useEnka } from './context';
import { LoginPage } from './features/auth/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { TodayView } from './features/today/TodayView';
import { CalendarView } from './features/calendar/CalendarView';
import { PlanningView } from './features/planning/PlanningView';
import { MoreView } from './features/more/MoreView';
import { CreateActivityModal } from './features/create/CreateActivityModal';
import { ActivityDetailModal } from './features/detail/ActivityDetailModal';
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
      <ActivityDetailModal />
    </AppLayout>
  );
};

const AuthGate: React.FC = () => {
  const { user, authChecked } = useAuth();

  if (!authChecked) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-canvas)',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '2px solid var(--border-default)',
            borderTopColor: 'var(--text-primary)',
          }}
          className="animate-spin"
        />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <EnkaProvider>
      <MainRouter />
    </EnkaProvider>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
