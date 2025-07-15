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



// Widget component
function Widget({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        background: 'white',
        border: '0.5px solid #e5e7eb',
        borderRadius: '0.25rem',
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
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

// Main grid under Active Projects
export default function WidgetGrid() {

    const [items, setItems] = useState(
        [
            {
                id: '1',
                name: 'Mexete Hub',
                status: 'On Track',
                percent: 76,
                icon: '💸',
            },
            {
                id: '2',
                name: 'SoloBud',
                status: 'Behind',
                percent: 39,
                icon: '🚀'
            },
            {
                id: '3',
                name: 'Secret Notes',
                status: 'At Risk',
                percent: 15,
                icon: '🔒'
            },
            {
                id: '4',
                name: 'Lens',
                status: 'Ahead',
                percent: 91,
                icon: '🔍'
            },
        ]
    );

    const [mounted, setMounted] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => setMounted(true), []);
    if (!mounted) return null; // or a loading spinner

    const statusBgClasses = {
        'On Track': 'bg-[#CEF2D2]',
        'Behind': 'bg-[#FFF4C7]',
        'At Risk': 'bg-[#FFC7C7]',
        'Ahead': 'bg-[#C7DFFF]',

    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToParentElement]}
            onDragEnd={(event: any) => {
                const { active, over } = event;
                if (active.id !== over.id) {
                    setItems(items => {
                        const oldIndex = items.findIndex(item => item.id === active.id);
                        const newIndex = items.findIndex(item => item.id === over.id);
                        return arrayMove(items, oldIndex, newIndex);
                    });
                }
            }}
        >
            <SortableContext items={items} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 gap-8 mt-4 w-fit">
                    {items.map(item => (
                        <Widget key={item.id} id={item.id}>
                            <div className="flex flex-col w-full h-full">
                                <div className="flex flex-row justify-between items-center">
                                    <div className="flex flex-row items-center gap-2">
                                        <h1 className="text-2xl">{item.icon}</h1>
                                        <h1 className="text-md font-bold">{item.name}</h1>
                                    </div>
                                    <div className={`flex flex-row justify-center items-center rounded-full px-2 py-1 ${statusBgClasses[item.status as keyof typeof statusBgClasses]}`}>
                                        <p className="text-xs text-gray-500">{item.status}</p>
                                    </div>
                                </div>
                                <div className="flex flex-row justify-between mt-2">
                                    <Progress value={item.percent} className="w-full bg-gray-100" />

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
