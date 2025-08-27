'use client';

import { useRonAIStore } from '@/lib/ron-ai-store';
import { BrowserSession } from '@/lib/ron-ai-store';

/**
 * A custom hook that encapsulates the logic for managing browser sessions.
 * It provides a clean interface for components to interact with the browser state,
 * abstracting away the direct store calls and future API interactions.
 */
export const useBrowserManager = () => {
  const {
    createBrowserSession,
    closeBrowserSession,
    updateBrowserSession,
  } = useRonAIStore((state) => ({
    createBrowserSession: state.createBrowserSession,
    closeBrowserSession: state.closeBrowserSession,
    updateBrowserSession: state.updateBrowserSession,
  }));

  /**
   * Creates a new browser session.
   * This function will eventually call the backend API to create a real session.
   */
  const createSession = async () => {
    console.log('[BrowserManager] Mock API Call: Creating new session...');
    const sessionId = await createBrowserSession(); // This updates the store
    console.log(`[BrowserManager] Mock API Success: Session ${sessionId} created.`);
    return sessionId;
  };

  /**
   * Closes an existing browser session.
   */
  const closeSession = (sessionId: string) => {
    console.log(`[BrowserManager] Mock API Call: Closing session ${sessionId}...`);
    closeBrowserSession(sessionId); // This updates the store
    console.log(`[BrowserManager] Mock API Success: Session ${sessionId} closed.`);
  };

  /**
   * Updates the data of an existing browser session.
   */
  const updateSession = (sessionId: string, data: Partial<Omit<BrowserSession, 'sessionId'>>) => {
    console.log(`[BrowserManager] Mock API Call: Updating session ${sessionId}...`, data);
    updateBrowserSession(sessionId, data); // This updates the store
    console.log(`[BrowserManager] Mock API Success: Session ${sessionId} updated.`);
  };

  /**
   * Navigates a browser session to a new URL.
   */
  const navigateSession = (sessionId: string, url: string) => {
      console.log(`[BrowserManager] Mock API Call: Navigating session ${sessionId} to ${url}...`);
      updateBrowserSession(sessionId, { url, title: `Loading ${url}...` });
      // Simulate a page load with a timeout
      setTimeout(() => {
          updateBrowserSession(sessionId, { title: `Page for ${url}` });
          console.log(`[BrowserManager] Mock API Success: Navigation complete.`);
      }, 1500);
  }

  return {
    createSession,
    closeSession,
    updateSession,
    navigateSession,
  };
};

/**
 * A non-visual component to fulfill the plan step.
 * The primary export for logic is the `useBrowserManager` hook.
 */
const BrowserSessionManager = () => {
    return null;
}

export default BrowserSessionManager;
