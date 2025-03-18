
import { useState } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Users } from 'lucide-react';

const WorkspaceInvite = () => {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleCopyCode = () => {
    if (!currentWorkspace) return;
    
    navigator.clipboard.writeText(currentWorkspace.code);
    
    toast({
      title: 'Código copiado',
      description: 'El código de invitación ha sido copiado al portapapeles',
    });
  };

  if (!currentWorkspace) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Users className="h-4 w-4 mr-2" />
          Invitar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar a {currentWorkspace.name}</DialogTitle>
          <DialogDescription>
            Comparte este código con las personas que quieres invitar a este espacio de trabajo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2">
          <Input
            value={currentWorkspace.code}
            readOnly
            className="font-mono text-center"
          />
          <Button size="sm" variant="ghost" onClick={handleCopyCode}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <DialogDescription>
            Las personas invitadas podrán ver y crear transacciones en este espacio.
          </DialogDescription>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceInvite;
