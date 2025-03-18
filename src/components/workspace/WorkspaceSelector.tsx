
import { useState } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, Plus, Users, User } from 'lucide-react';

const WorkspaceSelector = () => {
  const { currentWorkspace, workspaces, switchWorkspace, createWorkspace, joinWorkspace } = useWorkspace();
  const [openDialog, setOpenDialog] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [workspaceCode, setWorkspaceCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    
    setIsCreating(true);
    try {
      await createWorkspace(newWorkspaceName);
      setOpenDialog(false);
      setNewWorkspaceName('');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinWorkspace = async () => {
    if (!workspaceCode.trim()) return;
    
    setIsJoining(true);
    try {
      const success = await joinWorkspace(workspaceCode);
      if (success) {
        setOpenDialog(false);
        setWorkspaceCode('');
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="px-2 w-full justify-between">
            <div className="flex items-center gap-2 truncate">
              <Users className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {currentWorkspace?.name || "Seleccionar espacio"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Mis espacios</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {workspaces.map(workspace => (
            <DropdownMenuItem 
              key={workspace.id}
              onClick={() => switchWorkspace(workspace.id)}
              className={`${currentWorkspace?.id === workspace.id ? 'bg-accent' : ''}`}
            >
              <div className="flex items-center gap-2 w-full truncate">
                <Users className="h-4 w-4 shrink-0" />
                <span className="truncate">{workspace.name}</span>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOpenDialog(true)}>
            <div className="flex items-center gap-2 w-full">
              <Plus className="h-4 w-4" />
              <span>Crear o unirse</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Espacios de trabajo</DialogTitle>
            <DialogDescription>
              Crea un nuevo espacio o únete a uno existente.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Crear</TabsTrigger>
              <TabsTrigger value="join">Unirse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Nombre del espacio</Label>
                <Input 
                  id="workspace-name" 
                  placeholder="Mi espacio personal" 
                  value={newWorkspaceName}
                  onChange={e => setNewWorkspaceName(e.target.value)}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleCreateWorkspace}
                  disabled={!newWorkspaceName.trim() || isCreating}
                >
                  {isCreating ? 'Creando...' : 'Crear espacio'}
                </Button>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="join" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-code">Código de invitación</Label>
                <Input 
                  id="workspace-code" 
                  placeholder="Ingresa el código" 
                  value={workspaceCode}
                  onChange={e => setWorkspaceCode(e.target.value)}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleJoinWorkspace}
                  disabled={!workspaceCode.trim() || isJoining}
                >
                  {isJoining ? 'Uniéndose...' : 'Unirse al espacio'}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkspaceSelector;
