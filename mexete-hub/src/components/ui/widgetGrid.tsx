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
        justifyContent: 'center'
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className="cursor-pointer"
        >
            {children}
        </div>
    );
}

// Main grid under Active Projects
export default function WidgetGrid() {
    const router = useRouter();
    const { user, loading: userLoading, error: userError } = useUser();
    const [projects, setProjects] = useState<ProjectWithStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));

    const fetchProjects = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    status:project_statuses(name)
                `)
                .eq('user_id', user.id)
                .is('archived_at', null)
                .is('deleted_at', null)
                .order('is_favorite', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching projects:', error);
            } else {
                setProjects(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !userLoading) {
            fetchProjects();
        }
    }, [mounted, user, userLoading]);

    if (!mounted || userLoading) return null;

    if (userError || !user) {
        return (
            <div className="grid grid-cols-2 gap-8 mt-4 w-fit">
                <div className="w-64 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-gray-500 text-center">
                        <p>No user found</p>
                        <p className="text-sm">Please create a user first</p>
                    </div>
                </div>
            </div>
        );
    }

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
        router.push(`/myhub/${projectId}`);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-8 mt-4 w-fit">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-64 h-40 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="grid grid-cols-2 gap-8 mt-4 w-fit">
                <button className=" w-64 h-40 mt-3 p-2 text-sm text-gray-500 hover:text-gray-700 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center">
                    + Add a project
                </button>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToParentElement]}
            onDragEnd={(event: any) => {
                const { active, over } = event;
                if (active.id !== over.id) {
                    setProjects(projects => {
                        const oldIndex = projects.findIndex(project => project.id === active.id);
                        const newIndex = projects.findIndex(project => project.id === over.id);
                        return arrayMove(projects, oldIndex, newIndex);
                    });
                }
            }}
        >
            <SortableContext items={projects} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 gap-8 mt-4 w-fit">
                    {projects.map(project => (
                        <Widget
                            key={project.id}
                            id={project.id}
                            onClick={() => handleProjectClick(project.id)}
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
                                    <Button variant="outline" size="sm" className="text-xs text-gray-500 w-1/2 items-center justify-center">
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
