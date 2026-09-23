import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'wallet_witness_session_id';

function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

interface SessionContextType {
  sessionId: string;
  isReady: boolean;
}

const SessionContext = createContext<SessionContextType>({
  sessionId: '',
  isReady: false,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initSession() {
      try {
        let id = await AsyncStorage.getItem(SESSION_KEY);
        if (!id) {
          id = generateSessionId();
          await AsyncStorage.setItem(SESSION_KEY, id);
        }
        setSessionId(id);
      } catch {
        setSessionId(generateSessionId());
      } finally {
        setIsReady(true);
      }
    }
    void initSession();
  }, []);

  return (
    <SessionContext.Provider value={{ sessionId, isReady }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  return useContext(SessionContext);
}
