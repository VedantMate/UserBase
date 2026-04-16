import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="text-lg font-semibold">User Management</div>

          <nav className="flex items-center gap-2 text-sm">
            <Link to="/dashboard" className="rounded-md px-3 py-1.5 hover:bg-slate-100">Dashboard</Link>
            <Link to="/profile" className="rounded-md px-3 py-1.5 hover:bg-slate-100">Profile</Link>
            <button
              onClick={handleLogout}
              className="rounded-md px-3 py-1.5 text-red-700 hover:bg-red-50"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-slate-600">
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
          Signed in as {user?.email} ({user?.role})
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 pb-8 flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        © 2026 Purple Merit Technologies
      </footer>
    </div>
  );
};

export default Layout;
