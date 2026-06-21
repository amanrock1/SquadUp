'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getUserGroups, getAllFormingGroups, joinGroup, leaveGroup, subscribeToMessages, sendMessage } from '@/lib/db';
import { generateWhatsAppLink, generateDiscordInfo, generateTelegramLink } from '@/lib/links';
import type { GameGroup } from '@/lib/types';
import {
  Users, Gamepad2, UserPlus, UserMinus, Link2,
  MessageCircle, ExternalLink, Copy, Crown, Hash,
  Send, Info
} from 'lucide-react';

export default function GroupsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [myGroups, setMyGroups] = useState<GameGroup[]>([]);
  const [openGroups, setOpenGroups] = useState<GameGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'browse'>('my');
  const [shareModal, setShareModal] = useState<GameGroup | null>(null);

  // Chatroom
  const [chatGroup, setChatGroup] = useState<GameGroup | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) loadGroups(); }, [user]);

  useEffect(() => {
    if (!chatGroup) { setMessages([]); return; }
    const unsub = subscribeToMessages(chatGroup.id, setMessages);
    return () => unsub();
  }, [chatGroup]);

  useEffect(() => {
    if (chatGroup && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatGroup]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !chatGroup || !user) return;
    setSendingMessage(true);
    try {
      const senderName = profile?.username || user.displayName || 'Gamer';
      await sendMessage(chatGroup.id, user.uid, senderName, newMessageText.trim());
      setNewMessageText('');
    } catch { toast('error', 'Failed to send message'); }
    finally { setSendingMessage(false); }
  };

  const loadGroups = async () => {
    try {
      const [mine, open] = await Promise.all([getUserGroups(user!.uid), getAllFormingGroups()]);
      setMyGroups(mine);
      setOpenGroups(open.filter(g => !g.members.includes(user!.uid)));
    } catch { toast('error', 'Failed to load groups'); }
    finally { setLoading(false); }
  };

  const handleJoin = async (group: GameGroup) => {
    try {
      await joinGroup(group.id, user!.uid, profile?.username || 'Gamer');
      toast('success', `Joined ${group.gameName}!`);
      await loadGroups();
    } catch (err: any) { toast('error', err?.message || 'Failed to join'); }
  };

  const handleLeave = async (group: GameGroup) => {
    try {
      await leaveGroup(group.id, user!.uid);
      toast('info', `Left ${group.gameName}`);
      if (chatGroup?.id === group.id) setChatGroup(null);
      await loadGroups();
    } catch (err: any) { toast('error', err?.message || 'Failed to leave'); }
  };

  const copyGroupId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast('success', 'Copied!');
  };

  const groups = activeTab === 'my' ? myGroups : openGroups;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-blue)]" />
            Groups
          </h1>
          <p className="text-sm text-[var(--color-text-2)] mt-0.5">
            Join cost-split groups and play together.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: 'var(--color-bg-raised)' }}>
        {[
          { key: 'my', label: `My Groups (${myGroups.length})` },
          { key: 'browse', label: `Open (${openGroups.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[var(--color-bg-card)] text-white shadow-sm'
                : 'text-[var(--color-text-3)] hover:text-[var(--color-text-2)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Groups grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-44 w-full" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="hud-panel p-10 text-center">
          <Users className="w-10 h-10 text-[var(--color-text-3)] mx-auto mb-3" />
          <p className="font-semibold text-white mb-1">{activeTab === 'my' ? 'No groups yet' : 'No open groups'}</p>
          <p className="text-sm text-[var(--color-text-2)] mb-4">
            {activeTab === 'my'
              ? 'Create one from the Games page or browse open groups.'
              : 'Check back later — someone will form a group soon!'}
          </p>
          {activeTab === 'my' && (
            <Button variant="secondary" size="sm" onClick={() => setActiveTab('browse')}>
              Browse open groups
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {groups.map(group => {
            const fillPct = (group.members.length / group.maxPlayers) * 100;
            const isFull  = group.members.length >= group.maxPlayers;
            return (
              <div key={group.id} className="hud-panel p-5 flex flex-col gap-4">

                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-blue-dim)', border: '1px solid var(--color-blue-border)' }}>
                      <Gamepad2 className="w-5 h-5 text-[var(--color-blue)]" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-semibold text-white leading-tight">{group.gameName}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Hash className="w-3 h-3 text-[var(--color-text-3)]" />
                        <span className="text-[10px] text-[var(--color-text-3)] font-mono">{group.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={isFull ? 'success' : 'warning'}>
                    {isFull ? 'Full' : `${group.members.length}/${group.maxPlayers}`}
                  </Badge>
                </div>

                {/* Members */}
                <div>
                  <p className="text-[10px] font-medium text-[var(--color-text-3)] uppercase tracking-wide mb-2">Members</p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.memberNames.map((name, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]" style={{ background: 'var(--color-bg-hover)', border: '1px solid var(--color-bg-border)' }}>
                        <span className="w-4 h-4 rounded-full bg-[var(--color-accent-dim)] text-[var(--color-accent)] flex items-center justify-center text-[9px] font-bold">
                          {name[0]?.toUpperCase()}
                        </span>
                        <span className="text-[var(--color-text-1)]">{name}</span>
                        {group.createdBy === group.members[i] && (
                          <Crown className="w-2.5 h-2.5 text-[var(--color-yellow)]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="cap-bar">
                    <div
                      className={`cap-bar-fill ${isFull ? 'full' : ''}`}
                      style={{ width: `${Math.min(fillPct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[var(--color-text-3)] mt-1">
                    {group.members.length} of {group.maxPlayers} slots filled
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  {activeTab === 'my' ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setChatGroup(group)}
                        icon={<MessageCircle className="w-3.5 h-3.5" />}
                        className="flex-1"
                      >
                        Chat
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShareModal(group)}
                        icon={<Link2 className="w-3.5 h-3.5" />}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyGroupId(group.id)}
                        icon={<Copy className="w-3.5 h-3.5" />}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleLeave(group)}
                        icon={<UserMinus className="w-3.5 h-3.5" />}
                      />
                    </>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleJoin(group)}
                      icon={<UserPlus className="w-3.5 h-3.5" />}
                      className="flex-1"
                      disabled={isFull}
                    >
                      {isFull ? 'Group full' : 'Join group'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Share Modal ── */}
      <Modal isOpen={!!shareModal} onClose={() => setShareModal(null)} title="Share group" size="md">
        {shareModal && (
          <div className="space-y-3">
            <p className="text-sm text-[var(--color-text-2)] mb-2">
              Invite friends to join the <strong className="text-white">{shareModal.gameName}</strong> group.
            </p>

            {[
              { href: generateWhatsAppLink(shareModal.gameName, shareModal.id), label: 'WhatsApp', sub: 'Send via WhatsApp', color: '#25D366', bg: 'rgba(37,211,102,0.08)', border: 'rgba(37,211,102,0.2)' },
              { href: generateDiscordInfo(shareModal.gameName).url, label: 'Discord', sub: 'Open Discord group', color: '#5865F2', bg: 'rgba(88,101,242,0.08)', border: 'rgba(88,101,242,0.2)' },
              { href: generateTelegramLink(shareModal.gameName), label: 'Telegram', sub: 'Share on Telegram', color: '#2AABEE', bg: 'rgba(42,171,238,0.08)', border: 'rgba(42,171,238,0.2)' },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ background: item.bg, border: `1px solid ${item.border}` }}
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: item.color + '20', color: item.color }}>
                  {item.label[0]}
                </span>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-white">{item.label}</p>
                  <p className="text-[11px] text-[var(--color-text-3)]">{item.sub}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--color-text-3)]" />
              </a>
            ))}

            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--color-bg-hover)', border: '1px solid var(--color-bg-border)' }}>
              <div>
                <p className="text-[10px] text-[var(--color-text-3)] mb-0.5">Group ID</p>
                <p className="text-[12px] font-mono text-[var(--color-text-1)]">{shareModal.id}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyGroupId(shareModal.id)} icon={<Copy className="w-3.5 h-3.5" />} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Chatroom Modal ── */}
      <Modal
        isOpen={!!chatGroup}
        onClose={() => setChatGroup(null)}
        title={chatGroup ? `${chatGroup.gameName} — Group Chat` : 'Chat'}
        size="md"
      >
        {chatGroup && (
          <div className="flex flex-col" style={{ height: '420px' }}>
            {/* Info bar */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg mb-3 shrink-0" style={{ background: 'var(--color-bg-hover)', border: '1px solid var(--color-bg-border)' }}>
              <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-3)]">
                <Info className="w-3.5 h-3.5" />
                <span>{chatGroup.memberNames.join(', ')}</span>
              </div>
              <span className="text-[10px] font-semibold text-[var(--color-yellow)]">Messages expire in 2d</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-1 space-y-3 mb-3" style={{ minHeight: 0 }}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <MessageCircle className="w-8 h-8 text-[var(--color-text-3)] mb-2" />
                  <p className="text-sm text-[var(--color-text-3)]">No messages yet.</p>
                  <p className="text-[11px] text-[var(--color-text-4)] mt-1">Be the first to say something!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.uid;
                  const initials = msg.senderName[0]?.toUpperCase() || '?';
                  return (
                    <div key={i} className={`flex gap-3 items-end ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-blue-dim border border-blue-border flex items-center justify-center text-[11px] font-bold text-[var(--color-blue)] shrink-0 select-none">
                          {initials}
                        </div>
                      )}
                      <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-medium text-[var(--color-text-2)]">{msg.senderName}</span>
                        </div>
                        <div className={isMe ? 'chat-bubble-own' : 'chat-bubble-other'}>
                          {msg.text}
                        </div>
                      </div>
                      {isMe && (
                        <div className="w-8 h-8 rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] flex items-center justify-center text-[11px] font-bold text-[var(--color-accent)] shrink-0 select-none">
                          {initials}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
              <input
                type="text"
                placeholder="Type a message…"
                value={newMessageText}
                onChange={e => setNewMessageText(e.target.value)}
                className="hud-input flex-1"
                maxLength={300}
                required
              />
              <Button
                type="submit"
                loading={sendingMessage}
                variant="primary"
                size="sm"
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Send
              </Button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
