
import React from 'react';
import Header from '@/components/Header';
import { useWorkspace } from '@/hooks/useWorkspace';
import WorkspaceSelector from '@/components/workspace/WorkspaceSelector';

const WorkspaceHeader = () => {
  const { currentWorkspace } = useWorkspace();
  
  // We're not properly using the Header component. Looking at Header.tsx, 
  // it doesn't accept children as props but is a complete component itself.
  // Let's use it correctly:
  return (
    <Header />
  );
};

export default WorkspaceHeader;
