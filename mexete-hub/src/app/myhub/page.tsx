"use client";

import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable'
import { ResizablePanelGroup } from '@/components/ui/resizable'
import React from 'react'
import Image from 'next/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation';
import WidgetGrid from '@/components/ui/widgetGrid';
import KanbanBoard from '@/components/ui/KanbanBoard';

const myHub = () => {
    const pathname = usePathname();
    const isHome = pathname === '/myhub/';

    return (
        <div className="h-screen w-screen">
            <ResizablePanelGroup direction="horizontal" className="h-full w-fulls">
                <ResizablePanel
                    defaultSize={12} // percentage or px, depending on your component
                    minSize={12}     // minimum width (e.g., 10%)
                    maxSize={15}     // maximum width (e.g., 30%)
                    className="bg-white border-r px-2 min-w-[225px]" // <-- add px-2 or px-4 here
                >
                    <SidebarContent>
                        <SidebarHeader>
                            <div className="group flex mt-2 items-center gap-2 py-1 px-1 hover:bg-gray-100 rounded cursor-pointer w-full">
                                <Avatar className="w-8 h-8 rounded-full overflow-hidden">
                                    <AvatarImage className="w-full h-full object-cover" src="/profilePic.png" />
                                    <AvatarFallback>MC</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col justify-center">
                                    <h1 className="text-sm font-medium">Miguel Carvalhal</h1>
                                    <p className="text-xs font-medium text-gray-500">@mecls</p>
                                </div>
                                <span className="hidden group-hover:inline-flex ml-auto">
                                    <Image src="/icons/edit.svg" className="bg-gray-100" alt="edit" width={16} height={16} />
                                </span>
                            </div>
                        </SidebarHeader>
                        <SidebarGroup>
                            <SidebarGroupLabel className="flex items-center gap-1 hover:bg-gray-100 rounded cursor-pointer w-full">
                                <Image src="/icons/bi_house.svg" alt="Overview" width={22} height={22} />
                                <h1 className="text-sm font-bold text-gray-500">Home</h1>
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <div className="flex flex-col gap-4 py-8">
                                    <div className="group flex items-center justify-between -mb-3 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 ">
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-xs font-semibold text-gray-500 group-hover:text-black transition-colors">Favorites</h1>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <span className="hidden group-hover:inline-flex">
                                                <Image src="/icons/ellipsis-sidebar.svg" className="bg-gray-100" alt="ellipsis" width={12} height={12} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="group flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-gray-100 ">
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-xs font-semibold text-gray-500 group-hover:text-black transition-colors">All</h1>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <span className="hidden group-hover:inline-flex">
                                                <Image src="/icons/ellipsis-sidebar.svg" className="bg-gray-100" alt="ellipsis" width={12} height={12} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SidebarGroupContent>
                        </SidebarGroup>
                        <SidebarFooter className="flex items-center justify-between gap-2 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer w-full">
                            <div className="flex items-center gap-1 py-1 px-1 hover:bg-gray-100 rounded cursor-pointer w-full overflow-hidden ">
                                <Image src="/icons/settings.svg" alt="Settings" width={16} height={16} />
                                <h1 className="text-sm font-bold text-gray-500 group-hover:text-black transition-colors">Settings</h1>
                            </div>
                        </SidebarFooter>
                    </SidebarContent>
                </ResizablePanel>
                <ResizableHandle />

                <ResizablePanel className="bg-white min-w-[50]">
                    <div className="h-15 border-b flex row items-center gap-2 px-8 justify-between">
                        <div className="flex items-center gap-2">
                            <Image src="/icons/house.svg" alt="Overview" width={24} height={24} />
                            <h1 className="text-lg font-bold text-gray-800">Home</h1>
                        </div>
                        <div className="flex items-center mr-4">
                            <p className="text-sm font-medium mr-4 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer">Share</p>
                            <div className="flex items-center gap-2 py-1 px-2  hover:bg-gray-100 rounded cursor-pointer mr-4">
                                <Image src="/icons/star.svg" alt="Star" width={18} height={18} />
                            </div>
                            <div className="flex items-center gap-2 py-1 px-2  hover:bg-gray-100 rounded cursor-pointer">
                                <Image src="/icons/ellipsis.svg" alt="Ellipsis" width={24} height={24} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <ScrollArea dir="ltr" className="h-full w-full px-32 py-8">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Image src="/icons/active.svg" alt="Star" width={24} height={24} />
                                    <h1 className="text-sm font-bold text-gray-800">Active Projects</h1>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2 w-full h-full">
                                    <WidgetGrid />
                                </div>
                                <div className="mt-8">
                                    <div className="flex items-center gap-2">
                                        <Image src="/icons/kanban.svg" alt="Star" width={24} height={24} />
                                        <h1 className="text-sm font-bold text-gray-800">Board</h1>
                                    </div>
                                    <KanbanBoard />
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}

export default myHub