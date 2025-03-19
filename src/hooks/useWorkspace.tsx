
import { useContext } from 'react';
import { WorkspaceContext } from '@/contexts/WorkspaceContext';

// El hook useWorkspace simplemente expone el contexto
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

// Re-exportamos el provider desde el contexto para facilitar su uso
export { WorkspaceProvider } from '@/contexts/WorkspaceContext';
