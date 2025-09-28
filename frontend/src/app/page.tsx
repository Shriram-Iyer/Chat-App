"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { FriendList, FriendPreview } from '@/components/chat/FriendList';
import { MessagePanel } from '@/components/chat/MessagePanel';
import { useSocialStore } from '@/stores/socialStore';
import { Skeleton } from '@/components/ui/Skeleton';

export default function HomePage() {
  useAuth();

  const {
    friends: storeFriends,
    fetchAllFriends,
    messages,
    fetchConversation,
    isFriendsFetching,
    isMessagesFetching,
    sendMessage,
    setSelectedFriendId,
    selectedFriendId
  } = useSocialStore();

  const friends: FriendPreview[] = useMemo(
    () => (storeFriends || []).map((u) => ({ id: u._id, name: u.username, profile_pic: u.profile_pic, status: u.status })),
    [storeFriends]
  );

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
    }
  }, [selectedFriendId, fetchConversation]);

  return (
    <div className="relative pt-[calc(var(--navbar-height,56px)+2px)] bg-base-200 h-screen">
      <div className="h-full min-h-0 flex w-full overflow-hidden bg-base-100">
        <div className="w-64 min-w-[16rem] max-w-xs border-r border-base-300 flex flex-col">
          {isFriendsFetching ? (
            <div className="p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 mb-4">
                  <Skeleton height={40} width={40} className="rounded-full" />
                  <div className="flex-1">
                    <Skeleton height={16} width={100} />
                    <Skeleton height={12} width={60} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <FriendList friends={friends} activeFriendId={selectedFriendId} onSelect={handleSelectFriend} />
          )}
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <MessagePanel
            activeFriendId={selectedFriendId}
            messages={messages}
            activeFriendName={activeFriend?.name}
            activeFriendStatus={activeFriend?.status}
            draft={draft}
            setDraft={setDraft}
            isMessagesFetching={isMessagesFetching}
            onSend={async (text, image, video) => {
              if (!selectedFriendId) return;
              await sendMessage(text, image, video);
              setDraft('');
            }}
          />
        </div>
      </div>
    </div>
  );
}
