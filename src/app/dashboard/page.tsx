import type { Metadata } from 'next';
import DashboardComponent from './DashboardComponent';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard',
};

export default function Dashboard() {
  return <DashboardComponent />;
}
