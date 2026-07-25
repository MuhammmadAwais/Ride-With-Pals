/**
 * @fileoverview Chat Support Page — integrates ChatSidebar and ChatWindow.
 *
 * Sibling to admin panel's Support component:
 *  - Responsive: Sidebar + Window side-by-side on desktop
 *  - Mobile: Fullscreen Sidebar OR Fullscreen Window based on selection
 *  - No page scroll (h-[calc(100svh-80px)])
 */
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { APP_NAME } from '@/Constants';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatWindow } from './components/ChatWindow';
import { useChat } from './hooks/useChat';
import { useLocation } from 'react-router-dom';
import UserProfileModal from '@/features/ClubSide/components/UserProfileModal';

const Support = () => {
  const location = useLocation();
  const targetUserId = location.state?.targetUserId as number | undefined;
  const targetUserName = location.state?.targetUserName as string | undefined;
  const targetUserAvatar = location.state?.targetUserAvatar as string | undefined;
  const prefillMessage = location.state?.prefillMessage as string | undefined;

  const [viewProfileUserId, setViewProfileUserId] = useState<number | string | null>(null);

  const { 
    threads, 
    messages, 
    activeThreadId, 
    setActiveThreadId, 
    sendMessage 
  } = useChat(targetUserId, targetUserName, targetUserAvatar, prefillMessage);

  const activeUser = useMemo(
    () => threads.find((u) => u.id === activeThreadId) || null,
    [threads, activeThreadId],
  );

  return (
    <>
      <Helmet>
        <title>Chat Support — {APP_NAME}</title>
      </Helmet>

      <div
        className="w-full flex overflow-hidden relative bg-main-bg"
        style={{ height: 'calc(100svh - 80px)' }}
      >
        <ChatSidebar
          users={threads}
          activeUserId={activeThreadId}
          onSelectUser={setActiveThreadId}
          isHiddenOnMobile={activeThreadId !== null}
        />

        <ChatWindow
          activeUser={activeUser}
          messages={messages}
          onSendMessage={sendMessage}
          onBack={() => setActiveThreadId(null)}
          onOpenProfile={(uId) => setViewProfileUserId(uId)}
          isHiddenOnMobile={activeThreadId === null}
        />
      </div>

      {viewProfileUserId && (
        <UserProfileModal
          userId={viewProfileUserId}
          onClose={() => setViewProfileUserId(null)}
        />
      )}
    </>
  );
};

export default Support;
