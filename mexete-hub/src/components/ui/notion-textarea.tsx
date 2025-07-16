"use client";
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

export interface NotionTextareaProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const NotionTextarea = React.forwardRef<HTMLTextAreaElement, NotionTextareaProps>(
  ({ value = "", onChange, placeholder = "New page", className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className={cn("w-full", className)}>
        {/* Action buttons - only show when focused or has content */}
        {(isFocused || value) && (
          <div className="flex items-center gap-4 mb-3 text-gray-400 text-sm">
            <button type="button" className="flex items-center gap-2 hover:text-gray-600 transition-colors">
              <span className="text-lg">😊</span>
              <span>Add icon</span>
            </button>
            <button type="button" className="flex items-center gap-2 hover:text-gray-600 transition-colors">
              <span className="text-lg">🏔️</span>
              <span>Add cover</span>
            </button>
            <button type="button" className="flex items-center gap-2 hover:text-gray-600 transition-colors">
              <span className="text-lg">💬</span>
              <span>Add comment</span>
            </button>
          </div>
        )}
        
        {/* Textarea */}
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "w-full min-h-[120px] bg-transparent resize-none outline-none border-0",
            "text-gray-900 placeholder:text-gray-400",
            value ? "text-lg font-medium" : "text-3xl font-bold",
            "transition-all duration-200"
          )}
          {...props}
        />
      </div>
    );
  }
);

NotionTextarea.displayName = "NotionTextarea";

export { NotionTextarea };