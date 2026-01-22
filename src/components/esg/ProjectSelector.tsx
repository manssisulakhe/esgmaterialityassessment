import { useState } from 'react';
import { Plus, FolderOpen, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Project } from '@/types/esg';

interface ProjectSelectorProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string) => Promise<Project | null>;
}

export function ProjectSelector({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
}: ProjectSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;

    setCreating(true);
    await onCreateProject(newProjectName.trim());
    setNewProjectName('');
    setDialogOpen(false);
    setCreating(false);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[200px] justify-between bg-card border-border hover:bg-accent"
            >
              <span className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                <span className="truncate">
                  {activeProject?.name || 'Select Project'}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            {projects.map(project => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="flex items-center justify-between"
              >
                <span className="truncate">{project.name}</span>
                {project.id === activeProject?.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
            {projects.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => setDialogOpen(true)}
              className="text-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={() => setDialogOpen(true)}
          className="esg-gradient text-primary-foreground hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Project
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g., 2024 Sustainability Assessment"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newProjectName.trim() || creating}
              className="esg-gradient text-primary-foreground"
            >
              {creating ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
