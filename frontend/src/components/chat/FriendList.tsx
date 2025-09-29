"use client";
import React from 'react';
import { Avatar, TextField } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

export interface FriendPreview {
  id: string;
  name: string;
  avatar?: string;
  profile_pic?: string;
  lastMessage?: string;
  unread?: number;
}

interface FriendListProps {
  friends: FriendPreview[];
  activeFriendId?: string;
  onSelect: (id: string) => void;
}

// Sidebar list of friends for selecting a conversation
export const FriendList: React.FC<FriendListProps> = ({ friends, activeFriendId, onSelect }) => {
  const { authUser, onlineUsers } = useAuthStore();
  console.log('onlineUsers:', onlineUsers);
  return (
    <aside className="hidden md:flex w-64 flex-col min-h-0 border-r border-base-300 bg-base-100 h-full relative">
      <div className="p-3 border-b border-base-300 flex items-center gap-3">
        {/* Avatar on the left with tooltip above */}
        <div className="relative group">
          <Avatar
            size="sm"
            src={authUser?.profile_pic}
            name={authUser?.username || 'Me'}
            alt="My profile"
            fallback="initials"
            className="cursor-pointer"
          />
          {/* Hover card with username and email above the avatar */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50">
            <div className="w-56 rounded-xl shadow-2xl border border-base-300 bg-base-100 p-3">
              <div className="flex items-center gap-3">
                <Avatar
                  size="sm"
                  src={authUser?.profile_pic}
                  name={authUser?.username || 'Me'}
                  alt="My profile"
                  fallback="initials"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{authUser?.username || 'User'}</p>
                  <p className="text-xs text-base-content/60 truncate">{authUser?.email || 'email@example.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search input using custom TextField with search icon */}
        <div className="flex-1">
          <TextField
            size="sm"
            placeholder="Search"
            leftIcon={(
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
          />
        </div>
      </div>
      {/* Scrollable friend list */}
      <ul className="flex-1 min-h-0 overflow-y-auto scrollbar-theme">
        {friends.map(f => {
          const active = f.id === activeFriendId;
          const isOnline = onlineUsers.includes(f.id);
          return (
            <li key={f.id}>
              <button
                onClick={() => onSelect(f.id)}
                className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-base-200 transition-colors ${active ? 'bg-base-200/80 font-medium' : ''}`}
              >
                <div className="relative">
                  <Avatar
                    size="sm"
                    src={f.profile_pic}
                    name={f.name}
                    alt={f.name}
                    fallback="initials"
                    className={isOnline ? 'border-2 border-success' : ''}
                  />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-base-100 ${isOnline ? 'bg-success' : 'bg-base-300'}`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate leading-tight">{f.name}</p>
                  {f.lastMessage && (
                    <p className="text-xs text-base-content/60 truncate">{f.lastMessage}</p>
                  )}
                </div>
                {typeof f.unread === 'number' && f.unread > 0 && (
                  <span className="badge badge-primary badge-sm">{f.unread}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="absolute left-0 right-0 bottom-0 border-t border-base-300 text-xs text-base-content/60 flex items-center justify-center h-10 bg-base-100">
        {friends.length} friends
      </div>
    </aside>
  );
};
