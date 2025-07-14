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

// Types
type Priority = "Low" | "Medium" | "High";
type TaskId = string;
type ColumnId = string;

interface Task {
  id: TaskId;
  title: string;
  dateRange: string;
  priority: Priority;
  columnId: ColumnId;
}

interface Column {
  id: ColumnId;
  title: string;
  bgcolor: string;
  headerBg: string;
  dotColor: string;
}

// Mock Data
const defaultColumns: Column[] = [
  {
    id: "planning",
    title: "Planning",
    bgcolor: "bg-[#C7E0FF]/30",
    headerBg: "bg-[#C7E0FF]",
    dotColor: "bg-[#2563eb]", // blue-600
  },
  {
    id: "in-progress",
    title: "In Progress",
    bgcolor: "bg-[#F9E79F]/30",
    headerBg: "bg-[#F9E79F]",
    dotColor: "bg-[#facc15]", // yellow-400
  },
  {
    id: "done",
    title: "Done",
    bgcolor: "bg-[#96D8AF]/30",
    headerBg: "bg-[#96D8AF]",
    dotColor: "bg-[#00C44A]", // green-400
  },
  {
    id: "backlog",
    title: "Backlog",
    bgcolor: "bg-[#D9D9D9]/30",
    headerBg: "bg-[#D9D9D9]",
    dotColor: "bg-[#a3a3a3]", // neutral-400
  },
];

const defaultTasks: Task[] = [
  {
    id: "1",
    title: "Strategy & design for mobile",
    dateRange: "Jun 20 → Jul 17",
    priority: "Low",
    columnId: "planning",
  },
  {
    id: "2",
    title: "Create reel about feature #3",
    dateRange: "Jun 21",
    priority: "Medium",
    columnId: "planning",
  },
  {
    id: "3",
    title: "Strategy & design for mobile",
    dateRange: "Jun 20 → Jul 17",
    priority: "High",
    columnId: "in-progress",
  },
];

// Priority badge component
const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = {
    Low: "bg-[#8ECEC2] text-[#008060]",
    Medium: "bg-[#FFE5C7] text-[#FF9500]",
    High: "bg-[#D8C7FF] text-[#8E75FF]",
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
        <span className="text-xs text-gray-500">{task.dateRange}</span>
        <PriorityBadge priority={task.priority} />
      </div>
    </div>
  );
};

// Column component
const KanbanColumn = ({ column, tasks }: { column: Column; tasks: Task[] }) => {
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
      style={style}
      className={`${column.bgcolor} rounded-sm p-3 w-full h-[350px] max-h-[500px] flex flex-col`}
    >
      <div
        {...attributes}
        {...listeners}
        className={`flex items-center gap-2 ${column.headerBg} rounded-full px-4 py-1 mb-3 cursor-grab w-fit`}
      >
        <span className={`w-2 h-2 rounded-full ${column.dotColor}`}></span>
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
export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

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

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Moving columns
    if (active.data.current?.type === "Column") {
      setColumns((columns) => {
        const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
        const overColumnIndex = columns.findIndex((col) => col.id === overId);
        
        return arrayMove(columns, activeColumnIndex, overColumnIndex);
      });
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        tasks[activeIndex].columnId = overId as string;
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };

  return (
    <div className="mt-6">
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
                tasks={tasks.filter((task) => task.columnId === column.id)}
              />
            ))}
          </SortableContext>
        </div>

        {typeof window !== "undefined" && createPortal(
          <DragOverlay>
            {activeColumn && (
              <KanbanColumn
                column={activeColumn}
                tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
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
