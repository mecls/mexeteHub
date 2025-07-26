"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTasks } from "@/contexts/TaskContext";
import { Task, TaskPriority } from "@/lib/supabase/schema";
import type { KanbanColumn } from "@/lib/supabase/schema";

// Priority badge component
const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  const colors = {
    LOW: "bg-[#8ECEC2] text-[#008060]",
    MEDIUM: "bg-[#FFE5C7] text-[#FF9500]",
    HIGH: "bg-[#D8C7FF] text-[#8E75FF]",
  };
  

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[priority]}`}>
      {priority}
    </span>
  );
};

// Task Card component
const TaskCard = ({ task }: { task: Task }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const formatDateRange = (startDate?: Date, dueDate?: Date) => {
    if (!startDate && !dueDate) return "";
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    };

    if (startDate && dueDate) {
      return `${formatDate(startDate)} → ${formatDate(dueDate)}`;
    } else if (startDate) {
      return formatDate(startDate);
    } else if (dueDate) {
      return formatDate(dueDate);
    }
    
    return "";
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white p-3 rounded border-2 border-gray-200 opacity-30"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-sm border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-grab"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 leading-tight">
          {task.title}
        </h4>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {formatDateRange(task.start_date, task.due_date)}
        </span>
        <PriorityBadge priority={task.priority} />
      </div>
    </div>
  );
};

// Column component
const KanbanColumn = ({ column, tasks }: { column: KanbanColumn; tasks: Task[] }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: `${column.bg_color}30`,
      }}
      className="rounded-sm p-3 w-full h-[350px] max-h-[600px] flex flex-col mt-4"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 rounded-full px-4 py-1 mb-3 cursor-grab w-fit"
        style={{
          backgroundColor: column.header_bg_color,
        }}
      >
        <span 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: column.dot_color }}
        ></span>
        <span className="font-medium text-black text-xs">{column.title}</span>
      </div>
      
      <div className="flex-1 space-y-2">
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
      
      <button className="mt-3 p-2 text-sm text-gray-500 hover:text-gray-700 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
        + Add a card
      </button>
    </div>
  );
};

// Main Kanban Board component
export default function ProjectKanbanBoard() {
  const { columns, tasks, loading, error, moveTask, reorderTasks, reorderColumns } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<KanbanColumn | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  // Memoize expensive computations
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  
  // Memoize tasks by column for better performance
  const tasksByColumn = useMemo(() => {
    const tasksMap = new Map<string, Task[]>();
    columns.forEach(col => {
      tasksMap.set(col.id, col.tasks || []);
    });
    return tasksMap;
  }, [columns]);

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Moving columns
    if (active.data.current?.type === "Column") {
      const oldIndex = columns.findIndex((col) => col.id === activeId);
      const newIndex = columns.findIndex((col) => col.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedColumns = arrayMove(columns, oldIndex, newIndex);
        const columnIds = reorderedColumns.map(col => col.id);
        try {
          await reorderColumns(columnIds);
        } catch (error) {
          console.error('Error reordering columns:', error);
        }
      }
    }
  };

  const onDragOver = async (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    try {
        // Dropping a Task over another Task
        if (isActiveATask && isOverATask) {
            const activeTask = tasks.find((t) => t.id === activeId);
            const overTask = tasks.find((t) => t.id === overId);

            if (activeTask && overTask) {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                if (activeTask.column_id !== overTask.column_id) {
                    // Move to different column
                    await moveTask(activeId as string, overTask.column_id, overIndex);
                } else {
                    // Reorder within same column
                    const columnTasks = tasks.filter(t => t.column_id === activeTask.column_id);
                    const reorderedTasks = arrayMove(columnTasks, activeIndex, overIndex);
                    const taskIds = reorderedTasks.map(t => t.id);
                    await reorderTasks(activeTask.column_id, taskIds);
                }
            }
        }

        const isOverAColumn = over.data.current?.type === "Column";

        // Dropping a Task over a column
        if (isActiveATask && isOverAColumn) {
            const activeTask = tasks.find((t) => t.id === activeId);
            if (activeTask) {
                const columnTasks = tasks.filter(t => t.column_id === overId);
                await moveTask(activeId as string, overId as string, columnTasks.length);
            }
        }
    } catch (error) {
        console.error('Error during drag operation:', error);
        // Optionally show a user-friendly error message
    }
  };

  // Show error if there's one
  if (error) {
    console.error('Kanban board error:', error);
    return (
      <div className="mt-6 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  // Show empty state if no columns, but don't block rendering
  if (columns.length === 0) {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No columns yet</h3>
            <p className="text-gray-500">This project doesn't have any kanban columns yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Subtle loading indicator */}
      {loading && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          <span>Updating board...</span>
        </div>
      )}
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <SortableContext items={columnsId} strategy={verticalListSortingStrategy}>
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasksByColumn.get(column.id) || []}
              />
            ))}
          </SortableContext>
        </div>

        {typeof window !== "undefined" && createPortal(
          <DragOverlay>
            {activeColumn && (
              <KanbanColumn
                column={activeColumn}
                tasks={tasks.filter((task) => task.column_id === activeColumn.id)}
              />
            )}
            {activeTask && <TaskCard task={activeTask} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}
