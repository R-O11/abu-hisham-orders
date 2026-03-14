import React from 'react';
import HomePage from './pages/HomePage';

export default function App() {
  const path = window.location.pathname;

  // Simple routing: /admin goes to admin, everything else goes to customer page
  if (path.startsWith('/admin')) {
    // Dynamic import for admin
    const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
    return (
      <React.Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Cairo', fontSize: '1.2rem', color: '#888' }}>
          جاري التحميل...
        </div>
      }>
        <AdminDashboard />
      </React.Suspense>
    );
  }

  return <HomePage />;
}
