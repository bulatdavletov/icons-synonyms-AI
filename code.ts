import { emit, on, showUI } from '@create-figma-plugin/utilities'
import { exportNodeAsBase64, getBestNodeToExport } from './src/utils/icon-exporter'
import { generateSynonyms } from './src/services/ai-service'
import { Handler } from './src/types'
import { DEFAULT_SYSTEM_MESSAGE, DEFAULT_USER_PROMPT } from './prompt'
import { findRelatedSizeVariantsFromCache, buildIconCache } from './src/utils/icon-cache'
import { getNodeDescription } from './src/utils/description-utils'

export default function () {
  showUI({
    width: 400,
    height: 500
  })

  // Build the icon cache when the plugin starts
  buildIconCache().then(cache => {
    console.log(`[DEBUG] Initial icon cache built with ${cache.icons.length} icons`);
  }).catch(error => {
    console.error('[DEBUG] Error building initial icon cache:', error);
  });

  function updateDescription(node: ComponentNode | ComponentSetNode, description: string) {
    node.description = description
  }

  // Function to find related components with different sizes
  function findRelatedSizeVariants(node: ComponentNode | ComponentSetNode | InstanceNode): (ComponentNode | ComponentSetNode)[] {
    console.log('[DEBUG] Starting findRelatedSizeVariants for node:', node.name, 'type:', node.type);
    
    // Get base name by removing size suffix like @20x20
    const getBaseName = (name: string): string => {
      // Match the size suffix pattern at the end of the string
      const regex = /@\d+x\d+$/;
      console.log(`[DEBUG] Original name: "${name}"`);
      
      // Normalize the name by trimming whitespace
      const normalizedName = name.trim();
      const baseName = normalizedName.replace(regex, '').trim();
      
      console.log(`[DEBUG] Base name: "${baseName}"`);
      return baseName;
    };

    // Get the node's name or the main component's name if it's an instance
    const nodeName = node.type === "INSTANCE" && node.mainComponent 
      ? getBaseName(node.mainComponent.name)
      : getBaseName(node.name);
    
    console.log(`[DEBUG] Normalized node name: "${nodeName}"`);
    
    // Function to normalize name for comparison (removing extra spaces around slashes)
    const normalizeForComparison = (name: string): string => {
      // Replace any space+slash+space, space+slash, or slash+space with a single slash
      return name.replace(/\s*\/\s*/g, '/').toLowerCase();
    };
    
    const normalizedNodeName = normalizeForComparison(nodeName);
    console.log(`[DEBUG] Comparison node name: "${normalizedNodeName}"`);
    
    // Find the parent page of the node
    let parentPage = node.parent;
    const parentPath: string[] = [];
    while (parentPage && parentPage.type !== 'PAGE') {
      parentPath.push(parentPage.name);
      parentPage = parentPage.parent;
    }
    
    console.log(`[DEBUG] Parent hierarchy: ${parentPath.reverse().join(' -> ')}`);
    
    if (!parentPage) {
      console.log(`[DEBUG] Could not find parent page for node "${node.name}"`);
      console.log(`[DEBUG] Node parent type: ${node.parent ? node.parent.type : 'none'}`);
      
      // Fallback to current page if no parent page is found
      console.log(`[DEBUG] Falling back to figma.currentPage`);
      parentPage = figma.currentPage;
    }
    
    console.log(`[DEBUG] Parent page found: "${parentPage.name}", children count: ${parentPage.children.length}`);
    
    // Recursive function to search for components in all frames
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
    for (const child of parentPage.children) {
      allComponents.push(...findComponentsInNode(child));
    }
    
    console.log(`[DEBUG] All components on page (${allComponents.length}):`, 
      allComponents.map(c => c.name).join(', '));
    
    // Find all components on the same page with similar base name
    const relatedComponents: (ComponentNode | ComponentSetNode)[] = [];
    
    // For exact matching
    for (const child of allComponents) {
      const childBaseName = getBaseName(child.name);
      const normalizedChildName = normalizeForComparison(childBaseName);
      console.log(`[DEBUG] Checking child: "${child.name}", normalized: "${normalizedChildName}"`);
      
      // Log detailed comparison for debugging
      console.log(`[DEBUG] Comparing: "${normalizedChildName}" with "${normalizedNodeName}"`);
      console.log(`[DEBUG] Equal?: ${normalizedChildName === normalizedNodeName}`);
      
      // Try a less strict comparison if main comparison fails
      const baseChildName = child.name.split('@')[0].trim().toLowerCase();
      const baseNodeName = node.name.split('@')[0].trim().toLowerCase();
      console.log(`[DEBUG] Simple comparison: "${baseChildName}" with "${baseNodeName}"`);
      console.log(`[DEBUG] Simple Equal?: ${baseChildName === baseNodeName}`);
      
      // Case-insensitive comparison and normalized spacing
      if (normalizedChildName === normalizedNodeName || baseChildName === baseNodeName) {
        console.log(`[DEBUG] Found matching component: "${child.name}"`);
        relatedComponents.push(child);
      }
    }
    
    console.log(`[DEBUG] Found ${relatedComponents.length} related components`);
    if (relatedComponents.length > 0) {
      console.log(`[DEBUG] Related components: ${relatedComponents.map(c => c.name).join(', ')}`);
    } else {
      console.log(`[DEBUG] No related components found, adding self`);
      // Always include the original node to ensure at least one component
      if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
        relatedComponents.push(node);
      } else if (node.type === "INSTANCE" && node.mainComponent) {
        relatedComponents.push(node.mainComponent);
      }
    }
    
    // Deduplicate components by name
    const uniqueComponents = Array.from(
      new Map(relatedComponents.map(comp => [comp.name, comp])).values()
    );
    
    console.log(`[DEBUG] After deduplication: ${uniqueComponents.length} components`);
    
    return uniqueComponents;
  }

  // Function to update description on all related size variants
  async function updateDescriptionOnAllVariants(node: ComponentNode | ComponentSetNode | InstanceNode, description: string): Promise<void> {
    console.log(`[DEBUG] Updating description on all variants`);
    
    // Get related variants from cache
    const cachedVariants = await findRelatedSizeVariantsFromCache(node);
    
    if (cachedVariants.length === 0) {
      console.log(`[DEBUG] No related variants found in cache for ${node.name}`);
      // Fall back to updating just the current node
      if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
        try {
          console.log(`[DEBUG] Updating description on "${node.name}"`);
          const oldDescription = node.description || '';
          console.log(`[DEBUG] Old description: "${oldDescription}"`);
          
          // Update description using all three approaches
          node.description = description;
          node.setRelaunchData({ 'custom-description': description });
          node.setPluginData('custom-description', description);
          
          console.log(`[DEBUG] New description: "${description}"`);
        } catch (error) {
          console.error(`[DEBUG] Error updating description on node "${node.name}":`, error);
        }
      }
      return;
    }
    
    console.log(`[DEBUG] Found ${cachedVariants.length} variants to update`);
    
    // Find all components by ID from the cache
    for (const cachedVariant of cachedVariants) {
      try {
        // Try to find the component in the document by ID
        const component = figma.getNodeById(cachedVariant.id) as ComponentNode | ComponentSetNode;
        
        if (component && (component.type === "COMPONENT" || component.type === "COMPONENT_SET")) {
          console.log(`[DEBUG] Updating description on "${component.name}"`);
          const oldDescription = component.description || '';
          console.log(`[DEBUG] Old description: "${oldDescription}"`);
          
          // Update description using all three approaches
          component.description = description;
          component.setRelaunchData({ 'custom-description': description });
          component.setPluginData('custom-description', description);
          
          console.log(`[DEBUG] New description: "${description}"`);
        } else {
          console.log(`[DEBUG] Could not find component with ID ${cachedVariant.id}`);
        }
      } catch (error) {
        console.error(`[DEBUG] Error updating description on variant "${cachedVariant.name}":`, error);
      }
    }
    
    console.log(`[DEBUG] Description update complete on all variants`);
    
    // Rebuild the cache after updating descriptions
    buildIconCache().catch(error => {
      console.error(`[DEBUG] Error rebuilding cache after updates:`, error);
    });
  }

  // Function to send current selection to UI
  async function sendSelectionToUI() {
    const selection = figma.currentPage.selection
    
    if (selection.length === 1) {
      const node = selection[0]
      
      if (node.type === "COMPONENT" || node.type === "COMPONENT_SET" || node.type === "INSTANCE") {
        console.log('[DEBUG] Processing selection:', node.name);
        
        try {
          // Use cached version to find related variants
          const relatedIconsFromCache = await findRelatedSizeVariantsFromCache(node);
          console.log(`[DEBUG] Found ${relatedIconsFromCache.length} related icons from cache`);
          
          // Get description using our helper function that checks multiple sources
          let description = ""
          if (node.type === "INSTANCE" && node.mainComponent) {
            description = getNodeDescription(node.mainComponent);
          } else {
            description = getNodeDescription(node);
          }
          
          // Get variant names for display
          const variantNames = relatedIconsFromCache.map(variant => variant.name);
          
          // Find the current node in the cache results
          const nodeKey = node.type === "INSTANCE" && node.mainComponent 
            ? node.mainComponent.name 
            : node.name;
          
          // Reorder to put the current selection first, avoiding duplicates
          let orderedNames;
          if (variantNames.includes(nodeKey)) {
            // If the current node is already in the list, just reorder
            orderedNames = [nodeKey, ...variantNames.filter(name => name !== nodeKey)];
          } else {
            // If the current node is not in the list (which shouldn't happen but could), add it
            orderedNames = [nodeKey, ...variantNames];
            console.log(`[DEBUG] Warning: Current node "${nodeKey}" not found in related variants. Adding it.`);
          }
          
          // Use the description from cache for each variant
          const variantDescriptions = relatedIconsFromCache.map(variant => {
            return {
              name: variant.name,
              description: variant.description,
              hasDescription: variant.hasDescription
            };
          });
          
          console.log('[DEBUG] Collected variant descriptions:', variantDescriptions);
          
          // Create the data object to send to UI
          const selectionData = {
            name: node.name,
            type: node.type,
            description,
            hasDescription: description.trim() !== "",
            relatedVariants: {
              names: orderedNames,
              count: relatedIconsFromCache.length,
              descriptions: variantDescriptions
            }
          };
          
          console.log('[DEBUG] Sending selection data to UI:', JSON.stringify(selectionData, null, 2));
          
          emit('selection-change', selectionData);
        } catch (error) {
          console.error('[DEBUG] Error in sendSelectionToUI:', error);
          
          // Send basic data without related variants in case of error
          emit('selection-change', {
            name: node.name,
            type: node.type,
            description: node.type === "INSTANCE" && node.mainComponent 
              ? getNodeDescription(node.mainComponent)
              : getNodeDescription(node),
            hasDescription: node.type === "INSTANCE" && node.mainComponent
              ? getNodeDescription(node.mainComponent).trim() !== ""
              : getNodeDescription(node).trim() !== "",
            relatedVariants: {
              names: [node.name],
              count: 1,
              descriptions: []
            }
          });
        }
      }
    }
  }

  // Storage keys
  const API_KEY_STORAGE_KEY = 'openai-api-key';
  const SYSTEM_MESSAGE_STORAGE_KEY = 'system-message';
  const USER_PROMPT_STORAGE_KEY = 'user-prompt';
  const USE_DEFAULT_PROMPT_STORAGE_KEY = 'use-default-prompt';

  // API key and prompt template handlers
  on('get-api-key', async () => {
    try {
      const apiKey = await loadApiKey();
      emit('api-key-response', { apiKey });
    } catch (error) {
      console.error('Error retrieving API key:', error);
      emit('api-key-response', { apiKey: '' });
    }
  });

  on('save-api-key', async (data: { apiKey: string }) => {
    try {
      await figma.clientStorage.setAsync(API_KEY_STORAGE_KEY, data.apiKey);
      emit('api-key-saved');
    } catch (error) {
      console.error('Error saving API key:', error);
      emit('api-key-save-error', { error: 'Failed to save API key. Please try again.' });
    }
  });

  on('get-prompt-templates', async () => {
    try {
      const systemMessage = await figma.clientStorage.getAsync(SYSTEM_MESSAGE_STORAGE_KEY) || DEFAULT_SYSTEM_MESSAGE;
      const userPrompt = await figma.clientStorage.getAsync(USER_PROMPT_STORAGE_KEY) || DEFAULT_USER_PROMPT;
      const isDefault = !await figma.clientStorage.getAsync(USE_DEFAULT_PROMPT_STORAGE_KEY);
      
      emit('prompt-templates-response', { 
        systemMessage, 
        userPrompt, 
        isDefault 
      });
    } catch (error) {
      console.error('Error retrieving prompt templates:', error);
      emit('prompt-templates-response', { 
        systemMessage: DEFAULT_SYSTEM_MESSAGE, 
        userPrompt: DEFAULT_USER_PROMPT, 
        isDefault: true 
      });
    }
  });

  on('save-prompt-templates', async (data: { systemMessage: string, userPrompt: string }) => {
    try {
      await figma.clientStorage.setAsync(SYSTEM_MESSAGE_STORAGE_KEY, data.systemMessage);
      await figma.clientStorage.setAsync(USER_PROMPT_STORAGE_KEY, data.userPrompt);
      await figma.clientStorage.setAsync(USE_DEFAULT_PROMPT_STORAGE_KEY, true);
      emit('prompt-templates-saved');
    } catch (error) {
      console.error('Error saving prompt templates:', error);
      emit('prompt-templates-save-error', { error: 'Failed to save prompt templates. Please try again.' });
    }
  });

  on('reset-prompt-templates', async () => {
    try {
      await figma.clientStorage.deleteAsync(SYSTEM_MESSAGE_STORAGE_KEY);
      await figma.clientStorage.deleteAsync(USER_PROMPT_STORAGE_KEY);
      await figma.clientStorage.deleteAsync(USE_DEFAULT_PROMPT_STORAGE_KEY);
      emit('prompt-templates-reset');
    } catch (error) {
      console.error('Error resetting prompt templates:', error);
      emit('prompt-templates-save-error', { error: 'Failed to reset prompt templates. Please try again.' });
    }
  });

  // Helper function to load the API key
  async function loadApiKey(): Promise<string> {
    try {
      return await figma.clientStorage.getAsync(API_KEY_STORAGE_KEY) || '';
    } catch (error) {
      console.error('Error loading API key:', error);
      return '';
    }
  }

  // Handle messages from the UI
  on('generate-synonyms', async () => {
    try {
      // Show loading state
      figma.notify("Generating synonyms...")
      
      // Get the current selection
      const selection = figma.currentPage.selection
      
      // Find the best node to export
      const nodeToExport = getBestNodeToExport(selection)
      
      if (!nodeToExport) {
        emit('generate-error', {
          error: 'No valid icon selected'
        })
        return
      }
      
      // Load the API key from storage
      const apiKey = await loadApiKey();
      
      // Export the node as base64
      const imageBase64 = await exportNodeAsBase64(nodeToExport)
      
      // Get the node name and description
      let name = nodeToExport.name
      let description = ''
      
      if (nodeToExport.type === 'COMPONENT') {
        description = nodeToExport.description || ''
      } else if (nodeToExport.type === 'INSTANCE' && nodeToExport.mainComponent) {
        description = nodeToExport.mainComponent.description || ''
      }
      
      // Load custom prompts if available
      const systemMessage = await figma.clientStorage.getAsync(SYSTEM_MESSAGE_STORAGE_KEY) || DEFAULT_SYSTEM_MESSAGE;
      const userPrompt = await figma.clientStorage.getAsync(USER_PROMPT_STORAGE_KEY) || DEFAULT_USER_PROMPT;
      
      console.log('[DEBUG] Generating synonyms with custom prompts:', !!systemMessage, !!userPrompt);
      
      // Generate synonyms using the AI service
      const result = await generateSynonyms({
        name,
        imageBase64,
        existingDescription: description,
        apiKey: apiKey, // Use the stored API key
        systemMessage, // Use custom system message if available
        userPrompt // Use custom user prompt if available
      })
      
      // Extract all synonyms without grouping
      const synonyms = result.synonyms.flatMap(s => {
        const colonIndex = s.indexOf(':')
        if (colonIndex > 0) {
          return s.substring(colonIndex + 1).trim().split(',').map(item => item.trim())
        }
        return []
      })
      
      emit('synonyms-generated', { synonyms })
      
      figma.notify("Synonyms generated successfully!")
    } catch (error: any) {
      console.error('Error in generate-synonyms handler:', error)
      emit('generate-error', {
        error: error.message || 'Unknown error occurred'
      })
      figma.notify("Error generating synonyms")
    }
  })

  // Update description handler to handle updating all related variants
  on('update-description', (data: { synonyms?: string[], rawDescription?: string, isManualEdit?: boolean, updateAllVariants?: boolean }) => {
    const selection = figma.currentPage.selection[0]
    
    if (selection && (selection.type === "COMPONENT" || selection.type === "COMPONENT_SET" || selection.type === "INSTANCE")) {
      try {
        // Get the text to set based on whether it's a raw description or synonyms
        let textToSet = '';
        
        if (data.isManualEdit && data.rawDescription !== undefined) {
          textToSet = data.rawDescription;  // Use raw text for manual edits
        } else if (data.synonyms && Array.isArray(data.synonyms)) {
          textToSet = data.synonyms.join(', ');  // Use joined synonyms otherwise
        }
        
        console.log('Text to set:', textToSet)
        
        // Get the current description
        figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(async () => {
          // Get current description
          let currentDescription = ""
          let nodeToUpdate: ComponentNode | ComponentSetNode | null = null;
          
          if (selection.type === "COMPONENT" || selection.type === "COMPONENT_SET") {
            nodeToUpdate = selection as ComponentNode | ComponentSetNode;
            currentDescription = getNodeDescription(nodeToUpdate);
          } else if (selection.type === "INSTANCE" && selection.mainComponent) {
            nodeToUpdate = selection.mainComponent;
            currentDescription = getNodeDescription(nodeToUpdate);
          }
          
          if (!nodeToUpdate) {
            emit('generate-error', {
              error: 'Cannot update description: Invalid component'
            });
            return;
          }
          
          // Create new description based on whether this is a manual edit or adding synonyms
          let newText = ""
          if (data.isManualEdit) {
            // For manual edits, completely replace the description
            newText = textToSet
          } else {
            // For adding synonyms, append to existing description
            if (currentDescription.trim() === "") {
              newText = textToSet
            } else {
              newText = `${currentDescription}\n\n${textToSet}`
            }
          }
          
          try {
            if (data.updateAllVariants) {
              // Use our new function to update all related variants
              await updateDescriptionOnAllVariants(selection, newText);
              
              figma.notify(`Description updated on all component variants!`);
            } else {
              // Just update the current component
              if (nodeToUpdate) {
                // APPROACH 1: Try the traditional approach first
                nodeToUpdate.description = newText;
                
                // APPROACH 2: Also store the description in relaunchData as backup
                nodeToUpdate.setRelaunchData({ 'custom-description': newText });
                
                // APPROACH 3: Also try updating via plugin data
                nodeToUpdate.setPluginData('custom-description', newText);
                
                // Rebuild the cache after updating
                buildIconCache().catch(error => {
                  console.error(`[DEBUG] Error rebuilding cache after single update:`, error);
                });
              }
            }
            
            // Force a refresh of Figma's UI to ensure our changes take effect
            const currentSelection = figma.currentPage.selection
            figma.currentPage.selection = []
            setTimeout(() => {
              figma.currentPage.selection = currentSelection
              
              // Check if the update was successful
              let updatedDescription = nodeToUpdate ? getNodeDescription(nodeToUpdate) : '';
              
              // Check if we need a fallback
              if (updatedDescription !== newText) {
                console.warn('Description did not update correctly, using relaunchData approach')
                figma.notify('Using alternative method to update description')
                
                // Update UI with the data we stored in relaunchData
                emit('description-updated', {
                  description: newText, // Use what we tried to set
                  hasDescription: true
                })
              } else {
                // Success case - description updated correctly
                emit('description-updated', {
                  description: updatedDescription,
                  hasDescription: true
                })
              }
              
              figma.notify('Description updated successfully!')
            }, 100)
          } catch (error) {
            console.error('Error updating description:', error)
            figma.notify('Error updating description', { error: true })
            
            // Try fallback approach
            try {
              const fallbackDescription = data.isManualEdit ? textToSet : (currentDescription + "\n\n" + textToSet)
              nodeToUpdate.setPluginData('custom-description', fallbackDescription)
              nodeToUpdate.setRelaunchData({ 'custom-description': fallbackDescription })
              
              emit('description-updated', {
                description: fallbackDescription,
                hasDescription: true
              })
              
              figma.notify('Used fallback approach to update description')
            } catch (fallbackError) {
              console.error('Fallback approach failed:', fallbackError)
              emit('generate-error', {
                error: 'Failed to update description: ' + (error as Error).message
              })
            }
          }
        }).catch(error => {
          console.error('Error loading font:', error)
          figma.notify('Error loading font', { error: true })
          emit('generate-error', {
            error: 'Failed to load font: ' + (error as Error).message
          })
        })
      } catch (error: any) {
        console.error('Error in update-description handler:', error)
        emit('generate-error', {
          error: 'Failed to update description: ' + error.message
        })
      }
    } else {
      emit('generate-error', {
        error: 'Cannot update description: Please select a component or component set'
      })
    }
  })

  // Function to read description (for future use)
  function getNodeDescription(node: SceneNode): string {
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

  // Request UI to check for selection on startup
  on('ui-ready', () => {
    sendSelectionToUI()
  })

  // Also check selection when plugin loads
  setTimeout(() => {
    sendSelectionToUI()
  }, 100)

  // Listen for selection changes
  figma.on("selectionchange", () => {
    sendSelectionToUI()
  })

  // Initial selection check
  sendSelectionToUI()
}

