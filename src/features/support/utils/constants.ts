/** Chat support types and mock data — ported from admin panel. */

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio';

export interface ChatMessage {
  id: string;
  senderId: string; // 'me' or user id
  type: MessageType;
  content: string;  // Text content or media URL
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  duration?: number; // For audio/video in seconds
}

export const MOCK_CHAT_USERS: ChatUser[] = [
  {
    id: 'u1',
    name: 'Muhammad Saif',
    avatar: 'https://i.pravatar.cc/150?u=1',
    isOnline: true,
    unreadCount: 0,
    lastMessage: 'Let me check on that right away.',
    lastMessageTime: '12:30 PM',
  },
  {
    id: 'u2',
    name: 'Ali Khan',
    avatar: 'https://i.pravatar.cc/150?u=2',
    isOnline: false,
    lastSeen: '1h ago',
    unreadCount: 2,
    lastMessage: 'Sent an attachment.',
    lastMessageTime: '11:45 AM',
  },
  {
    id: 'u3',
    name: 'Sara Ahmed',
    avatar: 'https://i.pravatar.cc/150?u=3',
    isOnline: true,
    unreadCount: 5,
    lastMessage: 'How do I upgrade my subscription?',
    lastMessageTime: '09:20 AM',
  },
  {
    id: 'u4',
    name: 'Bestie',
    avatar: 'https://i.pravatar.cc/150?u=4',
    isOnline: false,
    lastSeen: 'Yesterday',
    unreadCount: 0,
    lastMessage: 'Sent a voice message',
    lastMessageTime: 'Yesterday',
  },
];

export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  'u1': [
    {
      id: 'm1',
      senderId: 'u1',
      type: 'text',
      content: 'Hello, I need help with my recent ride booking.',
      timestamp: '12:15 PM',
      status: 'read',
    },
    {
      id: 'm2',
      senderId: 'me',
      type: 'text',
      content: 'Hi Muhammad! Sure, I can help with that. What seems to be the issue?',
      timestamp: '12:16 PM',
      status: 'read',
    },
    {
      id: 'm3',
      senderId: 'u1',
      type: 'image',
      content: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop',
      timestamp: '12:18 PM',
      status: 'read',
    },
    {
      id: 'm4',
      senderId: 'u1',
      type: 'text',
      content: 'The app showed this error screen when I tried to pay.',
      timestamp: '12:19 PM',
      status: 'read',
    },
    {
      id: 'm5',
      senderId: 'me',
      type: 'text',
      content: 'I see. Let me check on that right away.',
      timestamp: '12:30 PM',
      status: 'read',
    },
    {
      id: 'm6',
      senderId: 'me',
      type: 'audio',
      content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      timestamp: '12:35 PM',
      status: 'read',
      duration: 125,
    },
    {
      id: 'm7',
      senderId: 'u1',
      type: 'video',
      content: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      timestamp: '12:40 PM',
      status: 'delivered',
      duration: 15,
    },
  ],
};
