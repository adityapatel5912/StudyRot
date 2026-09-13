import React, { createContext, useContext, useState } from 'react';
import { SANDBOX_FEED_POSTS, SANDBOX_REVIEW_CARDS } from '../sampleData.js';

const SandboxContext = createContext({
  isSandbox: false,
  sandboxMode: null, // 'feed' | 'review' | 'battle' | 'share' | null
  startSandbox: () => {},
  exitSandbox: () => {},
  sandboxFeed: [],
  sandboxReviewCards: [],
});

export function SandboxProvider({ children }) {
  const [sandboxMode, setSandboxMode] = useState(null);

  const startSandbox = (mode) => {
    setSandboxMode(mode);
  };

  const exitSandbox = () => {
    setSandboxMode(null);
  };

  const isSandbox = sandboxMode !== null;

  return (
    <SandboxContext.Provider
      value={{
        isSandbox,
        sandboxMode,
        startSandbox,
        exitSandbox,
        sandboxFeed: SANDBOX_FEED_POSTS,
        sandboxReviewCards: SANDBOX_REVIEW_CARDS,
      }}
    >
      {children}
    </SandboxContext.Provider>
  );
}

export function useSandbox() {
  return useContext(SandboxContext);
}
