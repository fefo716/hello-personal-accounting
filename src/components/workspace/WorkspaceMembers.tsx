
import { useEffect, useState } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { User } from 'lucide-react';

const WorkspaceMembers = () => {
  const { currentWorkspace, workspaceMembers, refreshMembers } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [memberProfiles, setMemberProfiles] = useState<any[]>([]);

  useEffect(() => {
    if (open && currentWorkspace) {
      refreshMembers();
    }
  }, [open, currentWorkspace]);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (workspaceMembers.length === 0) return;
      
      try {
        const userIds = workspaceMembers.map(member => member.user_id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);
          
        if (error) throw error;
        
        if (data) {
          setMemberProfiles(data);
        }
      } catch (error) {
        console.error('Error fetching member profiles:', error);
      }
    };
    
    fetchProfiles();
  }, [workspaceMembers]);

  const getUserInitials = (member: any) => {
    const profile = memberProfiles.find(p => p.id === member.user_id);
    if (!profile) return '?';
    
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserName = (member: any) => {
    const profile = memberProfiles.find(p => p.id === member.user_id);
    if (!profile) return 'Usuario desconocido';
    
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email;
  };

  if (!currentWorkspace) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8">
          <User className="h-4 w-4 mr-2" />
          Miembros
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Miembros de {currentWorkspace.name}</DialogTitle>
          <DialogDescription>
            Personas que tienen acceso a este espacio de trabajo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {workspaceMembers.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Cargando miembros...
            </p>
          ) : (
            <div className="space-y-3">
              {workspaceMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getUserInitials(member)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{getUserName(member)}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.role === 'owner' ? 'Propietario' : 'Miembro'}
                      </p>
                    </div>
                  </div>
                  
                  {member.role === 'owner' && (
                    <Badge variant="outline">Propietario</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceMembers;
