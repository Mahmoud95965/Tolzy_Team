"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Tool } from '../types/tool';
import { toast } from 'react-hot-toast';

interface CompareContextType {
  compareList: Tool[];
  addToCompare: (tool: Tool) => boolean;
  removeFromCompare: (toolId: string) => void;
  toggleCompare: (tool: Tool) => void;
  isInCompare: (toolId: string) => boolean;
  clearCompare: () => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  comparePair: (toolA: Tool, toolB: Tool) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;
const STORAGE_KEY = 'tolzy_compare_tools';

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<Tool[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompareList(parsed.slice(0, MAX_COMPARE_ITEMS));
        }
      }
    } catch {
      // Ignore parsing errors
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
    } catch {
      // Ignore quota errors
    }
  }, [compareList, isInitialized]);

  const isInCompare = useCallback((toolId: string) => {
    return compareList.some((t) => t.id === toolId);
  }, [compareList]);

  const addToCompare = useCallback((tool: Tool): boolean => {
    if (!tool || !tool.id) return false;

    if (isInCompare(tool.id)) {
      toast('الأداة مضافة بالفعل لقائمة المقارنة', { icon: 'ℹ️' });
      return false;
    }

    if (compareList.length >= MAX_COMPARE_ITEMS) {
      toast.error(`يمكن مقارنة ${MAX_COMPARE_ITEMS} أدوات كحد أقصى في وقت واحد`);
      return false;
    }

    setCompareList((prev) => [...prev, tool]);
    toast.success(`تمت إضافة ${tool.name} للمقارنة (${compareList.length + 1}/${MAX_COMPARE_ITEMS})`);
    return true;
  }, [compareList.length, isInCompare]);

  const removeFromCompare = useCallback((toolId: string) => {
    setCompareList((prev) => prev.filter((t) => t.id !== toolId));
  }, []);

  const toggleCompare = useCallback((tool: Tool) => {
    if (isInCompare(tool.id)) {
      removeFromCompare(tool.id);
      toast(`تمت إزالة ${tool.name} من المقارنة`, { icon: '🗑️' });
    } else {
      addToCompare(tool);
    }
  }, [isInCompare, removeFromCompare, addToCompare]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const openModal = useCallback(() => {
    if (compareList.length === 0) {
      toast('يرجى اختيار أداة واحدة على الأقل لبدء المقارنة', { icon: '⚖️' });
      return;
    }
    setIsModalOpen(true);
  }, [compareList.length]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const comparePair = useCallback((toolA: Tool, toolB: Tool) => {
    if (!toolA || !toolB) return;
    const pair = [toolA, toolB];
    setCompareList(pair);
    setIsModalOpen(true);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        isInCompare,
        clearCompare,
        isModalOpen,
        openModal,
        closeModal,
        comparePair
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
