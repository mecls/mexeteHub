export interface ProjectStatus {
    id: number;
    name: string;
  }
  
  export interface Project {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    status_id?: number;
    progress: number;
    icon: string | '⚠️';
    is_favorite: boolean;
    due_date?: Date;
    archived_at?: Date;
    deleted_at?: Date;
    created_at: Date;
    updated_at: Date;
  }
  
  // Helper functions
  const isArchived = (project: Project): boolean => project.archived_at !== null;
  const isDeleted = (project: Project): boolean => project.deleted_at !== null;
  const isActive = (project: Project): boolean => !isArchived(project) && !isDeleted(project);
  
  // Extended interface with status name
  export interface ProjectWithStatus extends Project {
    status?: ProjectStatus;
  }