"use client";

import {
  ChevronsUpDown,
  TwitterIcon,
  YoutubeIcon,
  FileTextIcon,
  LinkIcon,
  HashIcon, // Ensure HashIcon is imported
  Brain
} from "lucide-react";

import * as React from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config.ts";
import { formatToken } from "../lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

// This is sample data.

interface User{
  name: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeFilter?: string;
  setActiveFilter?: (filter: string) => void;
}

export function AppSidebar({ activeFilter = "all", setActiveFilter, ...props }: AppSidebarProps) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const [user, setUser] = React.useState<User|null>(null);

  const handleFilterChange = (filter: string) => {
    setActiveFilter?.(filter);
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/user`, {
        headers: {
          Authorization: formatToken(localStorage.getItem("token") || ""),
        },
        withCredentials: true // Enable cookies for this request
      });
      
      console.log("API Response:", response.data); // Debug log
      setUser(response.data);
    }
    catch(e){
      console.log(e);
    }
  };

  React.useEffect(() => {
    fetchUser();
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    navigate("/signin");
  };

  return (
    <Sidebar className="bg-[#AEC3B0] border-r border-[#598392]" {...props}>
      <SidebarHeader className="border-b border-[#598392]">
        <div className="flex items-center px-2 py-4">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#124559]" />
            <span className="text-lg font-bold text-[#01161E]">Second Brain</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className={`text-[#01161E] hover:bg-[#598392] hover:text-[#EFF6E0] transition-colors ${activeFilter === "all" ? "bg-[#598392] text-[#EFF6E0]" : ""}`}
              onClick={() => handleFilterChange("all")}
            >
              <Brain className="w-4 h-4" />
              <span>All Content</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className={`text-[#01161E] hover:bg-[#598392] hover:text-[#EFF6E0] transition-colors ${activeFilter === "tweets" ? "bg-[#598392] text-[#EFF6E0]" : ""}`}
              onClick={() => handleFilterChange("tweets")}
            >
              <TwitterIcon className="w-4 h-4" />
              <span>Tweets</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className={`text-[#01161E] hover:bg-[#598392] hover:text-[#EFF6E0] transition-colors ${activeFilter === "videos" ? "bg-[#598392] text-[#EFF6E0]" : ""}`}
              onClick={() => handleFilterChange("videos")}
            >
              <YoutubeIcon className="w-4 h-4" />
              <span>Videos</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className={`text-[#01161E] hover:bg-[#598392] hover:text-[#EFF6E0] transition-colors ${activeFilter === "documents" ? "bg-[#598392] text-[#EFF6E0]" : ""}`}
              onClick={() => handleFilterChange("documents")}
            >
              <FileTextIcon className="w-4 h-4" />
              <span>Documents</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className={`text-[#01161E] hover:bg-[#598392] hover:text-[#EFF6E0] transition-colors ${activeFilter === "links" ? "bg-[#598392] text-[#EFF6E0]" : ""}`}
              onClick={() => handleFilterChange("links")}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Links </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className={`text-[#01161E] hover:bg-[#598392] hover:text-[#EFF6E0] transition-colors ${activeFilter === "tags" ? "bg-[#598392] text-[#EFF6E0]" : ""}`}
              onClick={() => handleFilterChange("tags")}
            >
              <HashIcon className="w-4 h-4" />
              <span>Tags </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#598392]">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="group-data-[state=collapsed]:hover:outline-0 group-data-[state=collapsed]:hover:bg-transparent overflow-visible text-[#01161E] hover:bg-[#598392] hover:text-[#EFF6E0] transition-colors"
                  size="lg"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="https://github.com/shadcn.png?size=40"
                      alt="CN"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-heading">
                      {user?.username}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 bg-[#EFF6E0] border-[#598392]"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-base">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="https://github.com/shadcn.png?size=40"
                        alt="CN"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-heading">
                        {user?.username}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#598392]" />
                <DropdownMenuSeparator className="bg-[#598392]" />
                <DropdownMenuItem className="text-[#01161E] hover:bg-[#AEC3B0] focus:bg-[#AEC3B0]">
                  <button onClick={handleLogout} className="mr-2" >
                    Log out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
