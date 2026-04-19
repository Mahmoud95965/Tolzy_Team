import type { FilterOptions, Tool } from '../types/index';

export const filterTools = (tools: Tool[], filterOptions: FilterOptions): Tool[] => {
  return tools.filter(tool => {
    // Only hide explicitly rejected tools (allow missing or approved)
    if (tool.status === 'rejected' || tool.status === 'pending') {
      return false;
    }

    // Filter by category (دعم فئة واحدة أو عدة فئات)
    if (filterOptions.category !== 'All') {
      const toolCategories = Array.isArray(tool.category) ? tool.category : [tool.category];
      if (!toolCategories.includes(filterOptions.category)) {
        return false;
      }
    }

    // Filter by pricing
    if (filterOptions.pricing !== 'All' && tool.pricing !== filterOptions.pricing) {
      return false;
    }

    // Filter by search query
    if (filterOptions.searchQuery) {
      const query = filterOptions.searchQuery.toLowerCase();
      const nameMatch = tool.name.toLowerCase().includes(query);
      const descriptionMatch = tool.description.toLowerCase().includes(query);
      const tagsMatch = tool.tags.some(tag => tag.toLowerCase().includes(query));
      
      if (!nameMatch && !descriptionMatch && !tagsMatch) {
        return false;
      }
    }

    return true;
  });
};