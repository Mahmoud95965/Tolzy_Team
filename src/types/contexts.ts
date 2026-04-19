import { Tool, FilterOptions } from './index';

export interface ToolsContextType {
  tools: Tool[];
  loading: boolean;
  error: string | null;
  featuredTools: Tool[];
  popularTools: Tool[];
  newTools: Tool[];
  getToolById: (id: string) => Tool | undefined;
  getRelatedTools: (tool: Tool, limit?: number) => Tool[];
  filterToolsByOptions: (options: FilterOptions) => Tool[];
}
