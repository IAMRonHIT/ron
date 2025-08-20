/**
 * Responsive Multi-Session Browserbase Application
 * Integrates Browserbase MCP with Ron AI for parallel browser automation
 */

import { BrowserbaseMCPClient, TransportType, BrowserbaseSessionConfig } from './browserbase-mcp-client';

export interface ResponsiveAutomationConfig {
  mobile?: {
    prompt: string;
    width?: number;
    height?: number;
  };
  tablet?: {
    prompt: string;
    width?: number;
    height?: number;
  };
  desktop?: {
    prompt: string;
    width?: number;
    height?: number;
  };
}

export interface LiveViewUrls {
  [sessionName: string]: {
    fullscreen: string;
    pages: Array<{ url: string; debuggerFullscreenUrl: string }>;
  };
}

export class BrowserbaseApp {
  private client: BrowserbaseMCPClient;
  private activeSessions: Map<string, { id: string; type: string }> = new Map();

  constructor(config?: {
    transportType?: TransportType;
    smitheryUrl?: string;
    modelName?: string;
    modelApiKey?: string;
  }) {
    // Load configuration from environment variables
    const browserbaseApiKey = process.env.BROWSERBASE_API_KEY;
    const browserbaseProjectId = process.env.BROWSERBASE_PROJECT_ID;

    if (!browserbaseApiKey || !browserbaseProjectId) {
      throw new Error('BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID must be set in environment');
    }

    this.client = new BrowserbaseMCPClient({
      transportType: config?.transportType || 'stdio',
      smitheryUrl: config?.smitheryUrl || process.env.BROWSERBASE_MCP_URL,
      browserbaseApiKey,
      browserbaseProjectId,
      modelName: config?.modelName || 'google/gemini-2.0-flash',
      modelApiKey: config?.modelApiKey || process.env.GEMINI_API_KEY
    });
  }

  /**
   * Initialize the Browserbase MCP connection
   */
  async initialize(): Promise<void> {
    await this.client.initialize();
    console.log('✅ BrowserbaseApp initialized successfully');
  }

  /**
   * Create responsive browser sessions for different viewports
   */
  async createResponsiveSessions(): Promise<{
    mobile?: string;
    tablet?: string;
    desktop?: string;
  }> {
    const sessions: any = {};

    // Mobile session - iPhone viewport
    const mobileSession = await this.client.createSession({
      sessionName: 'mobile-session',
      browserWidth: 375,
      browserHeight: 667,
      keepAlive: true
    });
    sessions.mobile = mobileSession.id;
    this.activeSessions.set(mobileSession.id, { id: mobileSession.id, type: 'mobile' });

    // Tablet session - iPad viewport
    const tabletSession = await this.client.createSession({
      sessionName: 'tablet-session',
      browserWidth: 768,
      browserHeight: 1024,
      keepAlive: true
    });
    sessions.tablet = tabletSession.id;
    this.activeSessions.set(tabletSession.id, { id: tabletSession.id, type: 'tablet' });

    // Desktop session - Full HD viewport
    const desktopSession = await this.client.createSession({
      sessionName: 'desktop-session',
      browserWidth: 1920,
      browserHeight: 1080,
      keepAlive: true
    });
    sessions.desktop = desktopSession.id;
    this.activeSessions.set(desktopSession.id, { id: desktopSession.id, type: 'desktop' });

    console.log('✅ Created responsive sessions:', sessions);
    return sessions;
  }

  /**
   * Run parallel processes with different prompts per session
   */
  async runParallelProcesses(
    sessions: { mobile?: string; tablet?: string; desktop?: string },
    config: ResponsiveAutomationConfig
  ): Promise<any[]> {
    const processes: Promise<any>[] = [];

    if (sessions.mobile && config.mobile) {
      processes.push(
        this.client.actInSession(sessions.mobile, config.mobile.prompt)
      );
    }

    if (sessions.tablet && config.tablet) {
      processes.push(
        this.client.actInSession(sessions.tablet, config.tablet.prompt)
      );
    }

    if (sessions.desktop && config.desktop) {
      processes.push(
        this.client.actInSession(sessions.desktop, config.desktop.prompt)
      );
    }

    const results = await Promise.all(processes);
    console.log('✅ Parallel processes completed');
    return results;
  }

  /**
   * Get Live View URLs for all active sessions
   */
  async getLiveViewUrls(): Promise<LiveViewUrls> {
    const liveViewUrls: LiveViewUrls = {};

    for (const [sessionId, sessionInfo] of this.activeSessions) {
      try {
        const debugInfo = await this.client.getSessionDebugInfo(sessionId);
        liveViewUrls[sessionInfo.type] = {
          fullscreen: debugInfo.debuggerFullscreenUrl,
          pages: debugInfo.pages
        };
      } catch (error) {
        console.error(`Failed to get Live View for session ${sessionId}:`, error);
      }
    }

    return liveViewUrls;
  }

  /**
   * Create a multi-tab workflow in a specific session
   */
  async createMultiTabWorkflow(sessionId: string, urls: string[]): Promise<any> {
    const results = [];

    for (const url of urls) {
      // Navigate to URL in new tab
      await this.client.actInSession(
        sessionId,
        `Open a new tab and navigate to ${url}`
      );
      results.push(url);
    }

    // Get updated debug info with all tabs
    const debugInfo = await this.client.getSessionDebugInfo(sessionId);
    return {
      tabs: results,
      liveViews: debugInfo.pages
    };
  }

  /**
   * Generate embed code for Live View iframes
   */
  generateEmbedCode(liveViewUrls: LiveViewUrls): {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    multiTab?: string[];
  } {
    const embedCodes: any = {};

    if (liveViewUrls.mobile) {
      embedCodes.mobile = `<iframe 
        src="${liveViewUrls.mobile.fullscreen}" 
        style="width: 375px; height: 667px; border: 1px solid #ccc; border-radius: 8px;" 
        title="Mobile Browser View"
      />`;
    }

    if (liveViewUrls.tablet) {
      embedCodes.tablet = `<iframe 
        src="${liveViewUrls.tablet.fullscreen}" 
        style="width: 768px; height: 1024px; border: 1px solid #ccc; border-radius: 8px;" 
        title="Tablet Browser View"
      />`;
    }

    if (liveViewUrls.desktop) {
      embedCodes.desktop = `<iframe 
        src="${liveViewUrls.desktop.fullscreen}" 
        style="width: 100%; height: 600px; border: 1px solid #ccc; border-radius: 8px;" 
        title="Desktop Browser View"
      />`;

      // Multi-tab embed codes
      if (liveViewUrls.desktop.pages && liveViewUrls.desktop.pages.length > 0) {
        embedCodes.multiTab = liveViewUrls.desktop.pages.map((page, index) => 
          `<iframe 
            src="${page.debuggerFullscreenUrl}" 
            id="tab-${index}" 
            style="width: 100%; height: 600px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 10px;" 
            title="Browser Tab ${index + 1}"
          />`
        );
      }
    }

    return embedCodes;
  }

  /**
   * Create a complete responsive automation workflow
   */
  async createResponsiveAutomation(config: ResponsiveAutomationConfig): Promise<{
    sessions: any;
    results: any[];
    liveViewUrls: LiveViewUrls;
    embedCodes: any;
  }> {
    // Create sessions for different viewports
    const sessions = await this.createResponsiveSessions();

    // Run parallel processes with different prompts
    const results = await this.runParallelProcesses(sessions, config);

    // Get Live View URLs for embedding
    const liveViewUrls = await this.getLiveViewUrls();

    // Generate embed codes
    const embedCodes = this.generateEmbedCode(liveViewUrls);

    return {
      sessions,
      results,
      liveViewUrls,
      embedCodes
    };
  }

  /**
   * Clean up all active sessions
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up active sessions...');
    await this.client.cleanup();
    this.activeSessions.clear();
    console.log('✅ Cleanup completed');
  }
}
