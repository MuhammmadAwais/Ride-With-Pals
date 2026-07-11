import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { SocketService } from '@/features/chat/services/socketService';
import type { ChatUser, ChatMessage } from '../utils/constants';

export const useChat = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [threads, setThreads] = useState<ChatUser[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Connect and Fetch Threads on Mount
  useEffect(() => {
    if (!user) return;

    // Connect socket
    SocketService.connect();

    // Fetch thread list
    const fetchThreads = async () => {
      try {
        const response = await SocketService.emitWithAck('chat:threads:list', { limit: 50, offset: 0 });
        const rows = response?.rows || [];

        const mappedThreads: ChatUser[] = rows.map((row: any) => {
          const oId = row.otherUser?.id || (row.userTwoId === user.id ? row.userOneId : row.userTwoId);
          const name = row.otherUser?.fullName || `User #${oId}`;
          const avatar = row.otherUser?.profileImage || `https://i.pravatar.cc/150?u=${oId}`;
          const lastMsg = row.lastMessage?.message || 'No messages yet';

          let timeStr = '';
          if (row.lastMessageAt) {
            const date = new Date(row.lastMessageAt);
            timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }

          return {
            id: row.id.toString(), // Use thread ID as the ChatUser id in our mapping
            name,
            avatar,
            isOnline: false, // Could be determined dynamically
            unreadCount: 0,
            lastMessage: lastMsg,
            lastMessageTime: timeStr,
          };
        });

        setThreads(mappedThreads);
      } catch (err) {
        console.error('Failed to load chat threads', err);
      }
    };

    fetchThreads();

    // Clean up socket listener for incoming threads could go here if needed.
  }, [user]);

  // 2. Load Messages when a Thread is selected
  useEffect(() => {
    if (!activeThreadId) return;

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        // Join thread explicitly
        await SocketService.emitWithAck('chat:thread:join', { threadId: parseInt(activeThreadId) });

        // List messages
        const res = await SocketService.emitWithAck('chat:messages:list', {
          threadId: parseInt(activeThreadId),
          limit: 100,
          offset: 0,
        });

        const rows = res?.rows || [];
        
        const msgs: ChatMessage[] = rows.map((row: any) => {
          const isMe = row.senderId === user?.id;
          return {
            id: row.id.toString(),
            senderId: isMe ? 'me' : row.senderId.toString(),
            type: 'text', // assuming all text for now
            content: row.message || '',
            timestamp: new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: row.isRead ? 'read' : 'delivered',
          };
        }).reverse(); // Reverse to get chronological order for chat UI

        setMessagesMap((prev) => ({
          ...prev,
          [activeThreadId]: msgs,
        }));

        // Mark as read
        await SocketService.emitWithAck('chat:thread:read', { threadId: parseInt(activeThreadId) });
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    return () => {
      // Leave thread when switching
      SocketService.emitWithAck('chat:thread:leave', { threadId: parseInt(activeThreadId) }).catch(() => {});
    };
  }, [activeThreadId, user]);

  // 3. Listen for Incoming Messages
  useEffect(() => {
    const handleNewMessage = (e: Event) => {
      const customEvent = e as CustomEvent;
      const data = customEvent.detail;
      const threadId = data.threadId?.toString();
      const msgNode = data.message;

      if (!threadId || !msgNode) return;

      const incomingMsg: ChatMessage = {
        id: msgNode.id.toString(),
        senderId: msgNode.senderId === user?.id ? 'me' : msgNode.senderId.toString(),
        type: 'text',
        content: msgNode.message || '',
        timestamp: new Date(msgNode.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: msgNode.isRead ? 'read' : 'delivered',
      };

      setMessagesMap((prev) => {
        const currentMsgs = prev[threadId] || [];
        // Prevent duplicates
        if (currentMsgs.some(m => m.id === incomingMsg.id)) return prev;
        
        return {
          ...prev,
          [threadId]: [...currentMsgs, incomingMsg],
        };
      });

      // Update the thread's last message
      setThreads((prevThreads) => 
        prevThreads.map((t) => 
          t.id === threadId 
            ? { ...t, lastMessage: incomingMsg.content, lastMessageTime: incomingMsg.timestamp } 
            : t
        )
      );
    };

    window.addEventListener('chat:message:new', handleNewMessage);
    return () => window.removeEventListener('chat:message:new', handleNewMessage);
  }, [user]);

  // 4. Send Message Function
  const sendMessage = useCallback(async (text: string) => {
    if (!activeThreadId || !text.trim()) return;

    try {
      const result = await SocketService.emitWithAck('chat:message:send', {
        threadId: parseInt(activeThreadId),
        message: text,
      });

      const sentMsg: ChatMessage = {
        id: result.id.toString(),
        senderId: 'me',
        type: 'text',
        content: result.message || text,
        timestamp: new Date(result.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };

      setMessagesMap((prev) => {
        const currentMsgs = prev[activeThreadId] || [];
        if (currentMsgs.some(m => m.id === sentMsg.id)) return prev;
        return {
          ...prev,
          [activeThreadId]: [...currentMsgs, sentMsg],
        };
      });

      setThreads((prevThreads) => 
        prevThreads.map((t) => 
          t.id === activeThreadId 
            ? { ...t, lastMessage: sentMsg.content, lastMessageTime: sentMsg.timestamp } 
            : t
        )
      );

    } catch (err) {
      console.error("Failed to send message", err);
    }
  }, [activeThreadId]);

  return {
    threads,
    messages: activeThreadId ? messagesMap[activeThreadId] || [] : [],
    activeThreadId,
    setActiveThreadId,
    sendMessage,
    isLoading,
  };
};
