"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/supabase';
import { Project, ProjectWithStatus } from '@/lib/supabase/schema';
import { useUser } from './UserContext';

interface ProjectContextType {
  projects: ProjectWithStatus[];
  currentProject: ProjectWithStatus | null;
  loading: boolean;
  error: string | null;
  createProject: (projectData: Partial<Project>) => Promise<ProjectWithStatus>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: ProjectWithStatus | null) => void;
  setProjects: (projects: ProjectWithStatus[]) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const { user } = useUser();
  const [projects, setProjects] = useState<ProjectWithStatus[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectWithStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          status:project_statuses(name)
        `)
        .eq('user_id', user.id)
        .is('archived_at', null)
        .is('deleted_at', null)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Partial<Project>): Promise<ProjectWithStatus> => {
    if (!user) throw new Error('User not found');

    // Create optimistic project
    const optimisticProject: ProjectWithStatus = {
      id: `temp-${Date.now()}`, // Temporary ID
      user_id: user.id,
      name: projectData.name || 'New Project',
      description: projectData.description,
      status_id: projectData.status_id,
      progress: projectData.progress || 0,
      icon: projectData.icon || '📁',
      is_favorite: projectData.is_favorite || false,
      due_date: projectData.due_date,
      archived_at: undefined,
      deleted_at: undefined,
      created_at: new Date(),
      updated_at: new Date(),
      status: undefined
    };

    // Optimistically add to state
    setProjects(prev => [optimisticProject, ...prev]);

    try {
      // Save to database
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: optimisticProject.name,
          user_id: user.id,
          icon: optimisticProject.icon,
          progress: optimisticProject.progress,
          is_favorite: optimisticProject.is_favorite,
        })
        .select(`
          *,
          status:project_statuses(name)
        `)
        .single();

      if (error) throw error;

      // Replace optimistic project with real one
      setProjects(prev => 
        prev.map(p => p.id === optimisticProject.id ? data : p)
      );

      return data;
    } catch (err) {
      console.error('Error creating project:', err);
      // Remove optimistic project on error
      setProjects(prev => prev.filter(p => p.id !== optimisticProject.id));
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<void> => {
    // Optimistic update
    setProjects(prev => 
      prev.map(project => 
        project.id === id 
          ? { ...project, ...updates, updated_at: new Date() }
          : project
      )
    );

    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating project:', err);
      // Revert optimistic update
      await fetchProjects();
      throw err;
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    // Optimistic delete
    setProjects(prev => prev.filter(p => p.id !== id));

    try {
      const { error } = await supabase
        .from('projects')
        .update({ deleted_at: new Date() })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting project:', err);
      // Revert optimistic delete
      await fetchProjects();
      throw err;
    }
  };

  const refreshProjects = async () => {
    await fetchProjects();
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const value = {
    projects,
    currentProject,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    refreshProjects,
    setProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}; 