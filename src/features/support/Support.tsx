/**
 * @fileoverview Chat Support Page — integrates ChatSidebar and ChatWindow.
 *
 * Sibling to admin panel's Support component:
 *  - Responsive: Sidebar + Window side-by-side on desktop
 *  - Mobile: Fullscreen Sidebar OR Fullscreen Window based on selection
 *  - No page scroll (h-[calc(100svh-80px)])
 */
import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { APP_NAME } from '@/Constants';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatWindow } from './components/ChatWindow';
import { MOCK_CHAT_USERS, MOCK_MESSAGES } from './utils/constants';

const Support = () => {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  // Derived active user + messages
  const activeUser = useMemo(
    () => MOCK_CHAT_USERS.find((u) => u.id === activeUserId) || null,
    [activeUserId],
  );

  const messages = useMemo(
    () => (activeUserId ? MOCK_MESSAGES[activeUserId] || [] : []),
    [activeUserId],
  );

  return (
    <>
      <Helmet>
        <title>Chat Support — {APP_NAME}</title>
      </Helmet>

      {/* Support container: takes full remaining height below 80px navbar */}
      <div
        className="w-full flex overflow-hidden relative bg-main-bg"
        style={{ height: 'calc(100svh - 80px)' }}
      >
        <ChatSidebar
          users={MOCK_CHAT_USERS}
          activeUserId={activeUserId}
          onSelectUser={setActiveUserId}
          isHiddenOnMobile={activeUserId !== null}
        />

        <ChatWindow
          activeUser={activeUser}
          messages={messages}
          onBack={() => setActiveUserId(null)}
          isHiddenOnMobile={activeUserId === null}
        />
      </div>
    </>
  );
};

export default Support;
