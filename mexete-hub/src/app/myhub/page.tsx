"use client";
import React from 'react'
import Image from 'next/image'
import WidgetGrid from '@/components/ui/widgetGrid';
import KanbanBoard from '@/components/ui/KanbanBoard';

export default function MyHubPage() {
  return (
    <div className="px-36 py-8 lg:px-48">
      <div>
        <div className="flex items-center gap-2">
          <Image src="/icons/active.svg" alt="Star" width={24} height={24} />
          <h1 className="text-xl font-bold text-gray-800">Active Projects</h1>
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
    </div>
  )
}