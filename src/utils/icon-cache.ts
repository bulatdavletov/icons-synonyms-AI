// Icon cache utility for faster component search
import { getNodeDescription } from '../utils/description-utils';

interface CachedIcon {
  id: string;
  name: string;
  baseName: string; // Name without size suffix
  type: string;
  description: string;
  hasDescription: boolean;
  size?: {
    width: number;
    height: number;
  };
}

interface IconCache {
  pageId: string;
  lastUpdated: number;
  icons: CachedIcon[];
}

// Storage key for the icon cache
const ICON_CACHE_KEY = 'icon-cache';

/**
 * Extract size from component name (e.g., "icon@24x24" -> {width: 24, height: 24})
 */
function extractSizeFromName(name: string): { width: number; height: number } | null {
  const sizeMatch = name.match(/@(\d+)x(\d+)$/);
  if (sizeMatch) {
    return {
      width: parseInt(sizeMatch[1], 10),
      height: parseInt(sizeMatch[2], 10)
    };
  }
  return null;
}

/**
 * Get base name by removing size suffix like @20x20
 */
export function getBaseName(name: string): string {
  // Match the size suffix pattern at the end of the string
  const regex = /@\d+x\d+$/;
  // Normalize the name by trimming whitespace
  const normalizedName = name.trim();
  const baseName = normalizedName.replace(regex, '').trim();
  return baseName;
}

/**
 * Normalize name for comparison (removing extra spaces around slashes)
 */
export function normalizeForComparison(name: string): string {
  // Replace any space+slash+space, space+slash, or slash+space with a single slash
  return name.replace(/\s*\/\s*/g, '/').toLowerCase();
}

/**
 * Build cache of all components on the current page
 */
export async function buildIconCache(): Promise<IconCache> {
  console.log('[DEBUG] Building icon cache');
  const currentPage = figma.currentPage;
  
  // Function to recursively find all components in a node
  function findComponentsInNode(node: SceneNode): (ComponentNode | ComponentSetNode)[] {
    const components: (ComponentNode | ComponentSetNode)[] = [];
    
    // Check if the node itself is a component
    if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
      components.push(node);
    }
    
    // If the node is a frame, section, or group, search its children
    if ('children' in node) {
      for (const child of node.children) {
        components.push(...findComponentsInNode(child));
      }
    }
    
    return components;
  }
  
  // Find all components on the page recursively
  const allComponents: (ComponentNode | ComponentSetNode)[] = [];
  for (const child of currentPage.children) {
    allComponents.push(...findComponentsInNode(child));
  }
  
  console.log(`[DEBUG] Found ${allComponents.length} components for caching`);
  
  // Create cached icon objects
  const icons: CachedIcon[] = allComponents.map(component => {
    const name = component.name;
    const baseName = getBaseName(name);
    const normalizedName = normalizeForComparison(baseName);
    const description = getNodeDescription(component);
    const sizeObj = extractSizeFromName(name);
    
    return {
      id: component.id,
      name,
      baseName,
      type: component.type,
      description,
      hasDescription: description.trim() !== '',
      size: sizeObj || undefined
    };
  });
  
  // Sort icons by baseName and then by size for easier lookup
  icons.sort((a, b) => {
    // First sort by base name
    const baseNameCompare = a.baseName.localeCompare(b.baseName);
    if (baseNameCompare !== 0) return baseNameCompare;
    
    // If base names are equal, sort by size (smaller first)
    if (a.size && b.size) {
      return a.size.width - b.size.width;
    }
    
    // If one has size and the other doesn't, prioritize the one with size
    if (a.size) return -1;
    if (b.size) return 1;
    
    // If neither has size, maintain original order
    return 0;
  });
  
  const cache: IconCache = {
    pageId: currentPage.id,
    lastUpdated: Date.now(),
    icons
  };
  
  // Store the cache
  await figma.clientStorage.setAsync(ICON_CACHE_KEY, cache);
  console.log(`[DEBUG] Icon cache built and stored with ${icons.length} icons`);
  
  return cache;
}

/**
 * Get cached icon data
 */
export async function getIconCache(): Promise<IconCache | null> {
  try {
    const cache = await figma.clientStorage.getAsync(ICON_CACHE_KEY) as IconCache | undefined;
    
    // Check if cache exists and is for the current page
    if (cache && cache.pageId === figma.currentPage.id) {
      console.log(`[DEBUG] Using existing icon cache with ${cache.icons.length} icons`);
      // Check if cache is recent (less than 5 minutes old)
      const cacheAge = Date.now() - cache.lastUpdated;
      if (cacheAge < 5 * 60 * 1000) {
        return cache;
      }
      console.log('[DEBUG] Cache is older than 5 minutes, rebuilding');
    }
    
    // Build a new cache if needed
    return await buildIconCache();
  } catch (error) {
    console.error('[DEBUG] Error getting icon cache:', error);
    return await buildIconCache();
  }
}

/**
 * Find related size variants from the cache
 */
export async function findRelatedSizeVariantsFromCache(node: ComponentNode | ComponentSetNode | InstanceNode): Promise<CachedIcon[]> {
  console.log('[DEBUG] Finding related variants from cache for:', node.name);
  
  // Get the node's base name
  const nodeName = node.type === "INSTANCE" && node.mainComponent 
    ? getBaseName(node.mainComponent.name)
    : getBaseName(node.name);
  
  const normalizedNodeName = normalizeForComparison(nodeName);
  console.log(`[DEBUG] Looking for normalized name: "${normalizedNodeName}"`);
  
  // Get or build the cache
  const cache = await getIconCache();
  if (!cache) {
    console.error('[DEBUG] Failed to get icon cache');
    return [];
  }
  
  // Find all icons with matching base name
  const relatedIcons = cache.icons.filter(icon => {
    const normalizedCachedName = normalizeForComparison(icon.baseName);
    return normalizedCachedName === normalizedNodeName;
  });
  
  console.log(`[DEBUG] Found ${relatedIcons.length} related icons in cache`);
  return relatedIcons;
} 