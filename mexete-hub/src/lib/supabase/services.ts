import { SupabaseClient } from "@supabase/supabase-js";
import { Project, ProjectWithStatus, KanbanColumn, Task, KanbanColumnWithTasks, TaskWithColumn } from "./schema"

export class ProjectService {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    // Get active projects (not archived or deleted)
    async getActiveProjects(userId: string): Promise<ProjectWithStatus[]> {
      const { data, error } = await this.supabase
        .from('projects')
        .select(`
          *,
          status:project_statuses(name)
        `)
        .eq('user_id', userId)
        .is('archived_at', null)
        .is('deleted_at', null)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    }
}

export class KanbanColumnService {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    // Get columns for a project
    async getColumnsByProject(projectId: string): Promise<KanbanColumn[]> {
        console.log('Getting columns for project:', projectId);
        
        // First, let's check if we can access the table at all
        const { data: allColumns, error: allError } = await this.supabase
            .from('kanban_columns')
            .select('*')
            .limit(5);
        
        console.log('All columns test:', { allColumns, allError });
        
        const { data, error } = await this.supabase
            .from('kanban_columns')
            .select('*')
            .eq('project_id', projectId)
            .order('order_index', { ascending: true });

        console.log('Columns query result:', { data, error });
        if (error) {
            console.error('Detailed error:', error);
            throw error;
        }
        return data || [];
    }

    // Create a new column
    async createColumn(columnData: Omit<KanbanColumn, 'id' | 'created_at' | 'updated_at'>): Promise<KanbanColumn> {
        const { data, error } = await this.supabase
            .from('kanban_columns')
            .insert(columnData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Update a column
    async updateColumn(id: string, updates: Partial<KanbanColumn>): Promise<KanbanColumn> {
        const { data, error } = await this.supabase
            .from('kanban_columns')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Delete a column
    async deleteColumn(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('kanban_columns')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // Reorder columns
    async reorderColumns(projectId: string, columnIds: string[]): Promise<void> {
        const updates = columnIds.map((id, index) => ({
            id,
            order_index: index
        }));

        const { error } = await this.supabase
            .from('kanban_columns')
            .upsert(updates);

        if (error) throw error;
    }
}

export class TaskService {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    // Get tasks for a project
    async getTasksByProject(projectId: string): Promise<TaskWithColumn[]> {
        console.log('Getting tasks for project:', projectId);
        const { data, error } = await this.supabase
            .from('tasks')
            .select(`
                *,
                column:kanban_columns(*)
            `)
            .eq('project_id', projectId)
            .order('order_index', { ascending: true });

        console.log('Tasks query result:', { data, error });
        if (error) throw error;
        return data || [];
    }

    // Get tasks for a specific column
    async getTasksByColumn(columnId: string): Promise<Task[]> {
        const { data, error } = await this.supabase
            .from('tasks')
            .select('*')
            .eq('column_id', columnId)
            .order('order_index', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    // Create a new task
    async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
        const { data, error } = await this.supabase
            .from('tasks')
            .insert(taskData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Update a task
    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
        const { data, error } = await this.supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Delete a task
    async deleteTask(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // Move task to different column
    async moveTask(taskId: string, columnId: string, orderIndex: number): Promise<Task> {
        const { data, error } = await this.supabase
            .from('tasks')
            .update({
                column_id: columnId,
                order_index: orderIndex,
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId)
            .select()
            .maybeSingle();

            if (error) throw error;
            if (!data) throw new Error(`Task with id ${taskId} not found`);
            return data;
    }

    async reorderTasks(columnId: string, taskIds: string[]): Promise<void> {
      if (taskIds.length === 0) return;
  
      // Use a transaction-like approach with multiple updates
      const updates = taskIds.map((id, index) => ({
          id,
          order_index: index,
          updated_at: new Date().toISOString()
      }));
  
      // Update each task individually to avoid the PGRST116 error
      for (const update of updates) {
          const { error } = await this.supabase
              .from('tasks')
              .update(update)
              .eq('id', update.id);
          
          if (error) throw error;
      }
    }
}