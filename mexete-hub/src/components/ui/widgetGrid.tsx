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

// Widget component
function Widget({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        background: 'white',
        border: '0.5px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1rem',
        minWidth: '150px',
        minHeight: '50',
        width: '250px',
        height: '150px',
        boxShadow: isDragging ? '0 2px 8px rgba(0,0,0,0.15)' : undefined,
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
    const [items, setItems] = useState(['widget-1', 'widget-2', 'widget-3', 'widget-4']);
    const [mounted, setMounted] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => setMounted(true), []);
    if (!mounted) return null; // or a loading spinner

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToParentElement]}
            onDragEnd={(event: any) => {
                const { active, over } = event;
                if (active.id !== over.id) {
                    setItems(items => {
                        const oldIndex = items.indexOf(active.id);
                        const newIndex = items.indexOf(over.id);
                        return arrayMove(items, oldIndex, newIndex);
                    });
                }
            }}
        >
            <SortableContext items={items} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 gap-8 mt-4 w-fit">
                    {items.map(id => (
                        <Widget key={id} id={id}>
                            {id}
                        </Widget>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
