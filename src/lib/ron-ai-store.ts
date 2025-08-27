// /src/lib/ron-ai-store.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Message as BaseMessage, Agent as BaseAgent } from './types';

// --- New Interfaces for Phase 5 & Refactor ---
export type DeploymentStatus = 'idle' | 'in-progress' | 'success' | 'error';
export type DrawerContentType = 'tools' | 'code' | 'browser' | 'pubmed' | 'live-preview' | null;

export interface PubMedArticle {
  id: string;
  title: string;
  authors: string[];
  publication: string;
  summary: string;
  url: string;
}

// --- Redefined Interfaces for the Store ---

// A message in the chat, ensuring it has an ID.
// Note: Omit is used in the action to make ID generation internal.
export interface Message extends BaseMessage {
  id: string;
}

// An agent in the ecosystem, with ID and status.
export interface Agent {
  id: string;
  name: string;
  specialization: string;
  status: 'idle' | 'working' | 'finished' | 'error';
  // New fields for Phase 3
  model: string;
  statusHeader: string; // e.g., "Analyzing patient data"
  conversationHistory: Message[];
  // Re-using fields from BaseAgent for consistency
  type: BaseAgent['type'];
  description: BaseAgent['description'];
}

// Interface for a message within the agent-to-agent communication system
export interface AgentMessage {
  id: string;
  agentId: string;
  content: string;
  timestamp: Date;
}

// Interface for the output of a tool execution
export interface ToolOutput {
  id: string;
  toolName: string;
  output: any;
  timestamp: Date;
}

// Interface for a code file being worked on
export interface CodeFile {
  path: string;
  content: string;
}

// Interface for a browser session
export interface BrowserSession {
  sessionId: string;
  url: string;
  status: 'active' | 'inactive';
  title?: string;
  screenshotUrl?: string;
}

// Configuration for spawning a new agent
export interface AgentConfig {
    name: string;
    specialization: string;
    type: BaseAgent['type'];
    description: string;
    model: string;
}

// The complete state and actions for the Ron AI store, as per the prompt
export interface RonAIState {
  // Core Chat State
  messages: Message[];
  currentStreamingMessage: string;
  currentReasoning: string;
  isProcessing: boolean;

  // Agent Ecosystem
  agents: Agent[];
  activeAgents: Set<string>; // Set of agent IDs
  agentCommunications: AgentMessage[];

  // Tool & Execution State
  toolOutputs: ToolOutput[];
  codeFiles: CodeFile[];
  browserSessions: BrowserSession[];

  // Phase 5: Advanced Features State
  deploymentStatus: DeploymentStatus;
  deploymentMessage: string;
  pubmedArticles: PubMedArticle[];
  deepResearchStreamContent: string;

  // UI State
  activeView: 'chat' | 'research' | 'code' | 'browser' | 'agents' | 'search';
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';

  // Drawer State
  isDrawerOpen: boolean;
  drawerContentType: DrawerContentType;
  activeDrawerId: string | null; // To link a chip to a specific item in the drawer

  // Actions
  openDrawer: (contentType: DrawerContentType, activeId?: string) => void;
  closeDrawer: () => void;
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  updateStreamingMessage: (content: string) => void;
  updateReasoning: (content: string) => void;
  spawnAgent: (config: AgentConfig) => void;
  addAgentCommunication: (comm: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
  executeTool: (toolName: string, params: any) => string;
  createBrowserSession: () => Promise<string>;
  closeBrowserSession: (sessionId: string) => void;
  updateBrowserSession: (sessionId: string, data: Partial<Omit<BrowserSession, 'sessionId'>>) => void;

  // Phase 5 Actions
  updateToolOutput: (toolId: string, newOutput: string) => void;
  addCodeFile: (file: CodeFile) => void;
  updateCodeFile: (path: string, newContent: string) => void;
  setPubMedArticles: (articles: PubMedArticle[]) => void;
  updateDeepResearchStream: (content: string) => void;
  deployToVercel: (projectId: string) => Promise<void>;

  // New actions to manage UI state
  setActiveView: (view: RonAIState['activeView']) => void;
  toggleSidebar: () => void;
  setTheme: (theme: RonAIState['theme']) => void;
}

// --- Zustand Store Implementation ---

export const useRonAIStore = create<RonAIState>((set, get) => ({
  // Initial State
  messages: [],
  currentStreamingMessage: '',
  currentReasoning: '',
  isProcessing: false,
  agents: [],
  activeAgents: new Set(),
  agentCommunications: [],
  toolOutputs: [],
  codeFiles: [],
  browserSessions: [],

  // Phase 5 Initial State
  deploymentStatus: 'idle',
  deploymentMessage: '',
  pubmedArticles: [],
  deepResearchStreamContent: '',

  // Drawer State
  isDrawerOpen: false,
  drawerContentType: null,
  activeDrawerId: null,

  activeView: 'chat',
  sidebarCollapsed: false,
  theme: 'dark',

  // Actions
  openDrawer: (contentType, activeId = null) => {
    set({
      isDrawerOpen: true,
      drawerContentType: contentType,
      activeDrawerId: activeId,
    });
  },
  closeDrawer: () => {
    set({ isDrawerOpen: false });
  },
  addMessage: (msg) => {
    const newMessage: Message = {
      ...msg,
      id: uuidv4(),
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  updateStreamingMessage: (content) => {
    set({ currentStreamingMessage: content });
  },

  updateReasoning: (content) => {
    set({ currentReasoning: content });
  },

  spawnAgent: (config) => {
    const newAgent: Agent = {
      id: uuidv4(),
      name: config.name,
      specialization: config.specialization,
      type: config.type,
      description: config.description,
      status: 'idle',
      // New fields for Phase 3
      model: config.model,
      statusHeader: 'Awaiting tasks',
      conversationHistory: [],
    };
    set((state) => ({
      agents: [...state.agents, newAgent],
      activeAgents: new Set(state.activeAgents).add(newAgent.id),
    }));
  },

  addAgentCommunication: (comm) => {
    const newComm: AgentMessage = {
      ...comm,
      id: uuidv4(),
      timestamp: new Date(),
    };
    set((state) => ({
      agentCommunications: [...state.agentCommunications, newComm],
    }));
  },

  executeTool: (toolName, params) => {
    const newToolOutput: ToolOutput = {
      id: uuidv4(),
      toolName,
      output: `Executing with params: ${JSON.stringify(params)}`,
      timestamp: new Date(),
    };
    set((state) => ({
      toolOutputs: [...state.toolOutputs, newToolOutput],
    }));
    return newToolOutput.id;
  },

  updateToolOutput: (toolId: string, newOutput: string) => {
    set((state) => ({
      toolOutputs: state.toolOutputs.map((tool) =>
        tool.id === toolId
          ? { ...tool, output: (tool.output || '') + newOutput }
          : tool
      ),
    }));
  },

  createBrowserSession: async () => {
    const sessionId = `brs-${uuidv4()}`;
    const newSession: BrowserSession = {
      sessionId,
      url: 'about:blank',
      status: 'active',
      title: 'New Tab',
    };
    set((state) => ({
      browserSessions: [...state.browserSessions, newSession],
    }));
    console.log(`Created browser session: ${sessionId}`);
    return sessionId;
  },

  closeBrowserSession: (sessionId: string) => {
    set((state) => ({
      browserSessions: state.browserSessions.filter(
        (session) => session.sessionId !== sessionId
      ),
    }));
  },

  updateBrowserSession: (sessionId: string, data: Partial<Omit<BrowserSession, 'sessionId'>>) => {
    set((state) => ({
      browserSessions: state.browserSessions.map((session) =>
        session.sessionId === sessionId ? { ...session, ...data } : session
      ),
    }));
  },

  // --- Phase 5 Actions Implementation ---
  addCodeFile: (file) => {
    set((state) => ({
      codeFiles: [...state.codeFiles.filter(f => f.path !== file.path), file],
    }));
  },

  updateCodeFile: (path, newContent) => {
    set((state) => ({
      codeFiles: state.codeFiles.map((file) =>
        file.path === path ? { ...file, content: file.content + newContent } : file
      ),
    }));
  },

  setPubMedArticles: (articles) => {
    set({ pubmedArticles: articles });
  },

  updateDeepResearchStream: (content) => {
    set((state) => ({
      deepResearchStreamContent: state.deepResearchStreamContent + content,
    }));
  },

  deployToVercel: async (projectId) => {
    set({ deploymentStatus: 'in-progress', deploymentMessage: `Deploying ${projectId}...` });
    try {
      console.log(`Deploying project ${projectId} to Vercel...`);
      // Mock async operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      set({ deploymentMessage: 'Build in progress...' });
      await new Promise(resolve => setTimeout(resolve, 3000));
      set({ deploymentMessage: 'Finalizing deployment...' });
      await new Promise(resolve => setTimeout(resolve, 1500));

      const isSuccess = Math.random() > 0.2;
      if (isSuccess) {
        set({ deploymentStatus: 'success', deploymentMessage: 'Deployment successful!' });
      } else {
        throw new Error('Mock deployment failure.');
      }
    } catch (error) {
      console.error("Deployment failed:", error);
      set({ deploymentStatus: 'error', deploymentMessage: 'Deployment failed. Check logs.' });
    }
  },

  // UI State Actions
  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setTheme: (theme) => set({ theme }),
}));
