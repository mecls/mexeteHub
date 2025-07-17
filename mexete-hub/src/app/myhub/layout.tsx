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

export default function MyHubLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading: userLoading, error: userError } = useUser();
  const { projects, currentProject, setCurrentProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrivateExpanded, setIsPrivateExpanded] = useState(false);

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
              <div className="group flex mt-2 items-center gap-2 py-1 px-1 hover:bg-gray-100 rounded cursor-pointer w-full">
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
                  <div className="group flex items-center justify-between -mb-3 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 ">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xs font-semibold text-gray-500 group-hover:text-black transition-colors">Favorites</h1>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="hidden group-hover:inline-flex">
                        <Image src="/icons/ellipsis-sidebar.svg" className="bg-gray-100" alt="ellipsis" width={18} height={18} />
                      </span>
                    </div>
                  </div>
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
                    <div className="space-y-0 overflow-y-auto -mt-4">
                      {projects.map(project => (
                        <div
                          key={project.id}
                          className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 ${currentProject?.id === project.id ? 'bg-gray-100' : ''
                            }`}
                          onClick={() => handleProjectClick(project.id)}
                        >
                          <span className="text-lg">{project.icon}</span>
                          <span className="text-sm text-gray-700 truncate font-semibold">{project.name}</span>
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
              {currentProject ? (
                <>
                  <span className="text-xl">{currentProject.icon}</span>
                  <h1 className="text-lg font-bold text-gray-800">{currentProject.name}</h1>
                </>
              ) : (
                <>
                  <Image src="/icons/house.svg" alt="Overview" width={24} height={24} />
                  <h1 className="text-lg font-bold text-gray-800">Home</h1>
                </>
              )}
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