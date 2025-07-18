"use client";
import React, { useState } from 'react'
import Image from 'next/image'
import WidgetGrid from '@/components/ui/widgetGrid';
import KanbanBoard from '@/components/ui/KanbanBoard';
import { useProjects } from '@/contexts/ProjectContext';
import AllProjects from '@/components/ui/AllProjects';

export default function MyHubPage() {
  const { projects } = useProjects();
  const [showAllProjects, setShowAllProjects] = useState(false);
  const handleShowAllProjects = () => {
    setShowAllProjects(true);
  };

  return (
    <div className="px-36 py-8 lg:px-48">
      <div>
        <div className="flex flex-row items-center gap-2 justify-between w-1/2">
          <div className="flex flex-row items-center gap-2 justify-between">
            <Image src="/icons/active.svg" alt="Star" width={24} height={24} />
            <h1 className="text-xl font-bold text-gray-800">Active Projects</h1>
          </div>
          <div className="flex items-center cursor-pointer hover:bg-gray-100 rounded p-1 ">
            <Image src="/icons/light_pan-zoom.svg" alt="ellipsis" width={18} height={18} onClick={handleShowAllProjects} />
          </div>
        </div>
        <div className="mt-8">
          <WidgetGrid />
        </div>
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <Image src="/icons/kanban.svg" alt="Star" width={24} height={24} />
            <h1 className="text-xl font-bold text-gray-800">Board</h1>
          </div>
          <KanbanBoard />
        </div>
      </div>

      {/* All Projects Modal */}
      {showAllProjects && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 w-full ' >
          <div className="bg-white rounded-lg p-8 h-3/4 overflow-y-auto w-1/2">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">All Projects</h1>
              <button
                onClick={() => setShowAllProjects(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Image src="/icons/close.svg" alt="Close" width={24} height={24} />
              </button>
            </div>
            <AllProjects />
          </div>
        </div>
      )}
    </div>
  )
}