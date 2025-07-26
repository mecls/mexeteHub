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
      
      // First, get all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .is('archived_at', null)
        .is('deleted_at', null)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });

      if (projectsError) {
        throw projectsError;
      }

      // Then, get all statuses
      const { data: statusesData, error: statusesError } = await supabase
        .from('project_statuses')
        .select('*');

      if (statusesError) {
        throw statusesError;
      }

      // Combine the data manually
      const data = projectsData?.map(project => ({
        ...project,
        status: statusesData?.find(status => status.id === project.status_id)
      })) || [];

      console.log('Fetched projects with status:', data);
      console.log('First project status object:', data?.[0]?.status);
      console.log('First project status_id:', data?.[0]?.status_id);
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

    // Get the first available status if no status_id is provided
    let statusId: number;
    if (projectData.status_id) {
      statusId = projectData.status_id;
    } else {
      try {
        const { data: statuses, error: statusError } = await supabase
          .from('project_statuses')
          .select('id')
          .order('id', { ascending: true })
          .limit(1)
          .single();
        
        if (statusError) {
          console.error('Error fetching first status:', statusError);
          throw new Error('No project statuses available');
        }
        
        statusId = statuses.id;
        console.log('Using first available status_id:', statusId);
      } catch (err) {
        console.error('Error getting first status:', err);
        throw new Error('Failed to get project status');
      }
    }

    // Create optimistic project
    const optimisticProject: ProjectWithStatus = {
      id: `temp-${Date.now()}`, // Temporary ID
      user_id: user.id,
      name: projectData.name || 'New Project',
      description: projectData.description,
      status_id: statusId,
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
      console.log('About to insert project with data:', {
        name: optimisticProject.name,
        user_id: user.id,
        icon: optimisticProject.icon,
        progress: optimisticProject.progress,
        is_favorite: optimisticProject.is_favorite,
        status_id: optimisticProject.status_id,
      });

      // Save to database
      const { data: newProject, error: insertError } = await supabase
        .from('projects')
        .insert({
          name: optimisticProject.name,
          user_id: user.id,
          icon: optimisticProject.icon,
          progress: optimisticProject.progress,
          is_favorite: optimisticProject.is_favorite,
          status_id: optimisticProject.status_id,
        })
        .select('*')
        .single();

      console.log('Insert result:', { newProject, insertError });

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw insertError;
      }

      console.log('Project inserted successfully, fetching status for status_id:', newProject.status_id);

      // Get the status for the new project
      const { data: statusData, error: statusError } = await supabase
        .from('project_statuses')
        .select('*')
        .eq('id', newProject.status_id)
        .single();

      console.log('Status fetch result:', { statusData, statusError });

      if (statusError) {
        console.error('Status error details:', statusError);
        throw statusError;
      }

      const data = {
        ...newProject,
        status: statusData
      };

      // Replace optimistic project with real one
      setProjects(prev => 
        prev.map(p => p.id === optimisticProject.id ? data : p)
      );

      return data;
    } catch (err) {
      console.error('Error creating project:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      });
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