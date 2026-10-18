import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import DriverDashboard from '../components/DriverDashboard';
import PassengerDashboard from '../components/PassengerDashboard';

/**
 * Main Dashboard Entry Point:
 * Automatically routes to the dedicated role-specific dashboard:
 * - Admin -> AdminDashboard
 * - Driver -> DriverDashboard
 * - Passenger -> PassengerDashboard
 */
const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'Driver') {
    return <DriverDashboard />;
  }

  if (user?.role === 'Passenger') {
    return <PassengerDashboard />;
  }

  // Default to Admin Dashboard
  return <AdminDashboard />;
};

export default Dashboard;
