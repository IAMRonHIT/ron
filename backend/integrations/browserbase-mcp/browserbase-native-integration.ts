/**
 * Browserbase Integration using Anthropic's Native MCP Connector
 * Uses Smithery.ai hosted MCP server - no custom client needed!
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Browserbase MCP configuration for Anthropic's native connector
 */
export const BROWSERBASE_MCP_CONFIG = {
  type: "url" as const,
  url: "https://server.smithery.ai/@browserbasehq/mcp-browserbase/mcp?api_key=36d3b1d3-6cd2-423b-b6ef-8fe3abae71ba&profile=exotic-mongoose-sitCbX",
  name: "browserbase"
};

/**
 * Extended message parameters to include MCP servers (beta feature)
 */
interface MessageCreateParamsWithMCP extends Anthropic.Messages.MessageCreateParamsNonStreaming {
  mcp_servers?: Array<{
    type: "url";
    url: string;
    name: string;
    authorization_token?: string;
  }>;
}

/**
 * Extended message content types to include MCP tool results
 */
interface MCPToolResultContent {
  type: 'mcp_tool_result';
  tool_use_id: string;
  is_error?: boolean;
  content: Array<{ type: 'text'; text: string }>;
}

// Remove invalid interface - SDK doesn't export MessageContent

/**
 * Simple Browserbase session manager using native MCP tools
 */
export class BrowserbaseNativeIntegration {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey,
      defaultHeaders: {
        "anthropic-beta": "mcp-client-2025-04-04"
      }
    });
  }

  /**
   * Create a browser session and get Live View URLs
   */
  async createSessionWithLiveView(sessionName?: string) {
    const messages: Anthropic.Messages.MessageParam[] = [
      {
        role: "user",
        content: `Create a new browser session${sessionName ? ` named "${sessionName}"` : ''} and then get the debug information with Live View URLs.`
      }
    ];

    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages,
      mcp_servers: [BROWSERBASE_MCP_CONFIG]
    } as MessageCreateParamsWithMCP);

    return this.extractSessionInfo(response);
  }

  /**
   * Navigate to a URL and get updated Live View
   */
  async navigateAndGetLiveView(sessionId: string, url: string) {
    const messages: Anthropic.Messages.MessageParam[] = [
      {
        role: "user",
        content: `Navigate session ${sessionId} to ${url} and then get the updated debug information with Live View URLs.`
      }
    ];

    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages,
      mcp_servers: [BROWSERBASE_MCP_CONFIG]
    } as MessageCreateParamsWithMCP);

    return this.extractSessionInfo(response);
  }

  /**
   * Perform an action and get updated Live View
   */
  async performActionAndGetLiveView(sessionId: string, action: string) {
    const messages: Anthropic.Messages.MessageParam[] = [
      {
        role: "user",
        content: `In session ${sessionId}, perform this action: "${action}". Then get the updated debug information with Live View URLs.`
      }
    ];

    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages,
      mcp_servers: [BROWSERBASE_MCP_CONFIG]
    } as MessageCreateParamsWithMCP);

    return this.extractSessionInfo(response);
  }

  /**
   * Extract data from a page
   */
  async extractData(sessionId: string, instruction: string, schema?: any) {
    const schemaText = schema ? `Use this schema: ${JSON.stringify(schema)}` : '';
    
    const messages: Anthropic.Messages.MessageParam[] = [
      {
        role: "user",
        content: `From session ${sessionId}, extract data with this instruction: "${instruction}". ${schemaText}`
      }
    ];

    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages,
      mcp_servers: [BROWSERBASE_MCP_CONFIG]
    } as MessageCreateParamsWithMCP);

    return this.extractDataFromResponse(response);
  }

  /**
   * Take a screenshot and get the URL
   */
  async takeScreenshot(sessionId: string, fullPage: boolean = false) {
    const messages: Anthropic.Messages.MessageParam[] = [
      {
        role: "user",
        content: `Take a ${fullPage ? 'full page' : 'viewport'} screenshot of session ${sessionId}.`
      }
    ];

    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages,
      mcp_servers: [BROWSERBASE_MCP_CONFIG]
    } as MessageCreateParamsWithMCP);

    return this.extractScreenshotInfo(response);
  }

  /**
   * Close a browser session
   */
  async closeSession(sessionId: string) {
    const messages: Anthropic.Messages.MessageParam[] = [
      {
        role: "user",
        content: `Close browser session ${sessionId}.`
      }
    ];

    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages,
      mcp_servers: [BROWSERBASE_MCP_CONFIG]
    } as MessageCreateParamsWithMCP);

    return { success: true, response };
  }

  /**
   * Extract session information from MCP tool results
   */
  private extractSessionInfo(response: Anthropic.Messages.Message) {
    const toolResults = this.findMCPToolResults(response);
    
    let sessionId: string | null = null;
    let liveViewUrls: any = null;

    for (const result of toolResults) {
      // Look for session creation results
      if (result.content?.some((c: any) => c.text?.includes('session') && c.text?.includes('id'))) {
        const sessionContent = result.content.find((c: any) => c.text?.includes('sessionId'));
        if (sessionContent) {
          try {
            const data = JSON.parse(sessionContent.text);
            sessionId = data.sessionId || data.id;
          } catch {
            // Extract from text response
            const match = sessionContent.text.match(/sessionId[:\s]+"?([^"'\s,}]+)/);
            if (match) sessionId = match[1];
          }
        }
      }

      // Look for debug/live view results
      if (result.content?.some((c: any) => c.text?.includes('debugger') || c.text?.includes('liveView'))) {
        const debugContent = result.content.find((c: any) => 
          c.text?.includes('debuggerFullscreenUrl') || c.text?.includes('debuggerUrl')
        );
        if (debugContent) {
          try {
            liveViewUrls = JSON.parse(debugContent.text);
          } catch {
            // Extract URLs from text
            const fullscreenMatch = debugContent.text.match(/debuggerFullscreenUrl[:\s]+"?([^"'\s,}]+)/);
            const borderMatch = debugContent.text.match(/debuggerUrl[:\s]+"?([^"'\s,}]+)/);
            
            if (fullscreenMatch || borderMatch) {
              liveViewUrls = {
                debuggerFullscreenUrl: fullscreenMatch?.[1],
                debuggerUrl: borderMatch?.[1],
                pages: []
              };
            }
          }
        }
      }
    }

    return {
      sessionId,
      liveViewUrls,
      embedUrls: liveViewUrls ? {
        fullscreen: liveViewUrls.debuggerFullscreenUrl,
        withBorders: liveViewUrls.debuggerUrl,
        tabs: liveViewUrls.pages || []
      } : null,
      response
    };
  }

  /**
   * Extract data from response
   */
  private extractDataFromResponse(response: Anthropic.Messages.Message) {
    const toolResults = this.findMCPToolResults(response);
    
    for (const result of toolResults) {
      if (result.content?.some((c: any) => c.text && !c.text.includes('sessionId'))) {
        const dataContent = result.content.find((c: any) => c.text);
        if (dataContent) {
          try {
            return JSON.parse(dataContent.text);
          } catch {
            return dataContent.text;
          }
        }
      }
    }

    return null;
  }

  /**
   * Extract screenshot information
   */
  private extractScreenshotInfo(response: Anthropic.Messages.Message) {
    const toolResults = this.findMCPToolResults(response);
    
    for (const result of toolResults) {
      if (result.content?.some((c: any) => c.text?.includes('screenshot'))) {
        const screenshotContent = result.content.find((c: any) => c.text?.includes('screenshotUrl'));
        if (screenshotContent) {
          try {
            const data = JSON.parse(screenshotContent.text);
            return { screenshotUrl: data.screenshotUrl };
          } catch {
            const match = screenshotContent.text.match(/screenshotUrl[:\s]+"?([^"'\s,}]+)/);
            if (match) return { screenshotUrl: match[1] };
          }
        }
      }
    }

    return { screenshotUrl: null };
  }

  /**
   * Find MCP tool results in the response
   */
  private findMCPToolResults(response: Anthropic.Messages.Message) {
    const results: any[] = [];
    
    for (const content of response.content) {
      // Use type assertion since MCP tool results are a beta feature
      if ((content as any).type === 'mcp_tool_result') {
        results.push(content);
      }
    }

    return results;
  }
}

/**
 * Example usage of the native integration
 */
export async function exampleUsage() {
  const browserbase = new BrowserbaseNativeIntegration(process.env.ANTHROPIC_API_KEY!);

  try {
    // Create session with Live View
    const session = await browserbase.createSessionWithLiveView("example-session");
    console.log('Session created:', session.sessionId);
    console.log('Live View URLs:', session.embedUrls);

    if (session.sessionId) {
      // Navigate to a website
      const navigation = await browserbase.navigateAndGetLiveView(
        session.sessionId, 
        "https://example.com"
      );
      console.log('Navigation complete, updated Live View:', navigation.embedUrls);

      // Perform an action
      const action = await browserbase.performActionAndGetLiveView(
        session.sessionId,
        "Click the search button"
      );
      console.log('Action complete, updated Live View:', action.embedUrls);

      // Extract some data
      const data = await browserbase.extractData(
        session.sessionId,
        "Get the page title and main heading"
      );
      console.log('Extracted data:', data);

      // Take a screenshot
      const screenshot = await browserbase.takeScreenshot(session.sessionId);
      console.log('Screenshot URL:', screenshot.screenshotUrl);

      // Close session
      await browserbase.closeSession(session.sessionId);
      console.log('Session closed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
