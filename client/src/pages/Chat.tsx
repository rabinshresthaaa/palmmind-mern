import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';
import { Send, Users, MessageSquare, LogOut, Loader2, MessageCircle } from 'lucide-react';
import clsx from 'clsx';
import UsersManager from './UsersManager';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  content: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalChats: number;
}

const Chat: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalChats: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'users'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messagesRes, statsRes] = await Promise.all([
          api.get('/messages'),
          api.get('/stats')
        ]);
        setMessages(messagesRes.data.data);
        setStats(statsRes.data.data);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: { message: Message }) => {
      setMessages(prev => [...prev, data.message]);
      setStats(prev => ({ ...prev, totalChats: prev.totalChats + 1 }));
    };

    const handleUserJoin = (data: { user: any, message: string }) => {
      const systemMessage: Message = {
        _id: `sys-${Date.now()}`,
        sender: { _id: 'system', name: 'System', email: '' },
        content: data.message,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, systemMessage]);
    };

    const handleUserLeave = (data: { user: any, message: string }) => {
      const systemMessage: Message = {
        _id: `sys-${Date.now()}`,
        sender: { _id: 'system', name: 'System', email: '' },
        content: data.message,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, systemMessage]);
    };

    socket.on('message:receive', handleNewMessage);
    socket.on('user:join', handleUserJoin);
    socket.on('user:leave', handleUserLeave);

    return () => {
      socket.off('message:receive', handleNewMessage);
      socket.off('user:join', handleUserJoin);
      socket.off('user:leave', handleUserLeave);
    };
  }, [socket]);

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('message:send', { content: newMessage });
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  // Determine if two consecutive messages are from the same sender and close in time
  const isSameCluster = (index: number) => {
    if (index === 0) return false;
    const prev = messages[index - 1];
    const curr = messages[index];
    if (prev.sender._id === 'system' || curr.sender._id === 'system') return false;
    if (prev.sender._id !== curr.sender._id) return false;
    const timeDiff = new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime();
    return timeDiff < 60 * 1000; // within 1 minute = same cluster
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans">

      {/* Sidebar */}
      <div className="w-64 h-full border-r border-gray-200 bg-gray-50 flex-col hidden md:flex shrink-0">
        <div className="px-5 py-4 flex items-center space-x-3 border-b border-gray-200 bg-white">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Palmmind Chat</h1>
            <p className="text-[11px] text-gray-400">Workspace</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="p-3 space-y-0.5">
            <button
              onClick={() => setActiveTab('chat')}
              className={clsx(
                "w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === 'chat'
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <MessageCircle className={clsx("w-4 h-4 shrink-0", activeTab === 'chat' ? "text-primary-600" : "text-gray-400")} />
              <span>General Chat</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('users')}
                className={clsx(
                  "w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === 'users'
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Users className={clsx("w-4 h-4 shrink-0", activeTab === 'users' ? "text-primary-600" : "text-gray-400")} />
                <span>Manage Users</span>
              </button>
            )}
          </nav>

          <div className="mt-auto p-3 border-t border-gray-200 mx-2 mb-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Stats</p>
            <div className="space-y-1 px-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Users</span>
                <span className="text-xs font-semibold text-gray-800">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Messages</span>
                <span className="text-xs font-semibold text-gray-800">{stats.totalChats}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-3 py-3 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary-700">{user?.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <div className={clsx("w-1.5 h-1.5 rounded-full shrink-0", isConnected ? "bg-green-500" : "bg-red-400")} />
                  <p className="text-[11px] text-gray-400">{isConnected ? 'Online' : 'Offline'}</p>
                  {isAdmin && <span className="text-[10px] font-medium text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">Admin</span>}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'chat' ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-14 border-b border-gray-200 bg-white flex items-center px-6 shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <h2 className="text-sm font-semibold text-gray-800">General Chat</h2>
            </div>
          </div>

          {/* Messages - Messenger style */}
          <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
            <div className="flex flex-col space-y-0.5">
              {messages.map((msg, index) => {
                const isSystem = msg.sender._id === 'system';

                if (isSystem) {
                  return (
                    <div key={msg._id} className="flex justify-center py-3">
                      <span className="bg-gray-100 text-gray-500 text-[11px] px-3 py-1 rounded-full font-medium">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                const isMe = msg.sender._id === user?.id;
                const sameCluster = isSameCluster(index);
                const isLastInCluster = index === messages.length - 1
                  || messages[index + 1].sender._id !== msg.sender._id
                  || messages[index + 1].sender._id === 'system'
                  || (new Date(messages[index + 1].createdAt).getTime() - new Date(msg.createdAt).getTime()) >= 60 * 1000;

                const showName = !isMe && !sameCluster;
                const showAvatar = !isMe && isLastInCluster;

                // Add a top margin when a new cluster starts
                const topMargin = sameCluster ? "mt-0.5" : "mt-3";

                return (
                  <div key={msg._id} className={clsx("flex items-end gap-1.5", isMe ? "justify-end" : "justify-start", topMargin)}>

                    {/* Avatar — always reserves width; self-end so it sits at the bubble bottom */}
                    {!isMe && (
                      <div className="w-6 h-6 shrink-0 self-end">
                        {showAvatar ? (
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-gray-600">
                              {msg.sender.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div className={clsx("flex flex-col max-w-[65%]", isMe ? "items-end" : "items-start")}>
                      {showName && (
                        <span className="text-[11px] text-gray-400 font-medium mb-1 px-1">{msg.sender.name}</span>
                      )}
                      {/* Relative wrapper so timestamp floats below without affecting flex height */}
                      <div className="relative group">
                        <div
                          className={clsx(
                            "px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words",
                            isMe
                              ? [
                                  "bg-primary-600 text-white",
                                  sameCluster && isLastInCluster ? "rounded-2xl rounded-br-md" :
                                  sameCluster ? "rounded-2xl rounded-r-md" :
                                  isLastInCluster ? "rounded-2xl rounded-br-md" :
                                  "rounded-2xl rounded-r-md"
                                ]
                              : [
                                  "bg-gray-100 text-gray-900",
                                  sameCluster && isLastInCluster ? "rounded-2xl rounded-bl-md" :
                                  sameCluster ? "rounded-2xl rounded-l-md" :
                                  isLastInCluster ? "rounded-2xl rounded-bl-md" :
                                  "rounded-2xl rounded-l-md"
                                ]
                          )}
                        >
                          {msg.content}
                        </div>
                        {isLastInCluster && (
                          <span className={clsx(
                            "absolute top-full mt-0.5 text-[10px] text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity",
                            isMe ? "right-0" : "left-0"
                          )}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-2" />
            </div>
          </div>

          {/* Input Area */}
          <div className="px-6 py-4 bg-white border-t border-gray-200 shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 border border-transparent text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-300 transition-all"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="w-9 h-9 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:hover:bg-primary-600 transition-colors flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <UsersManager />
      )}
    </div>
  );
};

export default Chat;
