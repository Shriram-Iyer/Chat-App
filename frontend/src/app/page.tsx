/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { FriendList, FriendPreview } from '@/components/chat/FriendList';
import { MessagePanel } from '@/components/chat/MessagePanel';
import { useSocialStore } from '@/stores/socialStore';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/authStore';
function HomePage() {
  useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    friends: storeFriends,
    fetchAllFriends,
    messages,
    fetchConversation,
    isFriendsFetching,
    isMessagesFetching,
    sendMessage,
    setSelectedFriendId,
    selectedFriendId,
    subscribeToNewMessages,
    unSubscribeFromNewMessages,
  } = useSocialStore();

  const { onlineUsers } = useAuthStore();
  const friends: FriendPreview[] = (storeFriends || [])
    .map((u) => ({
      id: u._id,
      name: u.username,
      profile_pic: u.profile_pic,
      status: onlineUsers.includes(u._id) ? 'online' : 'offline'
    }));

  const [draft, setDraft] = useState('');

  const activeFriend = useMemo(() => friends.find((f) => f.id === selectedFriendId), [friends, selectedFriendId]);

  const handleSelectFriend = useCallback((id: string) => {
    setSelectedFriendId(id);
    fetchConversation(id);
  }, [setSelectedFriendId, fetchConversation]);

  useEffect(() => {
    fetchAllFriends();
  }, [fetchAllFriends]);

  useEffect(() => {
    if (selectedFriendId) {
      fetchConversation(selectedFriendId);
      subscribeToNewMessages();
    }
    return () => {
      unSubscribeFromNewMessages();
    }
  }, [selectedFriendId, fetchConversation, subscribeToNewMessages, unSubscribeFromNewMessages, onlineUsers]);

  return (
    <div className="relative pt-[calc(var(--navbar-height,56px)+2px)] bg-base-200 h-screen">
      <div className="h-full min-h-0 flex w-full overflow-hidden bg-base-100">
        {/* Sidebar as drawer on mobile, always visible on md+ */}
        {/* Mobile drawer */}
        <div>
          {/* Overlay for mobile drawer */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}
          {/* Drawer itself */}
          <div
            className={
              `fixed inset-y-0 left-0 z-40 w-64 max-w-full bg-base-100 border-r border-base-300 flex flex-col h-full overflow-y-auto transition-transform duration-300 md:static md:z-0 md:flex md:w-64 md:min-w-[16rem] md:max-w-xs md:translate-x-0` +
              (sidebarOpen ? ' translate-x-0' : ' -translate-x-full') +
              ' md:translate-x-0'
            }
            style={{ boxShadow: sidebarOpen ? '0 0 0 9999px rgba(0,0,0,0.3)' : undefined }}
          >
            {/* Close button on mobile */}
            <div className="md:hidden flex justify-end p-2">
              <button className="btn btn-sm btn-circle" onClick={() => setSidebarOpen(false)} aria-label="Close friends list">
                ×
              </button>
            </div>
            {isFriendsFetching ? (
              <div className="p-2 md:p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                    <Skeleton height={40} width={40} className="rounded-full" />
                    <div className="flex-1">
                      <Skeleton height={16} width={60} />
                      <Skeleton height={12} width={40} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <FriendList friends={friends} activeFriendId={selectedFriendId} onSelect={id => { handleSelectFriend(id); setSidebarOpen(false); }} />
            )}
          </div>
        </div>
        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-h-0">
          <MessagePanel
            activeFriendId={selectedFriendId}
            messages={messages}
            activeFriendName={activeFriend?.name}
            activeFriendProfilePic={activeFriend?.profile_pic}
            draft={draft}
            setDraft={setDraft}
            isMessagesFetching={isMessagesFetching}
            onSend={async (text, image, video) => {
              if (!selectedFriendId) return;
              await sendMessage(text, image, video);
              setDraft('');
            }}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
