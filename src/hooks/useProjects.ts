import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/esg';
import { toast } from 'sonner';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      
      // Set first project as active if none selected
      if (data && data.length > 0 && !activeProjectId) {
        setActiveProjectId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [data, ...prev]);
      setActiveProjectId(data.id);
      toast.success('Project created successfully');
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      return null;
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  return {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    createProject,
    loading,
    refetch: fetchProjects,
  };
}
