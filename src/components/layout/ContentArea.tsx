import React from 'react';

interface ContentAreaProps {
  children: React.ReactNode;
}

const ContentArea: React.FC<ContentAreaProps> = ({ children }) => {
  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      {children}
    </main>
  );
};

export default ContentArea;
