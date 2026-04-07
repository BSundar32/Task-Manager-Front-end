import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import api from '../services/api';
import Button from '../components/common/Button';
import { getAvatarUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });

  const [notifications, setNotifications] = useState({
    emailOnTaskAssign: user?.notificationSettings?.emailOnTaskAssign ?? true,
    emailOnDeadline: user?.notificationSettings?.emailOnDeadline ?? true,
    emailOnComment: user?.notificationSettings?.emailOnComment ?? true,
    emailOnStatusChange: user?.notificationSettings?.emailOnStatusChange ?? true,
    deadlineReminderHours: user?.notificationSettings?.deadlineReminderHours ?? 24,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', profileData.name);
      fd.append('bio', profileData.bio);
      fd.append('notificationSettings', JSON.stringify(notifications));
      if (avatarFile) fd.append('avatar', avatarFile);

      const { data } = await usersAPI.updateProfile(fd);
      updateUser(data.user);
      setAvatarFile(null);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await usersAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      const { data } = await api.post('/test-email', { to: user.email });
      toast.success(`Test email sent to ${user.email} — check inbox & spam!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Test email failed — check server terminal for details');
    } finally {
      setTestingEmail(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  const ToggleSetting = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          value ? 'bg-primary-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile & Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-5">Personal Information</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img
              src={avatarPreview || getAvatarUrl(user?.avatar, user?.name)}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200"
            />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-1 capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-1">Email Notifications</h2>
        <p className="text-xs text-slate-500 mb-5">Choose which emails you'd like to receive</p>
        <div>
          <ToggleSetting
            label="Task Assigned"
            description="When a task is assigned to you"
            value={notifications.emailOnTaskAssign}
            onChange={(v) => setNotifications((p) => ({ ...p, emailOnTaskAssign: v }))}
          />
          <ToggleSetting
            label="Deadline Reminder"
            description={`${notifications.deadlineReminderHours}h before deadline`}
            value={notifications.emailOnDeadline}
            onChange={(v) => setNotifications((p) => ({ ...p, emailOnDeadline: v }))}
          />
          <ToggleSetting
            label="New Comments"
            description="When someone comments on your task"
            value={notifications.emailOnComment}
            onChange={(v) => setNotifications((p) => ({ ...p, emailOnComment: v }))}
          />
          <ToggleSetting
            label="Status Changes"
            description="When task status is updated"
            value={notifications.emailOnStatusChange}
            onChange={(v) => setNotifications((p) => ({ ...p, emailOnStatusChange: v }))}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Deadline reminder (hours before)
          </label>
          <select
            value={notifications.deadlineReminderHours}
            onChange={(e) => setNotifications((p) => ({ ...p, deadlineReminderHours: parseInt(e.target.value) }))}
            className={inputClass}
          >
            {[1, 2, 6, 12, 24, 48, 72].map((h) => (
              <option key={h} value={h}>{h} hour{h !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleSaveProfile} loading={saving}>Save Preferences</Button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-5">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
              placeholder="Enter current password"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
              placeholder="At least 6 characters"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="Re-enter new password"
              className={inputClass}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleChangePassword}
              loading={changingPassword}
              disabled={!passwords.currentPassword || !passwords.newPassword}
              variant="secondary"
            >
              Update Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
