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
    width: 360,
    height: 450
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
    
    console.log('Selection:', selection.map(node => ({ id: node.id, name: node.name, type: node.type })))
    
    // Process selection as batch
    const components: ComponentInfo[] = []
    const componentsMap = new Map<string, ComponentInfo>()
    const variantsMap = new Map<string, ComponentInfo[]>()
    
    // First pass: process each selected node and identify base components and variants
    selection.forEach(node => {
      if (node.type === "COMPONENT" || node.type === "COMPONENT_SET" || node.type === "INSTANCE") {
        console.log(`Processing ${node.type}:`, { 
          id: node.id, 
          name: node.name,
          hasMainComponent: node.type === 'INSTANCE' && node.mainComponent != null,
          mainComponentId: node.type === 'INSTANCE' ? node.mainComponent?.id : undefined,
          mainComponentDescription: node.type === 'INSTANCE' ? node.mainComponent?.description : undefined
        })

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
        
        console.log('Processing node details:', { 
          id: node.id, 
          name: node.name, 
          originalName,
          normalizedName,
          hasVariant, 
          sizeInfo,
          description,
          hasDescription
        })
        
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
            console.log('Instance has component set parent:', {
              instanceId: node.id,
              mainComponentId: node.mainComponent.id,
              componentSetId: node.mainComponent.parent.id
            })
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
      console.log(`Group "${normalizedName}" has ${variants.length} variants:`, 
        variants.map(v => ({ id: v.id, name: v.name, isBase: v.isBaseComponent }))
      )
      
      // Find the base component (without @) if it exists
      const baseComponent = variants.find(comp => comp.isBaseComponent)
      
      if (baseComponent) {
        // This is the base component, add all its variants
        const otherVariants = variants.filter(comp => comp.id !== baseComponent.id)
        baseComponent.sizeVariants = otherVariants
        
        console.log(`Found base component for "${normalizedName}":`, 
          { id: baseComponent.id, name: baseComponent.name, variantsCount: otherVariants.length }
        )
        
        // Add only the base component to the components list
        components.push(baseComponent)
      } else {
        console.log(`No base component found for "${normalizedName}", adding all variants individually`)
        
        // No base component, just add all variants individually
        variants.forEach(variant => {
          components.push(variant)
        })
      }
    })
    
    console.log('Final component list:', components.map(c => ({ 
      id: c.id, 
      name: c.name, 
      hasVariants: Boolean(c.sizeVariants && c.sizeVariants.length > 0),
      variantCount: c.sizeVariants?.length || 0
    })))
    
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
        
        console.log('Updating description for component:', { 
          id: node.id, 
          name: node.name, 
          description 
        })
        
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
          
          console.log('Current selection for variant updates:', 
            selection.map(n => ({ id: n.id, name: n.name }))
          )
          
          // If this is a size variant, try to find the base component
          if (node.name.includes('@')) {
            baseComponentName = node.name.split('@')[0].trim()
            console.log(`Node "${node.name}" is a size variant, base name: "${baseComponentName}"`)
            
            // Try to find base component or other size variants in selection
            for (const selectedNode of selection) {
              const nodeName = selectedNode.name.split('@')[0].trim()
              
              console.log(`Checking node "${selectedNode.name}" against base "${baseComponentName}"`, { 
                matches: nodeName === baseComponentName,
                hasAtSign: selectedNode.name.includes('@'),
                isBaseComponent: !selectedNode.name.includes('@') && nodeName === baseComponentName
              })
              
              if (nodeName === baseComponentName) {
                if (!selectedNode.name.includes('@') && 
                    (selectedNode.type === 'COMPONENT' || selectedNode.type === 'COMPONENT_SET')) {
                  // This is the base component (no @ in name)
                  baseComponent = selectedNode
                  console.log('Found base component:', { id: selectedNode.id, name: selectedNode.name })
                }
                
                if (selectedNode.id !== node.id) {
                  // This is another variant of the same component
                  sizeVariants.push(selectedNode)
                  console.log('Found size variant:', { id: selectedNode.id, name: selectedNode.name })
                }
              }
            }
          } 
          // If this is a base component, find all size variants
          else {
            baseComponentName = node.name.trim()
            console.log(`Node "${node.name}" is a base component`)
            
            // Find variants in selection that share the same base name
            for (const selectedNode of selection) {
              if (selectedNode.id === node.id) continue
              
              const nodeName = selectedNode.name.split('@')[0].trim()
              
              console.log(`Checking node "${selectedNode.name}" against base "${baseComponentName}"`, { 
                matches: nodeName === baseComponentName,
                hasAtSign: selectedNode.name.includes('@'),
                isVariant: nodeName === baseComponentName && selectedNode.name.includes('@')
              })
              
              if (nodeName === baseComponentName && selectedNode.name.includes('@')) {
                sizeVariants.push(selectedNode)
                console.log('Found size variant:', { id: selectedNode.id, name: selectedNode.name })
              }
            }
          }
          
          console.log(`Found ${sizeVariants.length} variants for ${baseComponentName}`)
          
          // Update all found variants with the same description
          for (const variantNode of sizeVariants) {
            if (variantNode.type === 'COMPONENT' || variantNode.type === 'COMPONENT_SET') {
              updateDescription(variantNode, description)
              console.log('Updating variant description:', { id: variantNode.id, name: variantNode.name })
              
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
      
      console.log('Zooming to component:', { 
        id: componentId, 
        name: node.name, 
        type: node.type 
      })
      
      // For instances, try to navigate to their component set or main component
      if (node.type === 'INSTANCE') {
        const instance = node as InstanceNode
        const mainComponent = instance.mainComponent
        
        if (mainComponent) {
          // If the main component has a parent that's a component set, zoom to that
          if (mainComponent.parent && mainComponent.parent.type === 'COMPONENT_SET') {
            console.log('Zooming to component set:', {
              fromInstance: node.id,
              mainComponent: mainComponent.id,
              componentSet: mainComponent.parent.id
            })
            figma.viewport.scrollAndZoomIntoView([mainComponent.parent])
            return
          }
          
          // Otherwise zoom to the main component
          console.log('Zooming to main component:', {
            fromInstance: node.id,
            mainComponent: mainComponent.id
          })
          figma.viewport.scrollAndZoomIntoView([mainComponent])
          return
        }
      }
      
      // For all other node types, just zoom to the node
      figma.viewport.scrollAndZoomIntoView([node])
      
      console.log('Zoomed to component:', { id: componentId, name: node.name })
    } catch (error) {
      console.error('Error zooming to component:', error)
    }
  })
} 