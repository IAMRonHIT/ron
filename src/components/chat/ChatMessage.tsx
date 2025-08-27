import React from 'react';
import { Message } from '@/lib/ron-ai-store';
import { User, Bot, FlaskConical, Code, Beaker, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ActionChip from './ActionChip';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Mock data for action chips, would come from message.data in a real implementation
  const hasActions = !isUser && message.content.includes("doctor");

  return (
    <div className={cn("flex flex-col", isUser ? 'items-end' : 'items-start')}>
      <div className="flex items-start gap-3 w-full max-w-4xl" style={{ flexDirection: isUser ? 'row-reverse' : 'row' }}>
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-surface-tertiary" : "bg-accent-gradient"
        )}>
          {isUser ? (
            <User className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-inner p-4 w-fit max-w-full",
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-surface-secondary text-foreground'
          )}
        >
          <ReactMarkdown
            className="prose prose-sm dark:prose-invert max-w-none"
            remarkPlugins={[remarkGfm]}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Action Chips for Assistant Messages */}
      {hasActions && (
        <div className="flex items-center gap-2 mt-2" style={{ paddingLeft: isUser ? '0' : '3.25rem' }}>
            <ActionChip icon={FlaskConical} label="Tool" status="completed" drawerView="Tool" />
            <ActionChip icon={Code} label="Code" status="idle" drawerView="Code" />
            <ActionChip icon={Search} label="Browser" status="in-progress" drawerView="Browser" />
            <ActionChip icon={Beaker} label="Research" status="error" drawerView="Research" />
        </div>
      )}

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
