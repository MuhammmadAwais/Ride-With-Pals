import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { SocketService } from '@/features/chat/services/socketService';
import type { ChatUser, ChatMessage } from '../utils/constants';

export const useChat = (initialTargetUserId?: number, initialTargetUserName?: string, initialTargetUserAvatar?: string) => {
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
        let initialThreadId = null;

        // If we have an initialTargetUserId, get or create the thread first
        if (initialTargetUserId) {
          try {
            const res = await SocketService.emitWithAck('chat:thread:getOrCreate', { targetUserId: initialTargetUserId });
            if (res?.id) {
              initialThreadId = res.id.toString();
            } else if (typeof res === 'number' || typeof res === 'string') {
              initialThreadId = res.toString();
            }
          } catch (createErr) {
            console.error('Failed to getOrCreate thread:', createErr);
          }
          
          // If we still don't have an initialThreadId, use a temporary one
          if (!initialThreadId) {
            initialThreadId = `new-${initialTargetUserId}`;
          }
        }

        let rows: any[] = [];
        try {
          const response = await SocketService.emitWithAck('chat:threads:list', { limit: 50, offset: 0 });
          rows = response?.rows || (Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []));
        } catch (listErr) {
          console.error('Failed to load chat threads list:', listErr);
        }

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

        if (initialThreadId) {
          const exists = mappedThreads.some(t => t.id === initialThreadId);
          if (!exists) {
            mappedThreads.unshift({
              id: initialThreadId,
              name: initialTargetUserName || `User #${initialTargetUserId}`,
              avatar: initialTargetUserAvatar || '/Images/CycleImage.png',
              isOnline: true,
              unreadCount: 0,
              lastMessage: 'Say Hi!',
              lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          }
        }

        setThreads(mappedThreads);

        if (initialThreadId) {
          setActiveThreadId(initialThreadId);
        }
      } catch (err) {
        console.error('Failed to load chat threads', err);
      }
    };

    fetchThreads();

    // Clean up socket listener for incoming threads could go here if needed.
  }, [user, initialTargetUserId, initialTargetUserName, initialTargetUserAvatar]);

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
          threadId: Number(activeThreadId),
          limit: 50,
          offset: 0,
        });
        const rows = res?.rows || (Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []));
        
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

    const handleThreadRead = (e: Event) => {
      const customEvent = e as CustomEvent;
      const data = customEvent.detail;
      const threadId = data.threadId?.toString() || data.id?.toString();
      
      if (!threadId) return;

      // Update all messages in this thread to 'read'
      setMessagesMap(prev => {
        const currentMsgs = prev[threadId];
        if (!currentMsgs) return prev;
        
        return {
          ...prev,
          [threadId]: currentMsgs.map(msg => 
            msg.senderId === 'me' ? { ...msg, status: 'read' as const } : msg
          )
        };
      });
    };

    window.addEventListener('chat:message:new', handleNewMessage);
    window.addEventListener('chat:thread:read', handleThreadRead);
    return () => {
      window.removeEventListener('chat:message:new', handleNewMessage);
      window.removeEventListener('chat:thread:read', handleThreadRead);
    };
  }, [user]);

  // 4. Send Message Function
  const sendMessage = useCallback(async (text: string) => {
    if (!activeThreadId || !text.trim()) return;

    let targetThreadId = activeThreadId;

    // Handle lazy thread creation if this is a temporary thread
    if (activeThreadId.startsWith('new-')) {
      const targetUserId = parseInt(activeThreadId.split('-')[1]);
      try {
        const res = await SocketService.emitWithAck('chat:thread:getOrCreate', { targetUserId });
        if (res?.id) {
          targetThreadId = res.id.toString();
          setActiveThreadId(targetThreadId);
          
          // Update the fake thread's ID in the local state
          setThreads(prev => prev.map(t => 
            t.id === activeThreadId ? { ...t, id: targetThreadId } : t
          ));
        } else if (typeof res === 'number' || typeof res === 'string') {
          targetThreadId = res.toString();
          setActiveThreadId(targetThreadId);
          setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, id: targetThreadId } : t));
        } else {
           console.error('Failed to create thread on the fly, no ID returned.');
           return;
        }
      } catch (err) {
        console.error('Failed to create thread on the fly:', err);
        return;
      }
    }

    try {
      const result = await SocketService.emitWithAck('chat:message:send', {
        threadId: parseInt(targetThreadId),
        message: text,
      });

      const sentMsg: ChatMessage = {
        id: result.id?.toString() || Date.now().toString(),
        senderId: 'me',
        type: 'text',
        content: result.message || text,
        timestamp: new Date(result.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };

      setMessagesMap((prev) => {
        const currentMsgs = prev[targetThreadId] || [];
        if (currentMsgs.some(m => m.id === sentMsg.id)) return prev;
        return {
          ...prev,
          [targetThreadId]: [...currentMsgs, sentMsg],
        };
      });

      setThreads((prevThreads) => 
        prevThreads.map((t) => 
          t.id === targetThreadId 
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
