import { emit, on, showUI } from '@create-figma-plugin/utilities'
import { exportNodeAsBase64, getBestNodeToExport } from './utils/icon-exporter'
import { generateSynonyms } from './services/ai-service'
import { ComponentInfo, Handler } from './types/index'
import { DEFAULT_SYSTEM_MESSAGE, DEFAULT_USER_PROMPT } from './prompt'

const STORAGE_KEY = 'openai-api-key'
const SYSTEM_MESSAGE_KEY = 'icon-synonyms-system-message'
const USER_PROMPT_KEY = 'icon-synonyms-user-prompt'
const AI_MODEL_KEY = 'openai-model-choice'

/**
 * Processes synonyms into a flat list
 * @param synonyms Array of category-prefixed synonym strings
 * @returns Flat list of unique synonyms
 */
function processSynonyms(synonyms: string[]): string[] {
  
  const processedSynonyms: string[] = [];
  
  // Process each line
  for (const line of synonyms) {
    
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      // Get the content after the colon (for our formatted items)
      const content = line.substring(colonIndex + 1).trim();
      
      if (content.length > 0) {
        // Add the content directly - it should already be a single term
        processedSynonyms.push(content);
      }
    } else if (line.length > 0) {
      // For any plain text without categories
      processedSynonyms.push(line.trim());
    }
  }
  
  // Remove duplicates and return
  const uniqueSynonyms = Array.from(new Set(processedSynonyms));
  return uniqueSynonyms;
}

export default function () {
  showUI({
    width: 400,
    height: 560
  })

  // Flag to track if UI is ready
  let isUIReady = false

  // Listen for UI-ready event
  on('ui-ready', () => {
    isUIReady = true
    // Send initial selection once UI is ready
    sendSelectionToUI()
  })

  function updateDescription(node: ComponentNode | ComponentSetNode, description: string) {
    node.description = description
  }

  // Function to send current selection to UI
  function sendSelectionToUI() {
    // Skip if UI is not ready yet
    if (!isUIReady) return
    
    const selection = figma.currentPage.selection
        
    // Process selection as batch
    const components: ComponentInfo[] = []
    const componentsMap = new Map<string, ComponentInfo>()
    const variantsMap = new Map<string, ComponentInfo[]>()
    
    // First pass: process each selected node and identify base components and variants
    selection.forEach(node => {
      if (node.type === "COMPONENT" || node.type === "COMPONENT_SET" || node.type === "INSTANCE") {

        // For instances, get description from the main component
        const hasDescription = Boolean(
          node.type === "INSTANCE" 
            ? node.mainComponent?.description 
            : node.description
        )
        
        const description = node.type === "INSTANCE"
          ? node.mainComponent?.description || ""
          : node.description || ""
        
        // Parse component name to check for size variants
        const nameParts = node.name.split('@')
        const hasVariant = nameParts.length > 1
        const originalName = nameParts[0].trim()
        // Normalize the original name by removing spaces for comparison (used as map key)
        const normalizedName = originalName.replace(/\s+/g, '')
        const sizeInfo = hasVariant ? '@' + nameParts[1].trim() : ''
        
        const componentInfo: ComponentInfo = {
          id: node.id,
          name: node.name,  // Keep the original full name including variant size
          type: node.type,
          description,
          hasDescription,
          originalName,     // Name without variant
          normalizedName,   // Name without spaces for grouping
          sizeInfo,         // Just the size variant part
          isBaseComponent: !hasVariant
        }

        // For instances, store the main component ID for navigation
        if (node.type === "INSTANCE" && node.mainComponent) {
          componentInfo.mainComponentId = node.mainComponent.id
          
          // If the instance comes from a component set, also store the component set ID
          if (node.mainComponent.parent && node.mainComponent.parent.type === "COMPONENT_SET") {
            componentInfo.componentSetId = node.mainComponent.parent.id
          }
        }
        
        // Store the component
        componentsMap.set(node.id, componentInfo)
        
        // Group by normalized original name (without size variant and spaces)
        if (!variantsMap.has(normalizedName)) {
          variantsMap.set(normalizedName, [])
        }
        
        variantsMap.get(normalizedName)?.push(componentInfo)
      }
    })
    
    // Second pass: establish relationships between base components and variants
    variantsMap.forEach((variants, normalizedName) => {
      
      // Find the base component (without @) if it exists
      const baseComponent = variants.find(comp => comp.isBaseComponent)
      
      if (baseComponent) {
        // This is the base component, add all its variants
        const otherVariants = variants.filter(comp => comp.id !== baseComponent.id)
        baseComponent.sizeVariants = otherVariants
        
        // Add only the base component to the components list
        components.push(baseComponent)
      } else {
        
        // No base component, just add all variants individually
        variants.forEach(variant => {
          components.push(variant)
        })
      }
    })
    
    // Send components to UI
    emit('selection-change', components)
  }

  // Handle API key requests
  on('get-api-key', async () => {
    try {
      // Get API key from client storage
      const apiKey = await figma.clientStorage.getAsync(STORAGE_KEY)
      emit('api-key-response', { apiKey: apiKey || '' })
    } catch (error) {
      console.error('Error retrieving API key:', error)
      emit('api-key-response', { apiKey: '' })
    }
  })

  // Handle API key save requests
  on('save-api-key', async (data: { apiKey: string }) => {
    try {
      // Validate API key (simple check that it's not empty and looks like an OpenAI key)
      if (!data.apiKey || !data.apiKey.trim()) {
        emit('api-key-save-error', { error: 'API key cannot be empty' })
        return
      }

      if (!data.apiKey.startsWith('sk-')) {
        emit('api-key-save-error', { error: 'Invalid API key format. OpenAI keys start with "sk-"' })
        return
      }

      // Save API key to client storage
      await figma.clientStorage.setAsync(STORAGE_KEY, data.apiKey.trim())
      emit('api-key-saved')
    } catch (error: any) {
      console.error('Error saving API key:', error)
      emit('api-key-save-error', { error: error.message || 'Failed to save API key' })
    }
  })

  // Handle requests for prompt templates
  on('get-prompt-templates', async () => {
    try {
      // Get prompt templates from client storage
      const systemMessage = await figma.clientStorage.getAsync(SYSTEM_MESSAGE_KEY)
      const userPrompt = await figma.clientStorage.getAsync(USER_PROMPT_KEY)
      
      emit('prompt-templates-response', { 
        systemMessage: systemMessage || '', 
        userPrompt: userPrompt || '',
        isDefault: false
      })
    } catch (error) {
      console.error('Error retrieving prompt templates:', error)
      emit('prompt-templates-response', { 
        systemMessage: '', 
        userPrompt: '',
        isDefault: false
      })
    }
  })

  // Handle requests for AI model
  on('get-ai-model', async () => {
    try {
      // Get AI model from client storage
      const model = await figma.clientStorage.getAsync(AI_MODEL_KEY)
      emit('ai-model-response', { model: model || 'gpt-4.1-mini' })
    } catch (error) {
      console.error('Error retrieving AI model:', error)
      emit('ai-model-response', { model: 'gpt-4.1-mini' })
    }
  })

  // Handle save requests for AI model
  on('save-ai-model', async (data: { model: string }) => {
    try {
      // Save AI model to client storage
      await figma.clientStorage.setAsync(AI_MODEL_KEY, data.model)
      emit('ai-model-saved')
    } catch (error: any) {
      console.error('Error saving AI model:', error)
      emit('ai-model-save-error', { error: error.message || 'Failed to save AI model' })
    }
  })

  // Handle save requests for prompt templates
  on('save-prompt-templates', async (data: { systemMessage: string; userPrompt: string }) => {
    try {
      // Validate that the templates are not empty
      if (!data.systemMessage || !data.systemMessage.trim() || !data.userPrompt || !data.userPrompt.trim()) {
        emit('prompt-templates-save-error', { error: 'Prompt templates cannot be empty' })
        return
      }

      // Save prompt templates to client storage
      await figma.clientStorage.setAsync(SYSTEM_MESSAGE_KEY, data.systemMessage.trim())
      await figma.clientStorage.setAsync(USER_PROMPT_KEY, data.userPrompt.trim())
      
      emit('prompt-templates-saved')
    } catch (error: any) {
      console.error('Error saving prompt templates:', error)
      emit('prompt-templates-save-error', { error: error.message || 'Failed to save prompt templates' })
    }
  })

  // Handle reset prompt templates to default
  on('reset-prompt-templates', async () => {
    try {
      // Reset to default templates from prompt.ts
      await figma.clientStorage.setAsync(SYSTEM_MESSAGE_KEY, '')
      await figma.clientStorage.setAsync(USER_PROMPT_KEY, '')
      
      emit('prompt-templates-response', { 
        systemMessage: DEFAULT_SYSTEM_MESSAGE, 
        userPrompt: DEFAULT_USER_PROMPT,
        isDefault: true
      })
      
      emit('prompt-templates-reset')
    } catch (error: any) {
      console.error('Error resetting prompt templates:', error)
      emit('prompt-templates-save-error', { error: error.message || 'Failed to reset prompt templates' })
    }
  })

  // Process a single component and generate synonyms for it
  async function processSingleComponent(nodeId: string): Promise<void> {
    try {
      // Get API key from storage
      const apiKey = await figma.clientStorage.getAsync(STORAGE_KEY)
      
      if (!apiKey) {
        emit('generate-error', {
          error: 'API key not found. Please set your OpenAI API key in the Settings tab.',
          componentId: nodeId
        })
        return
      }
      
      // Get AI model from storage, default to gpt-4.1-mini if not set
      const model = await figma.clientStorage.getAsync(AI_MODEL_KEY) || 'gpt-4.1-mini'
      
      // Find the node by ID
      const node = figma.getNodeById(nodeId)
      
      if (!node || (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET' && node.type !== 'INSTANCE')) {
        emit('generate-error', {
          error: 'Component not found or not a valid component',
          componentId: nodeId
        })
        return
      }
      
      // Export the node as base64
      const imageBase64 = await exportNodeAsBase64(node)
      
      // Get the node name and description
      let name = node.name
      let description = ''
      
      if (node.type === "INSTANCE") {
        description = node.mainComponent?.description || ''
      } else {
        description = node.description || ''
      }
      
      // Generate synonyms using the AI service
      const result = await generateSynonyms({
        name,
        imageBase64,
        existingDescription: description,
        apiKey,
        model
      })
      
      if (result.error) {
        emit('generate-error', {
          error: result.error,
          componentId: nodeId
        })
        return
      }
      
      // Process synonyms from AI service
      const processedSynonyms = processSynonyms(result.synonyms)
      
      // Send generated synonyms to UI
      emit('synonyms-generated', { 
        synonyms: processedSynonyms,
        componentId: nodeId
      })
    } catch (error: any) {
      console.error('Error processing component:', error)
      
      emit('generate-error', {
        error: error.message || 'Failed to generate synonyms',
        componentId: nodeId
      })
    }
  }

  // Handle generate-synonyms request
  on('generate-synonyms', async (componentIds: string[]) => {
    try {
      // Process each component in sequence
      for (const componentId of componentIds) {
        await processSingleComponent(componentId)
      }
      
      // Reset global loading state when all processing is complete
      emit('processing-complete')
    } catch (error: any) {
      console.error('Error in generate-synonyms handler:', error)
      emit('generate-error', { 
        error: error.message || 'Unknown error occurred during processing'
      })
      
      // Also reset loading state on error
      emit('processing-complete')
    }
  })

  // Handle description updates
  on('update-description', async (data: { 
    synonyms?: string[], 
    rawDescription?: string, 
    isManualEdit?: boolean,
    componentId?: string,
    description?: string,
    updateVariants?: boolean
  }) => {
    try {
      // Batch mode: Update a specific component
      if (data.componentId) {
        const node = figma.getNodeById(data.componentId)
        
        if (!node || (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET')) {
          emit('generate-error', { error: 'Component not found or not a valid component' })
          return
        }
        
        const description = data.description || data.rawDescription || (data.synonyms ? data.synonyms.join(', ') : '')
        updateDescription(node, description)
        
        // Send update notification for the main component
        emit('description-updated', { 
          description: description, 
          hasDescription: true,
          componentId: data.componentId
        })
        
        // Update variants if they exist and updateVariants flag is true
        if (data.updateVariants !== false) { // Default to true if not explicitly set to false
          // Find size variants in selection based on naming pattern
          const selection = figma.currentPage.selection
          let baseComponent = node
          let baseComponentName = ''
          let sizeVariants: SceneNode[] = []
          
          // If this is a size variant, try to find the base component
          if (node.name.includes('@')) {
            baseComponentName = node.name.split('@')[0].trim()            
            // Try to find base component or other size variants in selection
            for (const selectedNode of selection) {
              const nodeName = selectedNode.name.split('@')[0].trim()
              
              if (nodeName === baseComponentName) {
                if (!selectedNode.name.includes('@') && 
                    (selectedNode.type === 'COMPONENT' || selectedNode.type === 'COMPONENT_SET')) {
                  // This is the base component (no @ in name)
                  baseComponent = selectedNode
                }
                
                if (selectedNode.id !== node.id) {
                  // This is another variant of the same component
                  sizeVariants.push(selectedNode)
                }
              }
            }
          } 
          // If this is a base component, find all size variants
          else {
            baseComponentName = node.name.trim()
            
            // Find variants in selection that share the same base name
            for (const selectedNode of selection) {
              if (selectedNode.id === node.id) continue
              
              const nodeName = selectedNode.name.split('@')[0].trim()
              
              
              if (nodeName === baseComponentName && selectedNode.name.includes('@')) {
                sizeVariants.push(selectedNode)
              }
            }
          }
          
          // Update all found variants with the same description
          for (const variantNode of sizeVariants) {
            if (variantNode.type === 'COMPONENT' || variantNode.type === 'COMPONENT_SET') {
              updateDescription(variantNode, description)
              
              // Notify UI about the update
              emit('description-updated', { 
                description: description, 
                hasDescription: true,
                componentId: variantNode.id
              })
            }
          }
        }
        
        return
      }
      
      // No component ID specified, use the selection
      const selection = figma.currentPage.selection
      
      if (selection.length === 0) {
        emit('generate-error', { error: 'No component selected' })
        return
      }
      
      // We only allow batch mode, so update all selected components
      let hasUpdatedAny = false
      const description = data.description || data.rawDescription || (data.synonyms ? data.synonyms.join(', ') : '')
      
      for (const node of selection) {
        if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
          updateDescription(node, description)
          
          emit('description-updated', { 
            description: description, 
            hasDescription: true,
            componentId: node.id
          })
          
          hasUpdatedAny = true
        }
      }
      
      if (!hasUpdatedAny) {
        emit('generate-error', { error: 'No valid components to update' })
      }
    } catch (error: any) {
      console.error('Error updating description:', error)
      emit('generate-error', { error: error.message || 'Failed to update description' })
    }
  })

  // Handle UI events
  figma.on('selectionchange', () => {
    sendSelectionToUI()
  })

  // Handle zoom to component event
  on('zoom-to-component', async (data: { componentId: string }) => {
    try {
      const { componentId } = data
      const node = figma.getNodeById(componentId)
      
      if (!node || !('visible' in node)) {
        console.error('Invalid node or node not found:', componentId)
        return
      }
      
      // For instances, try to navigate to their component set or main component
      if (node.type === 'INSTANCE') {
        const instance = node as InstanceNode
        const mainComponent = instance.mainComponent
        
        if (mainComponent) {
          // If the main component has a parent that's a component set, zoom to that
          if (mainComponent.parent && mainComponent.parent.type === 'COMPONENT_SET') {
            figma.viewport.scrollAndZoomIntoView([mainComponent.parent])
            return
          }
          
          // Otherwise zoom to the main component
          figma.viewport.scrollAndZoomIntoView([mainComponent])
          return
        }
      }
      
      // For all other node types, just zoom to the node
      figma.viewport.scrollAndZoomIntoView([node])
      
    } catch (error) {
      console.error('Error zooming to component:', error)
    }
  })

  // Handle component image request
  on('get-component-image', async (data: { componentId: string }) => {
    try {
      const { componentId } = data
      const node = figma.getNodeById(componentId)
      
      if (!node || !('exportAsync' in node)) {
        console.error('Invalid node or node not found:', componentId)
        return
      }
      
      // Get the best node to export (use main component for instances)
      let nodeToExport: SceneNode = node as SceneNode
      
      // For instances, use the main component for better quality
      if (node.type === 'INSTANCE' && node.mainComponent) {
        nodeToExport = node.mainComponent
      }
      
      // Export the node as base64
      const imageBase64 = await exportNodeAsBase64(nodeToExport, { scale: 2 })
      
      // Send the image data back to the UI
      emit('image-response', { 
        imageData: imageBase64,
        componentId
      })
      
    } catch (error) {
      console.error('Error getting component image:', error)
    }
  })
} 