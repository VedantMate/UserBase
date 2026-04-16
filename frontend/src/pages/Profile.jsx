import React, { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile } from '../api/users';
import { getApiErrorMessage } from '../utils/apiError';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
      setName(data.name);
    } catch (err) {
      setMessage({ text: 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const updates = { name };
      if (password) updates.password = password;
      const data = await updateMyProfile(updates);
      setProfile(data.user);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setPassword('');
    } catch (err) {
      setMessage({ text: getApiErrorMessage(err, 'Update failed'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-slate-600">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold">My profile</h1>
        
        {message.text && (
          <div className={`rounded-lg border px-3 py-2 mt-4 text-sm ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-3 mt-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={profile.email} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" disabled />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Role</label>
            <input value={profile.role} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm capitalize" disabled />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required 
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">New password (optional)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          
          <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60">
            {saving ? 'Saving...' : 'Update profile'}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Audit</h2>
        <div className="mt-2 text-sm text-slate-600 space-y-1">
          <p>Created: {new Date(profile.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(profile.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
