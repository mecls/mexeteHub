"use client";
import React, { use, useEffect } from 'react'
import { useProjects } from '@/contexts/ProjectContext';

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { projects, currentProject, setCurrentProject } = useProjects();

  useEffect(() => {
    // Set current project if not already set
    if (!currentProject || currentProject.id !== projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
      }
    }
  }, [projectId, projects, currentProject, setCurrentProject]);

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
      <div className="h-screen w-screen p-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-4xl">{currentProject.icon}</span>
          <h1 className="text-3xl font-bold">{currentProject.name}</h1>
        </div>

        {/* Add your project content here */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Project Details</h2>
          <p>Project ID: {currentProject.id}</p>
          <p>Project Name: {currentProject.name}</p>
          <p>Project Icon: {currentProject.icon}</p>
          <p>Progress: {currentProject.progress}%</p>
        </div>
      </div>
    </div>
  )
}