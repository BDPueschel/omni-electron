import React, { useRef, useEffect } from 'react';
import { Icon } from './Icon';

interface SearchInputProps {
  value: string;
  onInput: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function SearchInput({ value, onInput, onKeyDown }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const cleanup = window.omni.onWindowShown(() => {
      setTimeout(() => inputRef.current?.focus(), 50);
    });
    return cleanup;
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [value]);

  return (
    <div className="flex items-center px-3 py-2 border-b border-omni-separator shrink-0">
      <span className="text-white/40 mr-3"><Icon name="search" size={18} /></span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder="Search..."
        onChange={(e) => onInput(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full bg-transparent border-none outline-none text-lg text-omni-text placeholder:text-white/30 font-sans"
      />
    </div>
  );
}
