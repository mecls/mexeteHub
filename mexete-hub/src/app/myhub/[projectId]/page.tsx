"use client";
import React, { use, useEffect } from 'react'
import { useProjects } from '@/contexts/ProjectContext';
import { useTasks } from '@/contexts/TaskContext';
import ProjectKanbanBoard from '@/components/ProjectKanbanBoard';
import Image from 'next/image';

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { projects, currentProject, setCurrentProject } = useProjects();
  const { setCurrentProjectId, fetchColumnsAndTasks, currentProjectId } = useTasks();

  useEffect(() => {
    // Only set current project if we have a valid projectId
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
      } else {
        // If projectId exists but project not found, set to null
        setCurrentProject(null);
      }
    } else {
      // If no projectId, we're on home page, so clear currentProject
      setCurrentProject(null);
    }
  }, [projectId, projects, setCurrentProject]);

  // Set current project ID in task context
  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
    }
  }, [projectId, setCurrentProjectId]);

  // Fetch columns and tasks when currentProjectId changes
  useEffect(() => {
    if (currentProjectId) {
      fetchColumnsAndTasks(currentProjectId);
    }
  }, [currentProjectId, fetchColumnsAndTasks]);

  if (!currentProject) {
    return (
      <div className="px-36 py-8 lg:px-48">
        <div className="h-screen w-screen flex items-center justify-center">
          <div className="text-gray-500">Project not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-36 py-8 lg:px-48">
          <div className="flex items-center gap-2">
            <Image src="/icons/kanban.svg" alt="Star" width={24} height={24} />
            <h1 className="text-xl font-bold text-gray-800">Board</h1>
          </div>
          <ProjectKanbanBoard />
    </div>
  )
}