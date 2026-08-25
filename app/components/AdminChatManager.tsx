"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, 
  User, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Clock
} from "lucide-react";

interface ChatRoom {
  id: string;
  _id: string;
  participants: {
    userId: string;
    role: string;
    name: string;
  }[];
  messages: any[];
  lastMessage: {
    text: string;
    timestamp: string;
    senderId: string;
  } | null;
  unreadCount: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

export default function AdminChatManager() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({});
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    setToken(authToken);
    if (authToken) {
      fetchChatRooms(authToken);
      fetchUsers(authToken);
    }
  }, []);

  const fetchChatRooms = async (authToken: string) => {
    try {
      const res = await fetch('/api/chats/rooms', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatRooms(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async (authToken: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const toggleRoomExpand = (roomId: string) => {
    setExpandedRooms(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (user) return `${user.firstName} ${user.lastName}`;
    return userId === 'admin' ? 'Admin' : 'Unknown User';
  };

  const getRoomUser = (room: ChatRoom) => {
    const userParticipant = room.participants.find(p => p.role === 'user');
    if (userParticipant) {
      const user = users.find(u => u._id === userParticipant.userId);
      if (user) return user;
      return { _id: userParticipant.userId, firstName: userParticipant.name || 'User', lastName: '', email: '', username: '' };
    }
    return null;
  };

  const getRoomName = (room: ChatRoom) => {
    const user = getRoomUser(room);
    if (user) return `${user.firstName} ${user.lastName}`.trim() || user.username || user.email || 'Unknown User';
    return 'Unknown User';
  };

  const getMessageCount = (room: ChatRoom) => {
    return room.messages?.length || 0;
  };

  const getLastMessageTime = (room: ChatRoom) => {
    if (room.lastMessage?.timestamp) {
      return new Date(room.lastMessage.timestamp).toLocaleString();
    }
    return 'No messages';
  };

  const filteredRooms = chatRooms.filter(room => {
    const roomName = getRoomName(room).toLowerCase();
    const search = searchTerm.toLowerCase();
    return roomName.includes(search);
  });

  const handleDeleteRoom = (room: ChatRoom, user: User | null) => {
    setSelectedRoom(room);
    setSelectedUser(user);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedRoom || !token) return;
    
    setIsDeleting(true);
    setShowConfirm(false);
    
    try {
      const res = await fetch(`/api/chats/rooms/${selectedRoom.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        setNotification({
          type: 'success',
          message: `Chat with ${getRoomName(selectedRoom)} deleted successfully!`
        });
        // Remove from list
        setChatRooms(prev => prev.filter(r => r.id !== selectedRoom.id));
        setSelectedRoom(null);
        setSelectedUser(null);
      } else {
        const data = await res.json();
        setNotification({
          type: 'error',
          message: data.error || 'Failed to delete chat room'
        });
      }
    } catch (error) {
      console.error('Error deleting chat room:', error);
      setNotification({
        type: 'error',
        message: 'An error occurred while deleting this'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setSelectedRoom(null);
    setSelectedUser(null);
  };

  const clearNotification = () => {
    setNotification(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        <span className="ml-3 text-cyan-600">Opening chat rooms...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white/40 rounded-2xl shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-cyan-900">Manage Chat</h2>
          <p className="text-xs sm:text-sm text-cyan-600">
            {chatRooms.length} chat rooms • {chatRooms.reduce((sum, r) => sum + getMessageCount(r), 0)} total messages
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full bg-cyan-100/50 border border-cyan-200/30
              focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm text-cyan-900 placeholder:text-cyan-500 w-full sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 p-3 sm:p-4 rounded-xl flex items-center justify-between gap-2 ${
              notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-700' :
              notification.type === 'error' ? 'bg-red-500/20 text-red-700' :
              'bg-blue-500/20 text-blue-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
              {notification.type === 'error' && <XCircle className="h-5 w-5 flex-shrink-0" />}
              {notification.type === 'info' && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
              <span className="text-sm font-medium break-words">{notification.message}</span>
            </div>
            <button
              onClick={clearNotification}
              className="text-current opacity-70 hover:opacity-100 flex-shrink-0"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Rooms List */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-12 text-cyan-600">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-cyan-400/50" />
          <p className="text-sm font-medium">No chats found</p>
          <p className="text-xs">start conversations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRooms.map((room) => {
            const user = getRoomUser(room);
            const isExpanded = expandedRooms[room.id] || false;
            const messageCount = getMessageCount(room);
            
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/30 rounded-xl border border-cyan-200/30 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-white/20"
                  onClick={() => toggleRoomExpand(room.id)}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="bg-cyan-500/20 p-2 rounded-full flex-shrink-0">
                      <User className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-cyan-900 truncate text-sm sm:text-base">
                        {getRoomName(room)}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-cyan-600">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {messageCount} messages
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getLastMessageTime(room)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {messageCount > 0 && (
                      <span className="text-xs bg-cyan-500/20 text-cyan-700 px-2 py-0.5 rounded-full hidden sm:inline-block">
                        {messageCount}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRoom(room, user);
                      }}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors"
                      title="Delete this chat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-cyan-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-cyan-500" />
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-cyan-200/30 p-3 sm:p-4 bg-white/10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-cyan-500">Room ID</p>
                            <p className="text-cyan-900 font-mono text-xs truncate">{room.id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-cyan-500">Created</p>
                            <p className="text-cyan-900 text-sm">{new Date(room.createdAt).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-cyan-500">Last Activity</p>
                            <p className="text-cyan-900 text-sm">{new Date(room.updatedAt).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-cyan-500">Participants</p>
                            <p className="text-cyan-900 text-sm">
                              {room.participants.map(p => p.role === 'admin' ? 'Admin' : getRoomName(room)).join(' • ')}
                            </p>
                          </div>
                          {room.lastMessage && (
                            <div className="col-span-1 sm:col-span-2">
                              <p className="text-xs text-cyan-500">Last Message</p>
                              <p className="text-cyan-900 text-sm truncate">{room.lastMessage.text}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && selectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500/20 p-3 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-cyan-900">Delete this Chat History</h3>
                  <p className="text-sm text-cyan-600">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-cyan-800 mb-6">
                Are you sure you want to delete all messages between <strong>{getRoomName(selectedRoom)}</strong> and Admin?
                <br />
                <span className="text-sm text-cyan-600">
                  This will remove {getMessageCount(selectedRoom)} messages permanently.
                </span>
              </p>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 rounded-lg border border-cyan-200/50 text-cyan-700 hover:bg-cyan-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}