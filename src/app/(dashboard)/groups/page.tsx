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
  Send, ArrowLeft, Shield, Info, IndianRupee
} from 'lucide-react';

export default function GroupsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [myGroups, setMyGroups] = useState<GameGroup[]>([]);
  const [openGroups, setOpenGroups] = useState<GameGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'browse'>('my');
  const [shareModal, setShareModal] = useState<GameGroup | null>(null);

  // Selected Chatroom Group
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
      const senderName = profile?.username || user.displayName || 'User';
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
      await joinGroup(group.id, user!.uid, profile?.username || 'User');
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

  // Render Discord-inspired split view if group is selected
  if (chatGroup) {
    const isFull = chatGroup.members.length >= chatGroup.maxPlayers;
    const fillPct = (chatGroup.members.length / chatGroup.maxPlayers) * 100;

    return (
      <div className="h-[calc(100vh-120px)] flex flex-col border border-[var(--color-bg-border)] bg-[var(--color-bg-card)] rounded-xl overflow-hidden animate-fade-in">
        
        {/* Top Header Row */}
        <div className="px-6 py-4 border-b border-[var(--color-bg-border)] bg-[var(--color-bg-raised)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setChatGroup(null)}
              className="p-1.5 rounded-lg border border-[var(--color-bg-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-2)] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-4.5 h-4.5 text-[var(--color-accent)]" />
                {chatGroup.gameName}
              </h2>
              <p className="text-[10px] text-[var(--color-text-3)] font-semibold uppercase mt-0.5 tracking-wide">
                Group ID: {chatGroup.id.slice(0, 8)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShareModal(chatGroup)}
              icon={<Link2 className="w-3.5 h-3.5" />}
              className="border border-[var(--color-bg-border)] hover:bg-white/[0.02]"
            >
              Invite
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleLeave(chatGroup)}
              icon={<UserMinus className="w-3.5 h-3.5" />}
            >
              Leave
            </Button>
          </div>
        </div>

        {/* 3-Column Discord Layout */}
        <div className="flex-1 flex min-h-0">
          
          {/* Column 1: Members (Left) */}
          <div className="w-56 border-r border-[var(--color-bg-border)] bg-[var(--color-bg-raised)]/60 flex flex-col p-4 space-y-4 shrink-0 hidden md:flex">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-3)]">
              Members ({chatGroup.members.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {chatGroup.memberNames.map((name, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.02] text-xs font-semibold text-[var(--color-text-2)]"
                >
                  <div className="relative shrink-0">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] flex items-center justify-center text-[10px] font-bold text-[var(--color-accent)]">
                      {name[0]?.toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[var(--color-green)] border border-[var(--color-bg-card)] rounded-full" />
                  </div>
                  <span className="truncate flex-1 text-white">{name}</span>
                  {chatGroup.createdBy === chatGroup.members[i] && (
                    <Crown className="w-3.5 h-3.5 text-[var(--color-yellow)] shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Chat Box (Center) */}
          <div className="flex-1 flex flex-col min-w-0 bg-black/[0.04]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <MessageCircle className="w-8 h-8 text-[var(--color-text-3)] mb-2" />
                  <p className="text-xs font-semibold text-[var(--color-text-3)] uppercase tracking-wider">No messages yet</p>
                  <p className="text-[10px] text-[var(--color-text-3)]/60 max-w-xs mt-1">Send a message to coordinate the cost split and finalize the purchase.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.uid;
                  const initials = msg.senderName[0]?.toUpperCase() || '?';
                  return (
                    <div key={i} className={`flex gap-3 items-start ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <div className="w-7 h-7 rounded bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] flex items-center justify-center text-[10px] font-bold text-[var(--color-accent)] shrink-0 select-none">
                          {initials}
                        </div>
                      )}
                      <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-3)]">
                          <span className={isMe ? "text-[var(--color-accent)]" : "text-white"}>{msg.senderName}</span>
                          <span>·</span>
                          <span>Active</span>
                        </div>
                        <div className={`text-xs px-3.5 py-2 rounded-lg border ${
                          isMe 
                            ? 'bg-[var(--color-accent)] text-white border-transparent rounded-tr-none' 
                            : 'bg-[var(--color-bg-card)] text-white border-[var(--color-bg-border)] rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                      {isMe && (
                        <div className="w-7 h-7 rounded bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] flex items-center justify-center text-[10px] font-bold text-[var(--color-accent)] shrink-0 select-none">
                          {initials}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--color-bg-border)] bg-[var(--color-bg-card)] flex gap-2 shrink-0">
              <input
                type="text"
                placeholder="Message your group..."
                value={newMessageText}
                onChange={e => setNewMessageText(e.target.value)}
                className="hud-input flex-1 text-xs bg-[var(--color-bg-raised)]"
                maxLength={300}
                required
              />
              <Button
                type="submit"
                loading={sendingMessage}
                variant="primary"
                size="sm"
                icon={<Send className="w-3.5 h-3.5" />}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-brand-600)] shrink-0"
              >
                Send
              </Button>
            </form>
          </div>

          {/* Column 3: Group Details (Right) */}
          <div className="w-64 border-l border-[var(--color-bg-border)] bg-[var(--color-bg-raised)]/60 p-4 space-y-6 shrink-0 hidden lg:flex flex-col">
            
            {/* Status Info */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-3)]">
                Details
              </h3>
              
              <div className="p-3 bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] rounded-lg space-y-3">
                <div>
                  <span className="text-[9px] text-[var(--color-text-3)] uppercase tracking-wider font-semibold">Purchase Status</span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isFull ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-xs font-bold text-white">
                      {isFull ? 'Group Ready' : 'Looking for Players'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-[var(--color-text-3)] uppercase tracking-wider font-semibold">Slots Remaining</span>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {chatGroup.maxPlayers - chatGroup.members.length} / {chatGroup.maxPlayers} Left
                  </p>
                </div>
              </div>
            </div>

            {/* Split Breakdown */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-3)]">
                Split Calculator
              </h3>
              <div className="p-3 bg-[var(--color-bg-card)] border border-[var(--color-bg-border)] rounded-lg space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--color-text-3)] font-medium">Game Total</span>
                  <span className="text-white font-bold">₹2,499</span>
                </div>
                <div className="h-px bg-[var(--color-bg-border)]" />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--color-text-3)] font-medium">Split Share</span>
                  <span className="text-[var(--color-accent-light)] font-bold">₹{Math.round(2499 / chatGroup.maxPlayers)}</span>
                </div>
              </div>
            </div>

            {/* Platform Trust */}
            <div className="mt-auto p-3 bg-white/[0.01] border border-dashed border-[var(--color-bg-border)] rounded-lg flex gap-2">
              <Shield className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[var(--color-text-3)] leading-relaxed font-semibold">
                Settle checkout splits directly with players. Settle via Steam Family sharing.
              </p>
            </div>
          </div>

        </div>

        {/* ── Share Modal inside the chat split view ── */}
        <Modal isOpen={!!shareModal} onClose={() => setShareModal(null)} title="Invite players" size="md">
          {shareModal && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--color-text-2)] mb-2">
                Share this group link to match with players for <strong className="text-white">{shareModal.gameName}</strong>.
              </p>

              {[
                { href: generateWhatsAppLink(shareModal.gameName, shareModal.id), label: 'WhatsApp', sub: 'Send invitation link', color: '#25D366', bg: 'rgba(37,211,102,0.06)', border: 'rgba(37,211,102,0.12)' },
                { href: generateDiscordInfo(shareModal.gameName).url, label: 'Discord', sub: 'Join Discord channel', color: '#5865F2', bg: 'rgba(88,101,242,0.06)', border: 'rgba(88,101,242,0.12)' },
                { href: generateTelegramLink(shareModal.gameName), label: 'Telegram', sub: 'Post to Telegram channel', color: '#2AABEE', bg: 'rgba(42,171,238,0.06)', border: 'rgba(42,171,238,0.12)' },
              ].map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-white/[0.02] transition-all"
                  style={{ background: item.bg, borderColor: item.border }}
                >
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: item.color + '15', color: item.color }}>
                    {item.label[0]}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{item.label}</p>
                    <p className="text-[10px] text-[var(--color-text-3)] font-medium mt-0.5">{item.sub}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--color-text-3)]" />
                </a>
              ))}

              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-raised)] border border-[var(--color-bg-border)]">
                <div>
                  <p className="text-[9px] text-[var(--color-text-3)] font-semibold uppercase tracking-wide">Group Link ID</p>
                  <p className="text-xs font-mono text-white mt-0.5">{shareModal.id}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyGroupId(shareModal.id)} icon={<Copy className="w-3.5 h-3.5" />} />
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Users className="w-5 h-5 text-[var(--color-accent)]" />
            Your Groups
          </h1>
          <p className="text-xs text-[var(--color-text-3)] font-medium mt-1">
            Browse open splits or coordinate checkout lists with active groups.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg w-fit bg-[var(--color-bg-raised)] border border-[var(--color-bg-border)]">
        {[
          { key: 'my', label: `My Groups (${myGroups.length})` },
          { key: 'browse', label: `Browse Splits (${openGroups.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all font-subheading ${
              activeTab === tab.key
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-[var(--color-text-3)] hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-44 w-full" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="p-10 text-center border border-[var(--color-bg-border)] bg-[var(--color-bg-card)] rounded-xl">
          <Users className="w-8 h-8 text-[var(--color-text-3)] mx-auto mb-3" />
          <p className="text-sm font-bold text-white mb-1">
            {activeTab === 'my' ? 'No groups found' : 'No open splits found'}
          </p>
          <p className="text-xs text-[var(--color-text-3)] mb-4 max-w-xs mx-auto">
            {activeTab === 'my'
              ? 'Add a game split group from matches or browse active listings.'
              : 'Waiting for players to create matching listings in your region.'}
          </p>
          {activeTab === 'my' && (
            <Button variant="secondary" size="sm" onClick={() => setActiveTab('browse')} className="border border-[var(--color-bg-border)] hover:bg-white/[0.02]">
              Browse Splits
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {groups.map(group => {
            const fillPct = (group.members.length / group.maxPlayers) * 100;
            const isFull  = group.members.length >= group.maxPlayers;
            return (
              <div key={group.id} className="p-5 flex flex-col gap-4 border border-[var(--color-bg-border)] bg-[var(--color-bg-card)] hover:border-white/[0.1] hover:bg-[var(--color-bg-hover)] transition-all rounded-xl relative overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-[var(--color-accent)]" />

                {/* Top Row */}
                <div className="flex items-start justify-between pl-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-4.5 h-4.5 text-[var(--color-accent)]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white leading-tight truncate max-w-[140px]">{group.gameName}</h3>
                      <div className="flex items-center gap-1 mt-0.5 text-[9px] text-[var(--color-text-3)] font-mono">
                        <Hash className="w-3 h-3" />
                        <span>{group.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={isFull ? 'success' : 'warning'}>
                    {isFull ? 'Full' : `${group.members.length}/${group.maxPlayers}`}
                  </Badge>
                </div>

                {/* Members list summary */}
                <div className="pl-1">
                  <p className="text-[9px] font-bold tracking-wider text-[var(--color-text-3)] uppercase mb-2">Members Joined</p>
                  <div className="flex flex-wrap gap-1">
                    {group.memberNames.map((name, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-white/[0.02] border border-[var(--color-bg-border)] text-white">
                        <span className="relative flex">
                          <span className="w-3.5 h-3.5 rounded-full bg-[var(--color-accent-dim)] text-[var(--color-accent)] flex items-center justify-center text-[8px] font-bold font-mono">
                            {name[0]?.toUpperCase()}
                          </span>
                        </span>
                        <span className="text-[var(--color-text-2)] font-semibold truncate max-w-[60px]">{name}</span>
                        {group.createdBy === group.members[i] && (
                          <Crown className="w-3 h-3 text-[var(--color-yellow)] shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="pl-1">
                  <div className="cap-bar">
                    <div
                      className={`cap-bar-fill ${isFull ? 'full' : ''}`}
                      style={{ width: `${Math.min(fillPct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-[var(--color-text-3)] font-semibold uppercase tracking-wider mt-1.5 font-subheading">
                    {group.members.length} of {group.maxPlayers} slots filled
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 pl-1">
                  {activeTab === 'my' ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setChatGroup(group)}
                        icon={<MessageCircle className="w-3.5 h-3.5" />}
                        className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-brand-600)] font-medium text-xs rounded-lg"
                      >
                        Enter Chat
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShareModal(group)}
                        icon={<Link2 className="w-3.5 h-3.5" />}
                        className="border border-[var(--color-bg-border)] hover:bg-white/[0.02]"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyGroupId(group.id)}
                        icon={<Copy className="w-3.5 h-3.5" />}
                        className="hover:bg-white/[0.02] text-[var(--color-text-3)]"
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
                      className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-brand-600)] text-white border-none font-medium text-xs"
                      disabled={isFull}
                    >
                      {isFull ? 'Group Full' : 'Join Group'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal inside groups list view */}
      <Modal isOpen={!!shareModal} onClose={() => setShareModal(null)} title="Invite players" size="md">
        {shareModal && (
          <div className="space-y-3">
            <p className="text-xs text-[var(--color-text-2)] mb-2">
              Invite players to join the <strong className="text-white">{shareModal.gameName}</strong> group split.
            </p>

            {[
              { href: generateWhatsAppLink(shareModal.gameName, shareModal.id), label: 'WhatsApp', sub: 'Send WhatsApp invitation', color: '#25D366', bg: 'rgba(37,211,102,0.06)', border: 'rgba(37,211,102,0.12)' },
              { href: generateDiscordInfo(shareModal.gameName).url, label: 'Discord', sub: 'Open Discord server details', color: '#5865F2', bg: 'rgba(88,101,242,0.06)', border: 'rgba(88,101,242,0.12)' },
              { href: generateTelegramLink(shareModal.gameName), label: 'Telegram', sub: 'Share via Telegram link', color: '#2AABEE', bg: 'rgba(42,171,238,0.06)', border: 'rgba(42,171,238,0.12)' },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-white/[0.02] transition-all"
                style={{ background: item.bg, borderColor: item.border }}
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: item.color + '15', color: item.color }}>
                  {item.label[0]}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">{item.label}</p>
                  <p className="text-[10px] text-[var(--color-text-3)] font-medium mt-0.5">{item.sub}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--color-text-3)]" />
              </a>
            ))}

            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-raised)] border border-[var(--color-bg-border)]">
              <div>
                <p className="text-[9px] text-[var(--color-text-3)] font-semibold uppercase tracking-wide">Group ID</p>
                <p className="text-xs font-mono text-white mt-0.5">{shareModal.id}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyGroupId(shareModal.id)} icon={<Copy className="w-3.5 h-3.5" />} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
