// /src/lib/ron-ai-store.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Message as BaseMessage, Agent as BaseAgent } from './types';

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
  status: 'idle' | 'working' | 'finished';
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
}

// Configuration for spawning a new agent
export interface AgentConfig {
    name: string;
    specialization: string;
    type: BaseAgent['type'];
    description: string;
}

// The complete state and actions for the Ron AI store, as per the prompt
export interface RonAIState {
  // Core Chat State
  messages: Message[];
  currentStreamingMessage: string;
  isProcessing: boolean;

  // Agent Ecosystem
  agents: Agent[];
  activeAgents: Set<string>; // Set of agent IDs
  agentCommunications: AgentMessage[];

  // Tool & Execution State
  toolOutputs: ToolOutput[];
  codeFiles: CodeFile[];
  browserSessions: BrowserSession[];

  // UI State
  activeView: 'chat' | 'research' | 'code' | 'browser';
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';

  // Actions
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  updateStreamingMessage: (content: string) => void;
  spawnAgent: (config: AgentConfig) => void;
  executeTool: (toolName: string, params: any) => void;
  createBrowserSession: () => Promise<string>;
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
  isProcessing: false,
  agents: [],
  activeAgents: new Set(),
  agentCommunications: [],
  toolOutputs: [],
  codeFiles: [],
  browserSessions: [],
  activeView: 'chat',
  sidebarCollapsed: false,
  theme: 'dark',

  // Actions
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

  spawnAgent: (config) => {
    const newAgent: Agent = {
      id: uuidv4(),
      name: config.name,
      specialization: config.specialization,
      type: config.type,
      description: config.description,
      status: 'idle',
    };
    set((state) => ({
      agents: [...state.agents, newAgent],
      activeAgents: new Set(state.activeAgents).add(newAgent.id),
    }));
  },

  executeTool: (toolName, params) => {
    console.log(`Executing tool: ${toolName}`, params);
    const output: ToolOutput = {
      toolName,
      output: `Mock output for ${toolName} with params: ${JSON.stringify(params)}`,
      timestamp: new Date(),
    };
    set((state) => ({
      toolOutputs: [...state.toolOutputs, output],
    }));
  },

  createBrowserSession: async () => {
    const sessionId = `brs-${uuidv4()}`;
    const newSession: BrowserSession = {
      sessionId,
      url: 'about:blank',
      status: 'active',
    };
    set((state) => ({
      browserSessions: [...state.browserSessions, newSession],
    }));
    console.log(`Created browser session: ${sessionId}`);
    return sessionId;
  },

  deployToVercel: async (projectId) => {
    console.log(`Deploying project ${projectId} to Vercel...`);
    // Mock async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Deployment to ${projectId} complete.`);
  },

  // UI State Actions
  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setTheme: (theme) => set({ theme }),
}));
