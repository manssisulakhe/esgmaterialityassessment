import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/types/esg';
import { toast } from 'sonner';

export function useFirestoreProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      console.log('🔥 Fetching projects from Firestore...');
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      
      const projectsData: Project[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));
      
      console.log('🔥 Fetched projects:', projectsData);
      setProjects(projectsData);
      
      // Set first project as active if none selected
      setActiveProjectId(prev => {
        if (!prev && projectsData.length > 0) {
          return projectsData[0].id;
        }
        return prev;
      });
    } catch (error) {
      console.error('🔥 Error fetching projects:', error);
      toast.error('Failed to load projects from Firestore');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (name: string) => {
    try {
      console.log('🔥 Creating project in Firestore:', name);
      const projectsRef = collection(db, 'projects');
      const now = Timestamp.now();
      
      const docRef = await addDoc(projectsRef, {
        name,
        created_at: now,
        updated_at: now,
      });
      
      const newProject: Project = {
        id: docRef.id,
        name,
        created_at: now.toDate().toISOString(),
        updated_at: now.toDate().toISOString(),
      };
      
      console.log('🔥 Created project:', newProject);
      setProjects(prev => [newProject, ...prev]);
      setActiveProjectId(docRef.id);
      toast.success('Project created successfully');
      return newProject;
    } catch (error) {
      console.error('🔥 Error creating project:', error);
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
