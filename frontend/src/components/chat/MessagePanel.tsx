"use client";
import React, { useRef, useEffect } from 'react';
import { EmojiPicker } from '@/components/ui/EmojiPicker';
import { TextField } from '@/components/ui';
import { ChatMessage } from '@/types/message';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/components/AuthProvider';
import { useAuthStore } from '@/stores/authStore';
import Image from 'next/image';

interface MessagePanelProps {
  messages: Array<ChatMessage>;
  activeFriendId?: string;
  activeFriendName?: string;
  activeFriendStatus?: string;
  onSend: (text?: string, image?: string, video?: string) => void;
  draft: string;
  setDraft: (v: string) => void;
  isMessagesFetching?: boolean;
}

// Right-hand conversation area: header, messages, and composer
export const MessagePanel: React.FC<MessagePanelProps> = ({ messages, activeFriendId, activeFriendName, activeFriendStatus, onSend, draft, setDraft, isMessagesFetching }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = React.useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const toast = useToast();
  const { authUser } = useAuthStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePickImage = () => imageInputRef.current?.click();
  const handlePickVideo = () => videoInputRef.current?.click();

  const handleImageSelected = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast.error('Image must be less than 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setSelectedVideo(null); // Deselect any video
    };
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleVideoSelected = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    if (!file.type.startsWith('video/')) return;
    if (file.size > 100 * 1024 * 1024) { // 100MB
      toast.error('Video must be less than 100MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedVideo(reader.result as string);
      setSelectedImage(null); // Deselect any image
    };
    reader.readAsDataURL(file);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeImage = () => setSelectedImage(null);
  const removeVideo = () => setSelectedVideo(null);

  const handleEmojiSelect = (emoji: string) => {
    const input = inputRef.current;
    if (!input) {
      setDraft(draft + emoji);
      return;
    }
    const start = input.selectionStart ?? draft.length;
    const end = input.selectionEnd ?? draft.length;
    const newValue = draft.slice(0, start) + emoji + draft.slice(end);
    setDraft(newValue);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const handleSend = async () => {
    let text;
    if(draft){
      text = draft.trim();
    }
    if (!text && !selectedImage && !selectedVideo) return;
    onSend(text, selectedImage ?? undefined, selectedVideo ?? undefined);
    setSelectedImage(null);
    setSelectedVideo(null);
  };

  const hasActiveFriend = Boolean(activeFriendId ?? activeFriendName);

  return (
    <section className="flex-1 flex flex-col min-h-0 bg-base-100">
      <div className="h-14 border-b border-base-300 px-4 flex items-center gap-3">
        {hasActiveFriend ? (
          <>
            <div className="w-10 h-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center overflow-hidden">
              {activeFriendId && activeFriendName && (
                activeFriendStatus === 'Offline' ? (
                  <span className="text-lg">{activeFriendName.charAt(0)}</span>
                ) : (
                  <Image src={authUser?.profile_pic || '/default-avatar.png'} alt={activeFriendName} width={40} height={40} className="object-cover w-full h-full" />
                )
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium leading-none">{activeFriendName ?? 'Chat'}</span>
              <span className="text-xs text-base-content/60 capitalize">{activeFriendStatus}</span>
            </div>
          </>
        ) : (
          <span className="text-sm text-base-content/60">No friend selected</span>
        )}
      </div>
      {!hasActiveFriend ? (
        <div className="flex-1 grid place-items-center bg-base-200/40">
          <div className="text-center px-6">
            <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-base-300/60 grid place-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-base-content/60">
                <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
              </svg>
            </div>
            <p className="text-base-content/70 font-medium">Select a friend to view messages</p>
            <p className="text-sm text-base-content/60 mt-1">Choose someone from the list to start chatting.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Message list */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-base-200/40">
            {isMessagesFetching ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm shadow chat-bubble space-y-2 ${i % 2 === 0 ? 'bg-primary/30' : 'bg-base-300/40 border border-base-300'}`}>
                    <div className="animate-pulse">
                      <div className="h-4 w-32 bg-base-300 rounded mb-2" />
                      <div className="h-2 w-16 bg-base-300 rounded" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {messages.map(m => {
                  // If message is just sent, sender may be 'me' or authUser._id
                  const mine = authUser && (m.sender_id === authUser._id || m.sender_id === authUser._id); ;
                  return (
                    <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm shadow chat-bubble space-y-2 ${mine ? 'bg-primary text-primary-content' : 'bg-base-100 border border-base-300'}`}>
                        {m.image && (
                          <div className="overflow-hidden rounded-md max-w-xs">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={m.image} alt="shared image" className="object-cover rounded-md max-h-60" />
                          </div>
                        )}
                        {m.video && (
                          <div className="overflow-hidden rounded-md max-w-xs">
                            <video controls className="rounded-md max-h-60">
                              <source src={m.video} />
                            </video>
                          </div>
                        )}
                        {m.text && (
                          <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        )}
                        <span className="block mt-1 text-[10px] opacity-60 text-right">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
                {!messages.length && (
                  <p className="text-xs text-base-content/50 text-center mt-8">No messages yet. Say hi 👋</p>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>
          {/* Composer */}
          <div className="border-t border-base-300 p-3 bg-base-100 relative">
            <EmojiPicker
              isOpen={showEmojiPicker}
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
            {(selectedImage || selectedVideo) && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedImage && (
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-base-200 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedImage} alt="selected" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }} />
                    </div>
                    <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-error opacity-100 transition-opacity">×</button>
                  </div>
                )}
                {selectedVideo && (
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-base-200 flex items-center justify-center">
                      <video className="w-full h-full object-cover">
                        <source src={selectedVideo} />
                      </video>
                    </div>
                    <button type="button" onClick={removeVideo} className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-error opacity-100 transition-opacity">×</button>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-end gap-2">
              <input
                ref={imageInputRef}
                type="file"
                hidden
                accept="image/*"
                multiple={false}
                onChange={e => handleImageSelected(e.target.files)}
              />
              <input
                ref={videoInputRef}
                type="file"
                hidden
                accept="video/*"
                multiple={false}
                onChange={e => handleVideoSelected(e.target.files)}
              />
              <div className="dropdown dropdown-top">
                <button tabIndex={0} type="button" className="btn btn-ghost btn-circle" aria-label="Add attachment" disabled={!hasActiveFriend}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                </button>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow border border-base-300">
                  <li>
                    <button onClick={handlePickImage} disabled={!!selectedImage || !!selectedVideo} className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      Image
                    </button>
                  </li>
                  <li>
                    <button onClick={handlePickVideo} disabled={!!selectedImage || !!selectedVideo} className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
                      Video
                    </button>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-circle"
                aria-label="Add emoji"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={!hasActiveFriend}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </button>
              <div className="flex-1">
                <TextField
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  className="w-full"
                  placeholder={hasActiveFriend ? `Type a message...` : 'Select a friend to start chatting'}
                  value={draft}
                  disabled={!hasActiveFriend}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    const ke = e as React.KeyboardEvent<HTMLInputElement>;
                    if (ke.key === 'Enter' && !ke.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  size="md"
                />
              </div>
              <button
                aria-label="Send message"
                className="btn btn-primary btn-circle shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleSend}
                disabled={(!draft.trim() && !selectedImage && !selectedVideo) || !hasActiveFriend}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
