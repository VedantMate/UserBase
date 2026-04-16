import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createUser, deactivateUser, listUsers, updateUser } from '../api/users';
import { getApiErrorMessage } from '../utils/apiError';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active',
};

const Dashboard = () => {
  const { user } = useAuth();
  const isUserOnly = user?.role === 'user';

  if (isUserOnly) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Your role has profile access only. Open Profile to update your account.</p>
      </div>
    );
  }

  return <UserAdminPanel currentUser={user} />;
};

const UserAdminPanel = ({ currentUser }) => {
  const currentUserId = currentUser?.id || currentUser?.sub;
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('create');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saveError, setSaveError] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const queryParams = useMemo(() => {
    const params = { page, limit: 10 };
    if (search.trim()) params.search = search.trim();
    if (role) params.role = role;
    if (status) params.status = status;
    return params;
  }, [page, role, search, status]);

  useEffect(() => {
    void loadUsers();
  }, [queryParams]);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const response = await listUsers(queryParams);
      setItems(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load users.'));
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setMode('create');
    setEditingId(null);
    setForm(emptyForm);
    setSaveError('');
    setIsOpen(true);
  }

  function openEditModal(record) {
    setMode('edit');
    setEditingId(record.id);
    setForm({
      name: record.name || '',
      email: record.email || '',
      password: '',
      role: record.role || 'user',
      status: record.status || 'active',
    });
    setSaveError('');
    setIsOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError('');

    try {
      if (mode === 'create') {
        const payload = {
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
        };
        if (form.password) payload.password = form.password;
        await createUser(payload);
      } else {
        const payload = {
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
        };
        if (form.password) payload.password = form.password;
        await updateUser(editingId, payload);
      }

      setIsOpen(false);
      await loadUsers();
    } catch (err) {
      setSaveError(getApiErrorMessage(err, 'Could not save user.'));
    }
  }

  async function handleDeactivate(id) {
    const confirmDelete = window.confirm('Deactivate this user?');
    if (!confirmDelete) return;

    try {
      await deactivateUser(id);
      await loadUsers();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not deactivate user.'));
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl font-semibold">Users</h1>
          {isAdmin && (
            <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" onClick={openCreateModal}>
              New user
            </button>
          )}
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name/email"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />

          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex items-center justify-end text-sm text-slate-500">Total {total}</div>
        </div>

        {error && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Email</th>
              <th className="px-3 py-2 text-left font-medium">Role</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={5}>Loading...</td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={5}>No users found.</td>
              </tr>
            )}

            {!loading &&
              items.map((record) => (
                <tr key={record.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{record.name}</td>
                  <td className="px-3 py-2">{record.email}</td>
                  <td className="px-3 py-2 capitalize">{record.role}</td>
                  <td className="px-3 py-2 capitalize">{record.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                        onClick={() => openEditModal(record)}
                      >
                        Edit
                      </button>

                      {isAdmin && (
                        <button
                          className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                          onClick={() => handleDeactivate(record.id)}
                          disabled={currentUserId === record.id}
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          className="rounded border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Prev
        </button>
        <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
        <button
          className="rounded border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-lg">
            <h2 className="text-lg font-semibold">{mode === 'create' ? 'Create user' : 'Edit user'}</h2>

            {saveError && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</div>}

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Name"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />

              <input
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                type="email"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />

              <input
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder={mode === 'create' ? 'Password (optional)' : 'New password (optional)'}
                type="password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  disabled={!isAdmin}
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="rounded border border-slate-300 px-3 py-1.5 text-sm" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
