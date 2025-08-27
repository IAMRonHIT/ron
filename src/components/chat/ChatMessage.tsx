import React from 'react';
import { Message } from '@/lib/ron-ai-store';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-4 w-full`}>
      {/* Bot Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}

      {/* Message Content */}
      <div
        className={`max-w-3xl rounded-2xl p-4 ${
          isUser
            ? 'ml-auto bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        }`}
      >
        <ReactMarkdown
          className="prose prose-sm dark:prose-invert max-w-none"
          remarkPlugins={[remarkGfm]}
          components={{
            // Customize heading rendering if needed
            h1: ({node, ...props}) => <h1 className="text-xl font-bold" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-semibold" {...props} />,
            // Add more custom components for code blocks, etc. later
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>

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
