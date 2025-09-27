"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { FriendList, FriendPreview } from '@/components/chat/FriendList';
import { MessagePanel, ChatMessage } from '@/components/chat/MessagePanel';
import { themedToast } from '@/lib/themed-toast';
import { messageApi } from '@/lib/api-config';
import type { UserResponse } from '@/types/user';
import { useSocialStore } from '@/stores/socialStore';

export default function HomePage() {
  // Top-level chat layout:
  // - Left: FriendList (selection)
  // - Right: MessagePanel (conversation + composer)
  // We intentionally do not pre-select a friend; the right panel stays empty
  // until the user chooses someone from the list.
  // Auth still can be referenced later for conditional logic if needed
  useAuth();

  const { friends: storeFriends, fetchAllFriends } = useSocialStore();
  const friends: FriendPreview[] = useMemo(
    () => (storeFriends as UserResponse[]).map((u) => ({ id: u._id, name: u.username, profile_pic: u.profile_pic })),
    [storeFriends]
  );

  // Start with no active friend; user must select one from the list
  const [activeFriendId, setActiveFriendId] = useState<string | undefined>(undefined);
  const [messagesByFriend, setMessagesByFriend] = useState<Record<string, ChatMessage[]>>({});
  const [draft, setDraft] = useState('');
  // Derive current friend and message list with memoization to avoid
  // unnecessary recalculations on unrelated state updates.
  const activeFriend = useMemo(() => friends.find((f) => f.id === activeFriendId), [friends, activeFriendId]);
  const friendMessages = useMemo(() => (activeFriendId ? (messagesByFriend[activeFriendId] || []) : []), [messagesByFriend, activeFriendId]);

  // Stable callback so FriendList doesn't re-render due to handler identity changes
  const handleSelectFriend = useCallback((id: string) => setActiveFriendId(id), []);

  // Load friends on mount via store
  useEffect(() => {
    fetchAllFriends();
  }, [fetchAllFriends]);

  // Load conversation whenever activeFriendId changes
  useEffect(() => {
    const loadConversation = async () => {
      if (!activeFriendId) return;
      try {
        const conv = await messageApi.getConversation(activeFriendId);
        const mapped: ChatMessage[] = conv.map((m) => ({
          id: m._id,
          from: m.sender_id === activeFriendId ? activeFriendId : 'me',
          text: m.text,
          image: m.image,
          video: m.video,
          created_at: new Date(m.created_at).getTime(),
          updated_at: new Date(m.updated_at).getTime(),
        }));
        setMessagesByFriend((prev) => ({ ...prev, [activeFriendId]: mapped }));
      } catch {
        themedToast.error('Failed to load messages');
      }
    };
    loadConversation();
  }, [activeFriendId]);
  return (
    <div className="relative pt-[calc(var(--navbar-height,56px)+2px)] bg-base-200 h-screen">
      <div className="h-full min-h-0 flex w-full overflow-hidden bg-base-100">
        <FriendList friends={friends} activeFriendId={activeFriendId} onSelect={handleSelectFriend} />
        <MessagePanel
          activeFriendId={activeFriendId}
          messages={friendMessages}
          activeFriendName={activeFriend?.name}
          activeFriendStatus={activeFriend?.status}
          draft={draft}
          setDraft={setDraft}
          onSend={(text) => {
            if (!activeFriendId) return; // no friend selected, ignore send
            // For now, send text only. Image/video can be handled via upload endpoint and send URL.
            messageApi
              .sendMessage(activeFriendId, { text })
              .then((saved) => {
                const newMsg: ChatMessage = {
                  id: saved._id,
                  from: 'me',
                  text: saved.text,
                  image: saved.image,
                  video: saved.video,
                  created_at: new Date(saved.created_at).getTime(),
                  updated_at: new Date(saved.updated_at).getTime(),
                };
                setMessagesByFriend((prev) => ({
                  ...prev,
                  [activeFriendId]: [...(prev[activeFriendId] || []), newMsg],
                }));
                setDraft('');
              })
              .catch(() => {
                themedToast.error('Failed to send message');
              });
          }}
        />
      </div>
    </div>
  );
}
