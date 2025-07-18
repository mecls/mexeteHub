"use client";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
    arrayMove,
    SortableContext,
    useSortable,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Progress } from './progress';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/supabase';
import { Project, ProjectWithStatus } from '@/lib/supabase/schema';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import { useProjects } from '@/contexts/ProjectContext';

// Widget component
function Widget({ id, children, onClick }: { id: string; children: React.ReactNode; onClick?: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        background: 'white',
        border: '0.5px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1rem',
        minWidth: '200px',
        minHeight: '50px',
        width: '250px',
        height: '150px',
        boxShadow: isDragging ? '0 2px 4px rgba(0,0,0,0.15)' : undefined,
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative' as const,
    };

    const handleWidgetClick = (e: React.MouseEvent) => {
        // Only trigger if the click is not on a button
        if (!(e.target as Element).closest('button')) {
            onClick?.();
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleWidgetClick}
            className="cursor-pointer"
        >
            {children}
        </div>
    );
}

// Main grid under Active Projects
export default function WidgetGrid() {
    const router = useRouter();
    const { projects, loading, setCurrentProject, setProjects } = useProjects();
    const [mounted, setMounted] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));

    const statusBgClasses = {
        'On Track': 'bg-[#CEF2D2]',
        'Behind': 'bg-[#FFF4C7]',
        'At Risk': 'bg-[#FFC7C7]',
        'Ahead': 'bg-[#C7DFFF]',
        'No Status': 'bg-gray-100',
        'Paused': 'bg-gray-200',
        'Sold': 'bg-green-100',
    };

    const handleProjectClick = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setCurrentProject(project);
            router.push(`/myhub/${projectId}`);
        }
    };

    // Add this function to handle project reordering
    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = projects.findIndex(project => project.id === active.id);
            const newIndex = projects.findIndex(project => project.id === over.id);
            const reorderedProjects = arrayMove(projects, oldIndex, newIndex);
            setProjects(reorderedProjects);
        }
    };

    // Set mounted to true after component mounts
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || loading) return null;
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToParentElement]}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={projects} strategy={rectSortingStrategy}>
                {/* Remove px-32 and center properly */}
                <div className="grid grid-cols-2 gap-8 mt-4 w-fit px-32">
                    {projects.map(project => (
                        <Widget
                            key={project.id}
                            id={project.id}
                        >
                            <div className="flex flex-col w-full h-full">
                                <div className="flex flex-row justify-between items-center">
                                    <div className="flex flex-row items-center gap-2">
                                        <h1 className="text-2xl">{project.icon}</h1>
                                        <h1 className="text-md font-bold">{project.name}</h1>
                                    </div>
                                    {project.status && (
                                        <div className={`flex flex-row justify-center items-center rounded-full px-2 py-1 ${statusBgClasses[project.status.name as keyof typeof statusBgClasses] || 'bg-gray-100'}`}>
                                            <p className="text-xs text-gray-500">{project.status.name}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-row justify-between mt-2">
                                    <Progress value={project.progress} className="w-full bg-gray-100" />
                                </div>
                                <div className="flex flex-row justify-end py-12">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs text-gray-500 w-1/2 flex items-center justify-center cursor-pointer border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent widget click
                                            handleProjectClick(project.id);
                                        }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation(); // Prevent drag start
                                        }}
                                        onPointerDown={(e) => {
                                            e.stopPropagation(); // Prevent drag start
                                        }}
                                        draggable={false}
                                    >
                                        Open
                                    </Button>
                                </div>
                            </div>
                        </Widget>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
