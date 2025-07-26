"use client";
import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable'
import { ResizablePanelGroup } from '@/components/ui/resizable'
import React, { useState } from 'react'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader } from '@/components/ui/sidebar'
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useProjects } from '@/contexts/ProjectContext';
import CreateProjectModal from '@/components/CreateProjectModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Star, Trash2, Edit, ArrowRight } from 'lucide-react';

export default function MyHubLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading: userLoading, error: userError } = useUser();
  const { projects, currentProject, setCurrentProject, updateProject, deleteProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrivateExpanded, setIsPrivateExpanded] = useState(false);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const statusBgClasses = {
    'On Track': 'bg-[#CEF2D2]',
    'Behind': 'bg-[#FFF4C7]',
    'At Risk': 'bg-[#FFC7C7]',
    'Ahead': 'bg-[#C7DFFF]',
    'No Status': 'bg-gray-100',
    'Paused': 'bg-gray-200',
    'Sold': 'bg-[#D8C7FF]',
  };

  const handleProjectClick = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      router.push(`/myhub/${projectId}`);
    }
  };

  const handleHomeClick = () => {
    setCurrentProject(null);
    router.push('/myhub');
  };

  const handlePrivateClick = (e: React.MouseEvent) => {
    // Prevent toggle if clicking on the plus button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsPrivateExpanded(!isPrivateExpanded);
  };

  const handleFavoriteToggle = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      try {
        await updateProject(projectId, { is_favorite: !project.is_favorite });
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    }
  };

  const handleMoveToTrash = async (projectId: string) => {
    try {
      await deleteProject(projectId);
    } catch (error) {
      console.error('Error moving to trash:', error);
    }
  };

  const handleRenameStart = (project: any) => {
    setRenamingProjectId(project.id);
    setRenameValue(project.name);
  };

  const handleRenameSave = async (projectId: string) => {
    if (renameValue.trim()) {
      try {
        await updateProject(projectId, { name: renameValue.trim() });
      } catch (error) {
        console.error('Error renaming project:', error);
      }
    }
    setRenamingProjectId(null);
    setRenameValue('');
  };

  const handleRenameCancel = () => {
    setRenamingProjectId(null);
    setRenameValue('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, projectId: string) => {
    if (e.key === 'Enter') {
      handleRenameSave(projectId);
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  if (userLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-gray-500">No user found. Please create a user first.</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      <ResizablePanelGroup direction="horizontal" className="h-full w-fulls">
        <ResizablePanel
          defaultSize={12}
          minSize={12}
          maxSize={15}
          className="bg-white border-r px-2 min-w-[225px]"
        >
          <SidebarContent>
            <SidebarHeader>
              <div className="group flex mt-2 items-center gap-2 py-2 px-1 hover:bg-gray-100 rounded cursor-pointer w-full">
                <Avatar className="w-8 h-8 rounded-full overflow-hidden">
                  <AvatarImage className="w-full h-full object-cover" src={user.avatar_url || "/profilePic.png"} />
                  <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col justify-center">
                  <h1 className="text-sm font-medium">{user.name}</h1>
                  <p className="text-xs font-medium text-gray-500">@{user.username}</p>
                </div>
                <span className="hidden group-hover:inline-flex ml-auto">
                  <Image src="/icons/edit.svg" className="bg-gray-100" alt="edit" width={16} height={16} />
                </span>
              </div>
            </SidebarHeader>
            <SidebarGroup>
              <SidebarGroupLabel
                className="flex items-center gap-1 hover:bg-gray-100 rounded cursor-pointer w-full"
                onClick={handleHomeClick}
              >
                <div className="flex items-center gap-1 justify-baseline">
                  <Image src="/icons/bi_house.svg" alt="Overview" width={18} height={18} />
                  <h1 className="text-sm font-bold text-gray-500">Home</h1>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="flex flex-col gap-4 py-8">
                  
                  <div
                    className="group flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
                    onClick={handlePrivateClick}
                  >
                    <div className="flex items-center gap-2">
                      <h1 className="text-xs font-semibold text-gray-500 group-hover:text-black transition-colors">Private</h1>
                    </div>
                    <div className="flex items-center justify-center cursor-pointer">
                      <span className="hidden group-hover:inline-flex ">
                        <Image src="/icons/ellipsis-sidebar.svg" className="bg-gray-100 mr-2 cursor-pointer" alt="ellipsis" width={18} height={18} />
                        <button onClick={() => setIsModalOpen(true)} className='cursor-pointer' name='add project'>
                          <Image src="/icons/plusGray.svg" alt="add project" width={18} height={18} />
                        </button>
                      </span>
                    </div>
                  </div>
                  {isPrivateExpanded && (
                    <div className="space-y-0 overflow-y-auto justify-between -mt-4">
                      {projects.map(project => (
                        <div
                          key={project.id}
                          className={`group flex items-center justify-between mt-1 gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 w-full ${currentProject?.id === project.id ? 'bg-gray-100' : ''}`}
                          onClick={() => handleProjectClick(project.id)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-md flex-shrink-0">{project.icon}</span>
                            {renamingProjectId === project.id ? (
                              <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => handleRenameKeyDown(e, project.id)}
                                onBlur={() => handleRenameSave(project.id)}
                                className="text-sm text-gray-700 font-semibold bg-transparent border-none outline-none flex-1 min-w-0"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="text-sm text-gray-700 truncate font-semibold flex-1 min-w-0">{project.name}</span>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="inline-flex p-1 hover:bg-gray-200 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <Image src="/icons/ellipsis-sidebar.svg" alt="ellipsis" width={18} height={18} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              side="bottom" 
                              align="start" 
                              sideOffset={4}
                              className="w-48 z-50"
                            >
                              <DropdownMenuItem >
                                {project.name}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                handleFavoriteToggle(project.id);
                              }}>
                               <ArrowRight className="w-4 h-4 mr-2" />
                                Move To
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                handleRenameStart(project);
                              }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  handleMoveToTrash(project.id);
                                }}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Move to trash
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
            {isModalOpen && <CreateProjectModal onClose={() => setIsModalOpen(false)} />}
            <SidebarFooter className="flex items-center justify-between gap-2 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer w-full">
              <div className="flex items-center gap-1 py-1 px-1 hover:bg-gray-100 rounded cursor-pointer w-full overflow-hidden ">
                <Image src="/icons/settings.svg" alt="Settings" width={16} height={16} />
                <h1 className="text-sm font-bold text-gray-500 group-hover:text-black transition-colors">Settings</h1>
              </div>
            </SidebarFooter>
          </SidebarContent>
        </ResizablePanel>
        <ResizableHandle />

        <ResizablePanel className="bg-white min-w-[50] flex flex-col">
          <div className="flex-shrink-0 border-b flex row items-center gap-2 px-8 justify-between py-4">
            <div className="flex items-center justify-baseline gap-2">
              {(() => {
                return currentProject ? (
                  <>
                    <span className="text-xl">{currentProject.icon}</span>
                    <h1 className="text-lg font-bold text-gray-800">{currentProject.name}</h1>
                    <div className={`flex items-center justify-center gap-2 rounded-full px-2 py-1 ${statusBgClasses[currentProject.status?.name as keyof typeof statusBgClasses] || 'bg-gray-100'}`}>
                      <p className="text-[10px] font-medium text-gray-500">{currentProject.status?.name}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Image src="/icons/house.svg" alt="Overview" width={24} height={24} />
                    <h1 className="text-lg font-bold text-gray-800">Home</h1>
                  </>
                );
              })()}
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
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
} 