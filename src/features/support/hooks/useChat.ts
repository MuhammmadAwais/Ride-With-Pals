import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { SocketService } from '@/features/chat/services/socketService';
import type { ChatUser, ChatMessage } from '../utils/constants';

export const useChat = (
  initialTargetUserId?: number, 
  initialTargetUserName?: string, 
  initialTargetUserAvatar?: string,
  initialPrefillMessage?: string,
  initialRideId?: number,
  initialIsGroup?: boolean,
  initialChatTitle?: string
) => {
  const { user } = useAppSelector((state) => state.auth);
  const [threads, setThreads] = useState<ChatUser[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const prefillSentRef = useRef<boolean>(false);

  // 1. Connect and Fetch Threads on Mount
  useEffect(() => {
    if (!user) return;

    // Connect socket
    SocketService.connect();

    // Fetch thread list
    const fetchThreads = async () => {
      try {
        let initialThreadId: string | null = null;

        // If we have an initialRideId, get or create the activity group thread first
        if (initialRideId) {
          try {
            const res = await SocketService.emitWithAck('chat:thread:getOrCreate', { rideId: initialRideId });
            const realId = res?.id || res?.threadId || res?.data?.id || (typeof res === 'number' || typeof res === 'string' ? res : null);
            if (realId) {
              initialThreadId = realId.toString();
            }
          } catch (createErr) {
            console.error('Failed to getOrCreate activity group thread:', createErr);
          }

          if (!initialThreadId) {
            initialThreadId = `ride-${initialRideId}`;
          }
        } else if (initialTargetUserId) {
          // If we have an initialTargetUserId, get or create the 1-on-1 thread first
          try {
            const res = await SocketService.emitWithAck('chat:thread:getOrCreate', { targetUserId: initialTargetUserId });
            const realId = res?.id || res?.threadId || res?.data?.id || (typeof res === 'number' || typeof res === 'string' ? res : null);
            if (realId) {
              initialThreadId = realId.toString();
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
          const isGroupThread = row.type === 'activity' || row.isGroup === true || Boolean(row.rideId || row.ride);

          if (isGroupThread) {
            const rideName = row.ride?.rideName || row.title || row.name || (row.rideId ? `Ride #${row.rideId} Group` : 'Activity Group');
            const rideLogo = row.ride?.club?.logo || row.club?.logo || row.avatar || row.image;
            const avatar = rideLogo
              ? (rideLogo.startsWith('http') || rideLogo.startsWith('data:') ? rideLogo : `https://api.ridewithpals.com/uploads/${rideLogo}`)
              : undefined;
            const lastMsg = row.lastMessage?.message || row.lastMessage || 'No messages yet';
            let timeStr = '';
            if (row.lastMessageAt || row.updatedAt) {
              const date = new Date(row.lastMessageAt || row.updatedAt);
              timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            return {
              id: row.id.toString(),
              name: rideName,
              avatar,
              isOnline: false,
              unreadCount: Number(row.unreadCount || 0),
              lastMessage: typeof lastMsg === 'string' ? lastMsg : (lastMsg?.message || 'No messages yet'),
              lastMessageTime: timeStr,
              isGroup: true,
              type: 'activity',
              rideId: row.rideId || row.ride?.id,
              participantCount: row.ride?.joinedParticipants?.length || row.participantsCount,
            };
          }

          // Find the other participant who is NOT the current logged-in user
          let other = null;
          if (row.otherUser && Number(row.otherUser.id) !== Number(user.id)) {
            other = row.otherUser;
          } else if (row.userOne && Number(row.userOne.id) !== Number(user.id)) {
            other = row.userOne;
          } else if (row.userTwo && Number(row.userTwo.id) !== Number(user.id)) {
            other = row.userTwo;
          }

          const oId = other?.id || (Number(row.userTwoId) === Number(user.id) ? row.userOneId : row.userTwoId) || (Number(row.userOneId) === Number(user.id) ? row.userTwoId : row.userOneId);
          const name = other?.fullName || other?.name || (oId ? `User #${oId}` : 'Chat Partner');
          const rawAvatar = other?.profileImage || other?.avatar;
          const avatar = rawAvatar
            ? (rawAvatar.startsWith('http') || rawAvatar.startsWith('data:') ? rawAvatar : `https://api.ridewithpals.com/uploads/${rawAvatar}`)
            : undefined;
          const lastMsg = row.lastMessage?.message || 'No messages yet';

          let timeStr = '';
          if (row.lastMessageAt || row.updatedAt) {
            const date = new Date(row.lastMessageAt || row.updatedAt);
            timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }

          return {
            id: row.id.toString(),
            name,
            avatar,
            isOnline: false,
            unreadCount: 0,
            lastMessage: lastMsg,
            lastMessageTime: timeStr,
            targetUserId: oId,
            isGroup: false,
          };
        });

        if (initialThreadId) {
          if (initialRideId) {
            const matchingRideThread = mappedThreads.find(t => t.rideId === initialRideId || t.id === initialThreadId);
            if (matchingRideThread) {
              initialThreadId = matchingRideThread.id;
            }
          }

          const exists = mappedThreads.some(t => t.id === initialThreadId);
          if (!exists) {
            if (initialRideId) {
              const avatar = initialTargetUserAvatar
                ? (initialTargetUserAvatar.startsWith('http') || initialTargetUserAvatar.startsWith('data:') ? initialTargetUserAvatar : `https://api.ridewithpals.com/uploads/${initialTargetUserAvatar}`)
                : undefined;
              mappedThreads.unshift({
                id: initialThreadId,
                name: initialChatTitle || initialTargetUserName || `Ride #${initialRideId} Group`,
                avatar,
                isOnline: true,
                unreadCount: 0,
                lastMessage: 'Activity group chat ready',
                lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isGroup: true,
                type: 'activity',
                rideId: initialRideId,
              });
            } else if (initialTargetUserId) {
              const avatar = initialTargetUserAvatar
                ? (initialTargetUserAvatar.startsWith('http') || initialTargetUserAvatar.startsWith('data:') ? initialTargetUserAvatar : `https://api.ridewithpals.com/uploads/${initialTargetUserAvatar}`)
                : undefined;
              mappedThreads.unshift({
                id: initialThreadId,
                name: initialTargetUserName || `User #${initialTargetUserId}`,
                avatar,
                isOnline: true,
                unreadCount: 0,
                lastMessage: 'Say Hi!',
                lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                targetUserId: initialTargetUserId,
                isGroup: false,
              });
            }
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
  }, [user, initialTargetUserId, initialTargetUserName, initialTargetUserAvatar, initialRideId, initialIsGroup, initialChatTitle]);

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
          const senderObj = row.sender || row.user || row.senderUser;
          const sName = senderObj?.fullName || senderObj?.name || row.senderName || '';
          const rawAvatar = senderObj?.profileImage || senderObj?.avatar || row.senderAvatar || '';
          const sAvatar = rawAvatar
            ? (rawAvatar.startsWith('http') || rawAvatar.startsWith('data:') ? rawAvatar : `https://api.ridewithpals.com/uploads/${rawAvatar}`)
            : undefined;

          return {
            id: row.id.toString(),
            senderId: isMe ? 'me' : row.senderId.toString(),
            type: 'text', // assuming all text for now
            content: row.message || '',
            timestamp: new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: row.isRead ? 'read' : 'delivered',
            senderName: sName,
            senderAvatar: sAvatar,
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

      const senderObj = msgNode.sender || msgNode.user || msgNode.senderUser;
      const sName = senderObj?.fullName || senderObj?.name || msgNode.senderName || '';
      const rawAvatar = senderObj?.profileImage || senderObj?.avatar || msgNode.senderAvatar || '';
      const sAvatar = rawAvatar
        ? (rawAvatar.startsWith('http') || rawAvatar.startsWith('data:') ? rawAvatar : `https://api.ridewithpals.com/uploads/${rawAvatar}`)
        : undefined;

      const incomingMsg: ChatMessage = {
        id: msgNode.id.toString(),
        senderId: msgNode.senderId === user?.id ? 'me' : msgNode.senderId.toString(),
        type: 'text',
        content: msgNode.message || '',
        timestamp: new Date(msgNode.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: msgNode.isRead ? 'read' : 'delivered',
        senderName: sName,
        senderAvatar: sAvatar,
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
    if (activeThreadId.startsWith('ride-')) {
      const rideId = parseInt(activeThreadId.split('-')[1]);
      try {
        const res = await SocketService.emitWithAck('chat:thread:getOrCreate', { rideId });
        const realId = res?.id || res?.threadId || res?.data?.id;
        if (realId) {
          targetThreadId = realId.toString();
          setActiveThreadId(targetThreadId);
          setThreads(prev => prev.map(t => 
            t.id === activeThreadId ? { ...t, id: targetThreadId, rideId } : t
          ));
        } else if (typeof res === 'number' || typeof res === 'string') {
          targetThreadId = res.toString();
          setActiveThreadId(targetThreadId);
          setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, id: targetThreadId, rideId } : t));
        }
      } catch (err) {
        console.error('Failed to create activity group thread on the fly:', err);
        return;
      }
    } else if (activeThreadId.startsWith('new-')) {
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
      const activeThreadObj = threads.find(t => t.id === targetThreadId || t.id === activeThreadId);
      const payload: any = {
        threadId: parseInt(targetThreadId),
        message: text,
      };
      if (activeThreadObj?.rideId) {
        payload.rideId = activeThreadObj.rideId;
      }

      const result = await SocketService.emitWithAck('chat:message:send', payload);

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

  // Auto-send prefill message if passed (e.g. from Marketplace item "Buy Now")
  useEffect(() => {
    if (activeThreadId && initialPrefillMessage && !prefillSentRef.current) {
      prefillSentRef.current = true;
      // Small timeout to ensure thread socket join finishes
      const timer = setTimeout(() => {
        sendMessage(initialPrefillMessage);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeThreadId, initialPrefillMessage, sendMessage]);

  return {
    threads,
    messages: activeThreadId ? messagesMap[activeThreadId] || [] : [],
    activeThreadId,
    setActiveThreadId,
    sendMessage,
    isLoading,
  };
};
