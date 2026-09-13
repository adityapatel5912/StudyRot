import React, { createContext, useContext, useState, useCallback } from 'react';

const TalkContext = createContext(null);

export function TalkProvider({ children }) {
  const [isTalkOpen, setIsTalkOpen] = useState(false);
  const [isDoubtOpen, setIsDoubtOpen] = useState(false);
  const [doubtPayload, setDoubtPayload] = useState(null); // { question, postContext, imageFile, subject, grade }
  const [activeVoice, setActiveVoice] = useState(() => {
    try {
      return localStorage.getItem('studyrot_voice_choice') || 'teacher';
    } catch {
      return 'teacher';
    }
  });

  const handleSetVoice = useCallback((v) => {
    setActiveVoice(v);
    try {
      localStorage.setItem('studyrot_voice_choice', v);
    } catch {}
  }, []);

  const openTalkMode = useCallback(() => {
    setIsTalkOpen(true);
  }, []);

  const closeTalkMode = useCallback(() => {
    setIsTalkOpen(false);
  }, []);

  const openDoubt = useCallback((payload = {}) => {
    setDoubtPayload(payload);
    setIsDoubtOpen(true);
  }, []);

  const closeDoubt = useCallback(() => {
    setIsDoubtOpen(false);
  }, []);

  return (
    <TalkContext.Provider
      value={{
        isTalkOpen,
        openTalkMode,
        closeTalkMode,
        isDoubtOpen,
        openDoubt,
        closeDoubt,
        doubtPayload,
        activeVoice,
        setActiveVoice: handleSetVoice,
      }}
    >
      {children}
    </TalkContext.Provider>
  );
}

export function useTalk() {
  const ctx = useContext(TalkContext);
  if (!ctx) {
    throw new Error('useTalk must be used within a TalkProvider');
  }
  return ctx;
}
