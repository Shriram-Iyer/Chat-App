"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar, Button } from '@/components/ui';
import { themedToast } from '@/lib/themed-toast';
import { useSocialStore } from '@/stores/socialStore';
import { useAuthStore } from '@/stores/authStore';

export default function SocialPage() {
  const [loading, setLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const { authUser } = useAuthStore();
  const {
    allUsers,
    friendRequestsSent: incoming, // incoming to me
    outgoingFriendRequests: outgoing, // requests I sent
    friends,
    fetchAllUsers,
    fetchFriendRequests,
    fetchOutgoingFriendRequests,
    fetchAllFriends,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useSocialStore();

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAllUsers(),
        fetchFriendRequests(),
        fetchOutgoingFriendRequests(),
        fetchAllFriends(),
      ]);
    } catch {
      themedToast.error('Failed to load social data');
    } finally {
      setLoading(false);
    }
  }, [fetchAllUsers, fetchFriendRequests, fetchOutgoingFriendRequests, fetchAllFriends]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const sendRequest = async (userId: string) => {
    try {
      setSendingTo(userId);
      await sendFriendRequest(userId);
      await Promise.all([fetchAllUsers(), fetchOutgoingFriendRequests()]);
    } catch {
      // store toasts on error
    } finally {
      setSendingTo(null);
    }
  };

  const accept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      await loadAll();
    } catch {
      // store toasts on error
    }
  };

  const reject = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      await loadAll();
    } catch {
      // store toasts on error
    }
  };

  // Build quick lookup helpers for buttons per user
  type IncomingWithIds = (typeof incoming)[number];
  type OutgoingWithIds = (typeof outgoing)[number] & { id?: string; _id?: string };

  const incomingByUsername = useMemo(() => {
    const map = new Map<string, IncomingWithIds>();
    for (const r of incoming) {
      if (r?.sender?.username) map.set(r.sender.username, r);
    }
    return map;
  }, [incoming]);

  const outgoingByRecipientId = useMemo(() => {
    const map = new Map<string, OutgoingWithIds>();
    for (const r of outgoing) {
      const rec = r as OutgoingWithIds;
      const id = rec?.recipient?._id;
      if (id) map.set(id, rec);
    }
    return map;
  }, [outgoing]);

  const friendsSet = useMemo(() => new Set(friends.map((f) => f._id)), [friends]);

  const visibleUsers = useMemo(
    () => allUsers.filter((u) => u._id !== authUser?._id),
    [allUsers, authUser?._id]
  );

  return (
    <div className="relative pt-[calc(var(--navbar-height,56px)+2px)] min-h-[calc(100vh-var(--navbar-height,56px)-2px)]">
      <div className="container mx-auto px-4 pb-6 space-y-6">
        <h1 className="text-2xl font-semibold">Social</h1>

        {/* Incoming Requests */}
        <section className="bg-base-100 border border-base-300 rounded-xl p-4">
          <h2 className="text-lg font-medium mb-4">Incoming Requests</h2>
          {loading ? (
            <div className="py-4 text-base-content/60">Loading…</div>
          ) : incoming.length === 0 ? (
            <div className="py-4 text-base-content/60">No incoming requests</div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {incoming.map((rec, idx) => {
                const reqId = rec.recipient_id;
                const pending = rec.status === 'pending';
                return (
                  <div key={reqId ?? idx} className="card bg-base-50 border border-base-300 rounded-xl shadow-sm w-fit">
                    <div className="card-body p-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" src={rec.sender.profile_pic} name={rec.sender.username} fallback="initials" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{rec.sender.username}</p>
                          <p className="truncate text-xs text-base-content/60">Incoming request</p>
                        </div>
                        {!pending && (
                          <span className={`badge badge-sm ${rec.status === 'accepted' ? 'badge-success' : 'badge-ghost'}`}>{rec.status}</span>
                        )}
                      </div>
                      {pending && (
                        <div className="mt-3 flex items-center gap-2">
                          <Button size="sm" onClick={() => reqId && accept(reqId)} disabled={loading || !reqId}>Accept</Button>
                          <Button size="sm" variant="ghost" onClick={() => reqId && reject(reqId)} disabled={loading || !reqId}>Reject</Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Outgoing Requests */}
        <section className="bg-base-100 border border-base-300 rounded-xl p-4">
          <h2 className="text-lg font-medium mb-4">Sent Requests</h2>
          {loading ? (
            <div className="py-4 text-base-content/60">Loading…</div>
          ) : outgoing.length === 0 ? (
            <div className="py-4 text-base-content/60">No sent requests</div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {outgoing.map((r) => {
                const rec = r as OutgoingWithIds;
                return (
                  <div key={rec.recipient._id} className="card bg-base-50 border border-base-300 rounded-xl shadow-sm w-fit">
                    <div className="card-body p-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" src={rec.recipient.profile_pic} name={rec.recipient.username} fallback="initials" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{rec.recipient.username}</p>
                          <p className="truncate text-xs text-base-content/60">{rec.recipient.email}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button size="sm" disabled className="btn-ghost">
                          {rec.status === 'pending' ? 'Pending' : rec.status === 'accepted' ? 'Accepted' : 'Rejected'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-base-100 border border-base-300 rounded-xl p-4">
          <h2 className="text-lg font-medium mb-4">All Users</h2>
          {loading ? (
            <div className="py-6 text-base-content/60">Loading…</div>
          ) : visibleUsers.length === 0 ? (
            <div className="py-6 text-base-content/60">No users available</div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {visibleUsers.map((u) => {
                const incomingReq = incomingByUsername.get(u.username);
                const incomingReqId = incomingReq?.recipient_id;
                const outgoingReq = outgoingByRecipientId.get(u._id);
                const outgoingStatus = outgoingReq?.status;
                const isFriend = friendsSet.has(u._id) || outgoingStatus === 'accepted' || incomingReq?.status === 'accepted';

                return (
                  <div key={u._id} className="card bg-base-50 border border-base-300 rounded-xl shadow-sm w-fit">
                    <div className="card-body p-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" src={u.profile_pic} name={u.username} fallback="initials" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{u.username}</p>
                          <p className="truncate text-xs text-base-content/60">{u.email}</p>
                          <span className={`text-xs ${u.status === 'online' ? 'text-success' : u.status === 'away' ? 'text-warning' : 'text-base-content/60'}`}>{u.status}</span>
                        </div>
                        {isFriend && <span className="badge badge-success badge-sm">Friends</span>}
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {incomingReq && incomingReq.status === 'pending' ? (
                          <>
                            <Button size="sm" onClick={() => incomingReqId && accept(incomingReqId)} disabled={!incomingReqId}>
                              Accept
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => incomingReqId && reject(incomingReqId)} disabled={!incomingReqId}>
                              Reject
                            </Button>
                          </>
                        ) : outgoingReq && outgoingStatus === 'pending' ? (
                          <Button size="sm" disabled className="btn-ghost">Pending</Button>
                        ) : isFriend ? (
                          <Button size="sm" disabled className="btn-ghost">Friends</Button>
                        ) : (
                          <Button size="sm" disabled={sendingTo === u._id} onClick={() => sendRequest(u._id)}>
                            {sendingTo === u._id ? 'Sending…' : 'Send Request'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
