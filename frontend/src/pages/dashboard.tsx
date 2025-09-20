import Head from 'next/head';
import MobileLayout from '../components/MobileLayout';
import GameDashboard from '../components/GameDashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import ResponsiveContainer from '../components/ResponsiveContainer';
import LogoHeader from '../components/LogoHeader';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard - Achivio</title>
        <meta name="description" content="Your habit tracking dashboard" />
      </Head>

      <ResponsiveContainer>
        <MobileLayout>
          <LogoHeader />
          <GameDashboard />
        </MobileLayout>
      </ResponsiveContainer>
    </ProtectedRoute>
  );
}
