"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/supabase';
import { KanbanColumn, Task, KanbanColumnWithTasks, TaskWithColumn } from '@/lib/supabase/schema';
import { KanbanColumnService, TaskService } from '@/lib/supabase/services';

interface TaskContextType {
  columns: KanbanColumnWithTasks[];
  tasks: TaskWithColumn[];
  loading: boolean;
  error: string | null;
  operationLoading: Set<string>;
  currentProjectId: string | null;
  setCurrentProjectId: (projectId: string | null) => void;
  fetchColumnsAndTasks: (projectId: string) => Promise<void>;
  createColumn: (columnData: Omit<KanbanColumn, 'id' | 'created_at' | 'updated_at'>) => Promise<KanbanColumn>;
  updateColumn: (id: string, updates: Partial<KanbanColumn>) => Promise<KanbanColumn>;
  deleteColumn: (id: string) => Promise<void>;
  reorderColumns: (columnIds: string[]) => Promise<void>;
  createTask: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, columnId: string, orderIndex: number) => Promise<Task>;
  reorderTasks: (columnId: string, taskIds: string[]) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [columns, setColumns] = useState<KanbanColumnWithTasks[]>([]);
  const [tasks, setTasks] = useState<TaskWithColumn[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState<Set<string>>(new Set());

  // Use useMemo to avoid re-creating these on every render
  const columnService = useMemo(() => new KanbanColumnService(supabase), []);
  const taskService = useMemo(() => new TaskService(supabase), []);

  const fetchColumnsAndTasks = useCallback(async (projectId: string) => {
    // Don't re-fetch if we already have data for this project
    if (currentProjectId === projectId && columns.length > 0) {
      console.log('Already have data for project:', projectId);
      return;
    }

    try {
      console.log('Fetching columns and tasks for project:', projectId);
      
      // Check if we have a user session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth check:', { user, authError });
      
      // Don't set loading to true - allow instant rendering
      setError(null);

      // Fetch columns and tasks in parallel
      const [columnsData, tasksData] = await Promise.all([
        columnService.getColumnsByProject(projectId),
        taskService.getTasksByProject(projectId)
      ]);

      console.log('Fetched data:', { columnsData, tasksData });

      // Group tasks by column
      const columnsWithTasks = columnsData.map(column => ({
        ...column,
        tasks: tasksData.filter(task => task.column_id === column.id)
      }));

      console.log('Columns with tasks:', columnsWithTasks);

      setColumns(columnsWithTasks);
      setTasks(tasksData);
    } catch (err) {
      console.error('Error fetching columns and tasks:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      });
      setError('Failed to load columns and tasks');
    }
  }, [columnService, taskService, currentProjectId, columns.length]);

  const createColumn = useCallback(async (columnData: Omit<KanbanColumn, 'id' | 'created_at' | 'updated_at'>): Promise<KanbanColumn> => {
    try {
      const newColumn = await columnService.createColumn(columnData);
      
      // Add to state
      setColumns(prev => [...prev, { ...newColumn, tasks: [] }]);
      
      return newColumn;
    } catch (err) {
      console.error('Error creating column:', err);
      throw err;
    }
  }, [columnService]);

  const updateColumn = useCallback(async (id: string, updates: Partial<KanbanColumn>): Promise<KanbanColumn> => {
    try {
      const updatedColumn = await columnService.updateColumn(id, updates);
      
      // Update in state
      setColumns(prev => 
        prev.map(col => col.id === id ? { ...col, ...updatedColumn } : col)
      );
      
      return updatedColumn;
    } catch (err) {
      console.error('Error updating column:', err);
      throw err;
    }
  }, [columnService]);

  const deleteColumn = useCallback(async (id: string): Promise<void> => {
    try {
      await columnService.deleteColumn(id);
      
      // Remove from state
      setColumns(prev => prev.filter(col => col.id !== id));
      setTasks(prev => prev.filter(task => task.column_id !== id));
    } catch (err) {
      console.error('Error deleting column:', err);
      throw err;
    }
  }, [columnService]);

  const reorderColumns = useCallback(async (columnIds: string[]): Promise<void> => {
    if (!currentProjectId) return;

    // Store original state for rollback
    const originalColumns = [...columns];

    // Optimistic update - immediately update UI
    setColumns(prev => {
      const reordered = columnIds.map(id => 
        prev.find(col => col.id === id)
      ).filter(Boolean) as KanbanColumnWithTasks[];
      
      return reordered;
    });

    try {
      // Make API call
      await columnService.reorderColumns(currentProjectId, columnIds);
      
      // No need to update state again since optimistic update was correct
    } catch (err) {
      console.error('Error reordering columns:', err);
      
      // Rollback optimistic changes on error
      setColumns(originalColumns);
      
      throw err;
    }
  }, [columnService, currentProjectId, columns]);

  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
    try {
      const newTask = await taskService.createTask(taskData);
      
      // Add to state
      setTasks(prev => [...prev, newTask]);
      setColumns(prev => 
        prev.map(col => 
          col.id === taskData.column_id 
            ? { ...col, tasks: [...(col.tasks || []), newTask] }
            : col
        )
      );
      
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  }, [taskService]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>): Promise<Task> => {
    try {
      const updatedTask = await taskService.updateTask(id, updates);
      
      // Update in state
      setTasks(prev => 
        prev.map(task => task.id === id ? { ...task, ...updatedTask } : task)
      );
      
      // Update in columns if column changed
      if (updates.column_id) {
        setColumns(prev => 
          prev.map(col => ({
            ...col,
            tasks: col.tasks?.filter(task => task.id !== id) || []
          }))
        );
        setColumns(prev => 
          prev.map(col => 
            col.id === updates.column_id 
              ? { ...col, tasks: [...(col.tasks || []), updatedTask] }
              : col
          )
        );
      }
      
      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  }, [taskService]);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      await taskService.deleteTask(id);
      
      // Remove from state
      setTasks(prev => prev.filter(task => task.id !== id));
      setColumns(prev => 
        prev.map(col => ({
          ...col,
          tasks: col.tasks?.filter(task => task.id !== id) || []
        }))
      );
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  }, [taskService]);

  const moveTask = useCallback(async (taskId: string, columnId: string, orderIndex: number): Promise<Task> => {
    // Find the task to move
    const taskToMove = tasks.find(task => task.id === taskId);
    if (!taskToMove) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    // Set operation loading state
    const operationId = `move-${taskId}`;
    setOperationLoading(prev => new Set(prev).add(operationId));

    // Store original state for rollback
    const originalTasks = [...tasks];
    const originalColumns = [...columns];

    // Optimistic update - immediately update UI
    const optimisticTask = { ...taskToMove, column_id: columnId, order_index: orderIndex };
    
    setTasks(prev => 
      prev.map(task => task.id === taskId ? optimisticTask : task)
    );
    
    // Optimistic column update - single operation
    setColumns(prev => 
      prev.map(col => {
        if (col.id === taskToMove.column_id) {
          // Remove from original column
          return { ...col, tasks: col.tasks?.filter(task => task.id !== taskId) || [] };
        } else if (col.id === columnId) {
          // Add to new column
          return { ...col, tasks: [...(col.tasks || []), optimisticTask] };
        }
        return col;
      })
    );

    try {
      // Make API call
      const movedTask = await taskService.moveTask(taskId, columnId, orderIndex);
      
      // Update with server response (in case server made adjustments)
      setTasks(prev => 
        prev.map(task => task.id === taskId ? movedTask : task)
      );
      
      setColumns(prev => 
        prev.map(col => {
          if (col.id === taskToMove.column_id) {
            return { ...col, tasks: col.tasks?.filter(task => task.id !== taskId) || [] };
          } else if (col.id === columnId) {
            return { ...col, tasks: [...(col.tasks?.filter(task => task.id !== taskId) || []), movedTask] };
          }
          return col;
        })
      );
      
      return movedTask;
    } catch (err) {
      console.error('Error moving task:', err);
      
      // Rollback optimistic changes on error
      setTasks(originalTasks);
      setColumns(originalColumns);
      
      throw err;
    } finally {
      // Clear operation loading state
      setOperationLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(operationId);
        return newSet;
      });
    }
  }, [taskService, tasks, columns]);

  const reorderTasks = useCallback(async (columnId: string, taskIds: string[]): Promise<void> => {
    if (taskIds.length === 0) return;

    // Store original state for rollback
    const originalColumns = [...columns];

    // Optimistic update - immediately update UI
    setColumns(prev => 
      prev.map(col => 
        col.id === columnId 
          ? { 
              ...col, 
              tasks: taskIds.map(id => col.tasks?.find(task => task.id === id)).filter(Boolean) as Task[]
            }
          : col
      )
    );

    try {
      // Make API call
      await taskService.reorderTasks(columnId, taskIds);
      
      // No need to update state again since optimistic update was correct
    } catch (err) {
      console.error('Error reordering tasks:', err);
      
      // Rollback optimistic changes on error
      setColumns(originalColumns);
      
      throw err;
    }
  }, [taskService, columns]);

  const value = {
    columns,
    tasks,
    loading,
    error,
    operationLoading,
    currentProjectId,
    setCurrentProjectId,
    fetchColumnsAndTasks,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}; 