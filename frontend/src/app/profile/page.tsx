'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { ProfileImageSelector } from '@/components/ui/ProfileImageSelector';
import { TextField, TextArea } from '@/components/ui';
import type { UpdateUserRequest } from '@/types/user';

export default function ProfilePage() {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [pendingPic, setPendingPic] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [about, setAbout] = useState<string>('');

  // Format date as mmm dd, yyyy (e.g., Sep 05, 2025)
  const formatDate = (input: string | number | Date): string => {
    const date = new Date(input);
    if (isNaN(date.getTime())) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const handleUpdateProfile = async (data: UpdateUserRequest) => {
    try {
      await updateProfile(data);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Initialize/sync local form state when authUser changes
  useEffect(() => {
    if (authUser) {
      setUsername(authUser.username || '');
      setAbout(authUser.about || '');
      // Reset pending preview when profile changes
      setPendingPic(authUser.profile_pic || '');
    }
  }, [authUser]);

  // After syncing local state, if still not authenticated, render nothing
  if (!authUser) return null; // AuthProvider will handle redirect

  return (
    <div className="relative pt-[calc(var(--navbar-height,56px)+2px)] h-screen bg-base-200">
      <div className="max-w-2xl mx-auto p-5 pt-6 md:pt-8">
        <div className="card bg-base-100 shadow-xl rounded-2xl">
          <div className="card-body p-5 gap-2">
            <h1 className="card-title text-3xl mb-1">Profile</h1>
            
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-2">
              <ProfileImageSelector
                value={pendingPic ?? authUser.profile_pic}
                name={authUser.username}
                onChange={(imageData) => {
                  if (typeof imageData === 'string') setPendingPic(imageData);
                }}
                size="xl"
              />
              <span className="text-xs text-base-content/60 mt-1">Preview updates before saving</span>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              {/* Username */}
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
                variant="outlined"
                size="md"
                className="rounded-full"
                style={{ borderRadius: '9999px' }}
                notched={false}
              />

              {/* Email (disabled) */}
              <TextField
                label="Email"
                type="email"
                value={authUser.email}
                disabled
                readOnly
                variant="outlined"
                size="md"
                className="rounded-full"
                style={{ borderRadius: '9999px' }}
                notched={false}
              />

              {/* About */}
              <TextArea
                label="About"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={3}
                variant="outlined"
                size="md"
              />

              {/* Member Since (disabled) */}
              <TextField
                label="Member Since"
                value={formatDate(authUser.created_at)}
                disabled
                readOnly
                variant="outlined"
                size="md"
                className="rounded-full"
                style={{ borderRadius: '9999px' }}
                notched={false}
              />
            </div>

            {/* Action Buttons */}
            <div className="card-actions justify-end mt-3">
              <button
                className="btn btn-primary"
                disabled={isUpdatingProfile}
                onClick={() =>
                  handleUpdateProfile({
                    username,
                    about,
                    // Only send pic if changed
                    ...(pendingPic ? { profile_pic: pendingPic } : {}),
                  })
                }
              >
                {isUpdatingProfile ? 'Saving…' : 'Edit Profile'}
              </button>
              <button className="btn btn-outline">Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}