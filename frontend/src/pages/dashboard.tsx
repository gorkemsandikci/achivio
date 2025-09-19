import Head from 'next/head';
import MobileLayout from '../components/MobileLayout';
import GameDashboard from '../components/GameDashboard';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard - Achivio</title>
        <meta name="description" content="Your habit tracking dashboard" />
      </Head>

      <MobileLayout>
        <GameDashboard />
      </MobileLayout>
    </ProtectedRoute>
  );
}
