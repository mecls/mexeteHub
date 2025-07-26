export interface ProjectStatus {
  id: number;
  name: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status_id: number;
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
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface KanbanColumn {
  id: string;
  project_id: string;
  title: string;
  order_index: number;
  bg_color: string;
  header_bg_color: string;
  dot_color: string;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  project_id: string;
  column_id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  start_date?: Date;
  due_date?: Date;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface TaskWithColumn extends Task {
  column?: KanbanColumn;
}

export interface KanbanColumnWithTasks extends KanbanColumn {
  tasks?: Task[];
}