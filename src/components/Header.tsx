
// Este archivo es de solo lectura, vamos a crear un wrapper que incluya el selector de workspace
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import WorkspaceSelector from '@/components/workspace/WorkspaceSelector';
import WorkspaceInvite from '@/components/workspace/WorkspaceInvite';
import WorkspaceMembers from '@/components/workspace/WorkspaceMembers';

const WorkspaceHeader = () => {
  const [open, setOpen] = useState(false);
  const { session } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Historial', href: '/history' },
    { name: 'Estadísticas', href: '/statistics' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          <Link to="/" className="font-semibold">
            <span className="sr-only">Finanzas</span>
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-primary"></div>
              <span>Finanzas</span>
            </div>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground/80",
                  location.pathname === item.href
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        {session && (
          <div className="flex items-center gap-2">
            <div className="hidden md:block w-48">
              <WorkspaceSelector />
            </div>
            <div className="hidden md:flex">
              <WorkspaceInvite />
              <WorkspaceMembers />
            </div>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="grid gap-6 py-6">
                  <div className="space-y-4">
                    <div className="mb-4">
                      <WorkspaceSelector />
                    </div>
                    <div className="flex gap-2">
                      <WorkspaceInvite />
                      <WorkspaceMembers />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                          location.pathname === item.href
                            ? "bg-accent"
                            : "hover:bg-accent/50"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  );
};

export default WorkspaceHeader;
