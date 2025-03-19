
import React from 'react';
import Header from '@/components/Header';
import { useWorkspace } from '@/hooks/useWorkspace';
import WorkspaceSelector from '@/components/workspace/WorkspaceSelector';

const WorkspaceHeader = () => {
  const { currentWorkspace } = useWorkspace();
  
  return (
    <Header>
      {currentWorkspace && (
        <div className="ml-2">
          <WorkspaceSelector />
        </div>
      )}
    </Header>
  );
};

export default WorkspaceHeader;
