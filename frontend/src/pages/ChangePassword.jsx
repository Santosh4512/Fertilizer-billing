import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const ChangePassword = () => {
  const { logout } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/change-password', { currentPassword, newPassword });
      setMessage(response.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to change password');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Change Password</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className="text-green-700 text-sm bg-green-50 p-4 rounded-md">
            {message}
            <p className="mt-2 text-xs">Logging out in a moment...</p>
          </div>
        )}
        {error && (
          <div className="text-red-700 text-sm bg-red-50 p-4 rounded-md">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            placeholder="Enter your current password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            placeholder="Enter your new password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            placeholder="Confirm your new password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-colors disabled:opacity-70"
        >
          {loading ? 'Changing password...' : 'Change Password'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        After changing your password, you will be logged out for security reasons.
      </p>
    </div>
  );
};

export default ChangePassword;
