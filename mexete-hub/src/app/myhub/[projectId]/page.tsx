"use client";

import { supabase } from '@/lib/supabase/supabase'
import React, { useEffect, useState, use } from 'react'
import Image from 'next/image'

interface Project {
  id: string;
  name: string;
  icon: string;
  // Add other project fields as needed
}

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params); // Unwrap the Promise with React.use()
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) {
          console.error('Error fetching project:', error);
        } else {
          setProject(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return <div className="p-8">Loading project...</div>;
  }

  if (!project) {
    return <div className="p-8">Project not found</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">{project.icon}</span>
        <h1 className="text-3xl font-bold">{project.name}</h1>
      </div>
      
      {/* Add your project content here */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Project Details</h2>
        <p>Project ID: {project.id}</p>
        <p>Project Name: {project.name}</p>
        <p>Project Icon: {project.icon}</p>
      </div>
    </div>
  );
}
