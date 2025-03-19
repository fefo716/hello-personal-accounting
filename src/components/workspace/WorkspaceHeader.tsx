
import React from 'react';
import Header from '@/components/Header';
import { useWorkspace } from '@/hooks/useWorkspace';
import WorkspaceSelector from '@/components/workspace/WorkspaceSelector';
import WorkspaceInvite from '@/components/workspace/WorkspaceInvite';

const WorkspaceHeader = () => {
  const { currentWorkspace } = useWorkspace();
  
  return (
    <div className="flex flex-col">
      <Header />
      {currentWorkspace && (
        <div className="px-4 py-2 flex items-center justify-between">
          <WorkspaceSelector />
          <WorkspaceInvite />
        </div>
      )}
    </div>
  );
};

export default WorkspaceHeader;
