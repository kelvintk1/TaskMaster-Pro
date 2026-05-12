// app/components/patterns/p-dropdown-menu-12.tsx
"use client";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, Star, StarOff } from "lucide-react"

interface PatternProps {
  task: any;
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
  onTogglePriority: (task: any) => void; // Add this prop
}

export function Pattern({ task, onEdit, onDelete, onTogglePriority }: PatternProps) {
  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="bg-[#101922] border-[#3a4c5e] hover:bg-[#3a4c5e] cursor-pointer">
            <EllipsisVerticalIcon className="h-4 w-4 text-blue-700" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 bg-[#1a2a36] border-[#3a4c5e] text-white" align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[#92adc9]">Actions</DropdownMenuLabel>
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-[#3a4c5e] focus:bg-[#3a4c5e]"
              onClick={() => onTogglePriority(task)}
            >
              {task.priority ? (
                <>
                  <StarOff className="h-4 w-4 mr-2 text-yellow-500" aria-hidden="true" />
                  <span>Remove priority</span>
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2 text-yellow-500" aria-hidden="true" />
                  <span>Prioritize task</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-[#3a4c5e] focus:bg-[#3a4c5e]"
              onClick={() => onEdit(task)}
            >
              <PencilIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-[#3a4c5e]" />
          <DropdownMenuItem 
            className="cursor-pointer text-red-400 hover:bg-[#3a4c5e] hover:text-red-400 focus:bg-[#3a4c5e] focus:text-red-400"
            onClick={() => onDelete(task._id)}
          >
            <TrashIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}