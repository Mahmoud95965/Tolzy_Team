import React from 'react';
import { Tool } from '../../types';
import ToolsGrid from './ToolsGrid';
import { Bookmark } from 'lucide-react';
import { LoadingSpinnerSmall } from '../common/LoadingSpinner';

interface SavedToolsProps {
  tools: Tool[];
  isLoading?: boolean;
}

const SavedTools: React.FC<SavedToolsProps> = ({ tools, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinnerSmall />
      </div>
    );
  }
  if (tools.length === 0) {
    return (
      <div className="text-center py-8">
        <Bookmark className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">لا توجد أدوات محفوظة</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          ابدأ بحفظ الأدوات التي تهمك لتظهر هنا
        </p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">الأدوات المحفوظة</h2>
      <ToolsGrid tools={tools} />
    </div>
  );
};

export default SavedTools;
