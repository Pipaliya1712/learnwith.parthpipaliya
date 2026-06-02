"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AvatarModalProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function AvatarModal({ src, alt = "Avatar", fallback, size = "default", className }: AvatarModalProps) {
  if (!src) {
    return (
      <Avatar className={className} size={size}>
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={cn("hover:opacity-90 transition-opacity rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>
          <Avatar size={size} className="h-full w-full">
            <AvatarImage src={src} alt={alt} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </button>
      </DialogTrigger>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-[500px] border-none bg-transparent shadow-none ring-0 p-0 overflow-visible flex items-center justify-center"
      >
        <div className="sr-only">
          <DialogTitle>View Profile Picture</DialogTitle>
        </div>
        <div className="relative w-full max-w-sm aspect-square overflow-hidden rounded-2xl shadow-2xl">
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
