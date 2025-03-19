import { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Workspace, WorkspaceMember } from '@/types';

interface WorkspaceContextProps {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  workspaceMembers: WorkspaceMember[];
  loadingWorkspaces: boolean;
  loadingMembers: boolean;
  createWorkspace: (name: string) => Promise<Workspace | null>;
  createPersonalWorkspace: () => Promise<Workspace | null>;
  joinWorkspace: (code: string) => Promise<boolean>;
  switchWorkspace: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
  refreshMembers: () => Promise<void>;
}

export const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      refreshWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoadingWorkspaces(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (currentWorkspace) {
      refreshMembers();
      
      localStorage.setItem('currentWorkspaceId', currentWorkspace.id);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    if (workspaces.length > 0) {
      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      if (savedWorkspaceId) {
        const savedWorkspace = workspaces.find(w => w.id === savedWorkspaceId);
        if (savedWorkspace) {
          setCurrentWorkspace(savedWorkspace);
          return;
        }
      }
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces]);

  const refreshWorkspaces = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoadingWorkspaces(true);
      
      const { data: memberships, error: membershipError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', session.user.id);
        
      if (membershipError) throw membershipError;
      
      if (memberships && memberships.length > 0) {
        const workspaceIds = memberships.map(m => m.workspace_id);
        
        const { data: workspacesData, error: workspacesError } = await supabase
          .from('workspaces')
          .select('*')
          .in('id', workspaceIds)
          .order('created_at', { ascending: false });
          
        if (workspacesError) throw workspacesError;
        
        if (workspacesData) {
          setWorkspaces(workspacesData as Workspace[]);
        }
      } else {
        setWorkspaces([]);
      }
      
    } catch (error: any) {
      console.error('Error loading workspaces:', error.message);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los espacios de trabajo',
        variant: 'destructive',
      });
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  const refreshMembers = async () => {
    if (!currentWorkspace) return;
    
    try {
      setLoadingMembers(true);
      
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('workspace_id', currentWorkspace.id);
        
      if (error) throw error;
      
      if (data) {
        setWorkspaceMembers(data as WorkspaceMember[]);
      }
      
    } catch (error: any) {
      console.error('Error loading workspace members:', error.message);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los miembros del espacio de trabajo',
        variant: 'destructive',
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  const createWorkspace = async (name: string): Promise<Workspace | null> => {
    if (!session?.user?.id) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para crear un espacio de trabajo',
        variant: 'destructive',
      });
      return null;
    }
    
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name,
          code,
          created_by: session.user.id
        })
        .select()
        .single();
        
      if (workspaceError) throw workspaceError;
      
      if (!workspace) throw new Error('No se pudo crear el espacio de trabajo');
      
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: session.user.id,
          role: 'owner'
        });
        
      if (memberError) {
        console.error('Error adding member to workspace:', memberError);
        toast({
          title: 'Advertencia',
          description: 'El espacio se creó pero hubo un problema al añadirte como miembro. Intenta actualizar la página.',
          variant: 'default',
        });
      }
      
      await refreshWorkspaces();
      
      setCurrentWorkspace(workspace as Workspace);
      
      toast({
        title: 'Espacio de trabajo creado',
        description: `Se ha creado "${name}" correctamente`,
      });
      
      return workspace as Workspace;
      
    } catch (error: any) {
      console.error('Error creating workspace:', error.message);
      
      let errorMessage = 'No se pudo crear el espacio de trabajo';
      
      if (error.message.includes('infinite recursion')) {
        errorMessage = 'Hubo un problema con los permisos. Por favor, inténtalo de nuevo.';
      } else if (error.code === '23505') {
        errorMessage = 'Ya existe un espacio de trabajo con ese nombre o código.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  };

  const createPersonalWorkspace = async (): Promise<Workspace | null> => {
    if (!session?.user?.id) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para crear un espacio de trabajo',
        variant: 'destructive',
      });
      return null;
    }
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }
      
      const firstName = profileData?.first_name || '';
      const lastName = profileData?.last_name || '';
      let workspaceName = 'Espacio Personal';
      
      if (firstName || lastName) {
        workspaceName = `${firstName} ${lastName}`.trim();
      }
      
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: workspaceName,
          code,
          created_by: session.user.id
        })
        .select()
        .single();
        
      if (workspaceError) throw workspaceError;
      
      if (!workspace) throw new Error('No se pudo crear el espacio de trabajo');
      
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: session.user.id,
          role: 'owner'
        });
        
      if (memberError) {
        console.error('Error adding member to workspace:', memberError);
      }
      
      await refreshWorkspaces();
      
      setCurrentWorkspace(workspace as Workspace);
      
      toast({
        title: 'Espacio personal creado',
        description: `Se ha creado "${workspaceName}" automáticamente`,
        duration: 3000,
      });
      
      return workspace as Workspace;
      
    } catch (error: any) {
      console.error('Error creating personal workspace:', error.message);
      
      toast({
        title: 'Error',
        description: 'No se pudo crear el espacio personal. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const joinWorkspace = async (code: string): Promise<boolean> => {
    if (!session?.user?.id) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para unirte a un espacio de trabajo',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('code', code)
        .single();
        
      if (workspaceError) {
        if (workspaceError.code === 'PGRST116') {
          toast({
            title: 'Código inválido',
            description: 'No se encontró ningún espacio de trabajo con ese código',
            variant: 'destructive',
          });
        } else {
          throw workspaceError;
        }
        return false;
      }
      
      if (!workspace) {
        toast({
          title: 'Código inválido',
          description: 'No se encontró ningún espacio de trabajo con ese código',
          variant: 'destructive',
        });
        return false;
      }
      
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('user_id', session.user.id)
        .single();
        
      if (existingMember) {
        toast({
          title: 'Ya eres miembro',
          description: 'Ya perteneces a este espacio de trabajo',
        });
        setCurrentWorkspace(workspace as Workspace);
        await refreshWorkspaces();
        return true;
      }
      
      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        throw memberCheckError;
      }
      
      let joinAttempts = 0;
      const maxAttempts = 2;
      let joinError = null;
      
      while (joinAttempts < maxAttempts) {
        const { error } = await supabase
          .from('workspace_members')
          .insert({
            workspace_id: workspace.id,
            user_id: session.user.id,
            role: 'member'
          });
          
        if (!error) {
          break;
        }
        
        joinError = error;
        console.log(`Join attempt ${joinAttempts + 1} failed:`, error);
        joinAttempts++;
        
        if (joinAttempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (joinError) {
        console.error('All join attempts failed:', joinError);
        
        let errorMessage = 'No se pudo unir al espacio de trabajo';
        
        if (joinError.message.includes('violates row-level security')) {
          errorMessage = 'No tienes permiso para unirte a este espacio de trabajo';
        } else if (joinError.message.includes('duplicate key')) {
          toast({
            title: 'Ya eres miembro',
            description: 'Ya perteneces a este espacio de trabajo',
          });
          setCurrentWorkspace(workspace as Workspace);
          await refreshWorkspaces();
          return true;
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
      }
      
      await refreshWorkspaces();
      
      setCurrentWorkspace(workspace as Workspace);
      
      toast({
        title: 'Te has unido correctamente',
        description: `Ahora eres miembro de "${workspace.name}"`,
      });
      
      return true;
      
    } catch (error: any) {
      console.error('Error joining workspace:', error.message);
      
      let errorMessage = 'No se pudo unir al espacio de trabajo';
      
      if (error.message.includes('duplicate key')) {
        errorMessage = 'Ya eres miembro de este espacio de trabajo';
      } else if (error.message.includes('violates row-level security')) {
        errorMessage = 'No tienes permiso para unirte a este espacio de trabajo';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const switchWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        workspaceMembers,
        loadingWorkspaces,
        loadingMembers,
        createWorkspace,
        createPersonalWorkspace,
        joinWorkspace,
        switchWorkspace,
        refreshWorkspaces,
        refreshMembers
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
