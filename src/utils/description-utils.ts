// Utilities for managing component descriptions

/**
 * Get description from a node, checking multiple sources
 */
export function getNodeDescription(node: SceneNode): string {
  // Try to get native description
  let description = ""
  if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
    description = (node as any).description || ""
  }
  
  // Check if we have a custom description stored
  const customDescription = node.getPluginData('custom-description')
  if (customDescription && customDescription.length > 0) {
    // Prefer the custom description if available
    return customDescription
  }
  
  return description
} 