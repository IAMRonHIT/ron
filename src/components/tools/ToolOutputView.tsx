import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ToolOutputView = () => {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Tool Output</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where the detailed output of a tool execution will be displayed.</p>
          <pre className="mt-4 p-4 bg-surface-secondary rounded-inner">
            <code>
              {JSON.stringify({ result: 'Sample tool output data.' }, null, 2)}
            </code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolOutputView;
