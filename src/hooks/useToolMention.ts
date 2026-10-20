'use client';

import { useState, useCallback, useRef } from 'react';
import { Tool } from '../types/tool';
import { formatToolMentionToken } from '../utils/toolMention';

interface UseToolMentionOptions {
  onInsertMention?: (tool: Tool) => void;
}

export function useToolMention(options?: UseToolMentionOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [atIndex, setAtIndex] = useState<number | null>(null);

  // Check text around cursor to see if an `@` mention is currently being typed
  const handleInputChange = useCallback(
    (text: string, cursorPosition: number) => {
      // Find the last `@` before or at the cursor
      const textBeforeCursor = text.slice(0, cursorPosition);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');

      if (lastAtIndex === -1) {
        setIsOpen(false);
        setAtIndex(null);
        setQuery('');
        return;
      }

      // Check if there is whitespace or newline between the `@` and cursor
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // If there's a newline or too many characters (e.g. > 25), don't trigger
      if (textAfterAt.includes('\n') || textAfterAt.length > 25) {
        setIsOpen(false);
        setAtIndex(null);
        setQuery('');
        return;
      }

      // Valid mention in progress!
      setAtIndex(lastAtIndex);
      setQuery(textAfterAt);
      setIsOpen(true);
      setActiveIndex(0);
    },
    []
  );

  // Insert selected tool into text
  const insertTool = useCallback(
    (tool: Tool, text: string, cursorPosition?: number): { newText: string; newCursor: number } => {
      const token = formatToolMentionToken(tool.name, tool.id);
      let targetAtIndex = atIndex;

      // If atIndex was lost, search backwards from cursor or find last '@'
      if (targetAtIndex === null || targetAtIndex < 0) {
        const pos = cursorPosition !== undefined ? cursorPosition : text.length;
        const textBefore = text.slice(0, pos);
        targetAtIndex = textBefore.lastIndexOf('@');
      }

      if (targetAtIndex === -1) {
        // Just append token
        const newText = text ? `${text} ${token} ` : `${token} `;
        setIsOpen(false);
        setAtIndex(null);
        setQuery('');
        options?.onInsertMention?.(tool);
        return { newText, newCursor: newText.length };
      }

      const endReplacePos = cursorPosition !== undefined ? cursorPosition : targetAtIndex + 1 + query.length;
      const before = text.slice(0, targetAtIndex);
      const after = text.slice(endReplacePos);
      const newText = `${before}${token} ${after}`;
      const newCursor = `${before}${token} `.length;

      setIsOpen(false);
      setAtIndex(null);
      setQuery('');
      options?.onInsertMention?.(tool);

      return { newText, newCursor };
    },
    [atIndex, query, options]
  );

  // Handle keyboard navigation for dropdown
  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      matchingCount: number,
      onSelectActiveTool: () => void
    ): boolean => {
      if (!isOpen || matchingCount === 0) return false;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % matchingCount);
        return true;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + matchingCount) % matchingCount);
        return true;
      }

      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        onSelectActiveTool();
        return true;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        return true;
      }

      return false;
    },
    [isOpen]
  );

  const closeMention = useCallback(() => {
    setIsOpen(false);
    setAtIndex(null);
    setQuery('');
  }, []);

  return {
    isOpen,
    query,
    activeIndex,
    setActiveIndex,
    handleInputChange,
    insertTool,
    handleKeyDown,
    closeMention,
  };
}
