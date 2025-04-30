import { emit, on, showUI } from '@create-figma-plugin/utilities'
import { exportNodeAsBase64, getBestNodeToExport } from './utils/icon-exporter'
import { generateSynonyms } from './services/ai-service'
import { ComponentInfo, Handler } from './types/index'
import { DEFAULT_SYSTEM_MESSAGE, DEFAULT_USER_PROMPT } from '../prompt'

const STORAGE_KEY = 'openai-api-key'
const SYSTEM_MESSAGE_KEY = 'icon-synonyms-system-message'
const USER_PROMPT_KEY = 'icon-synonyms-user-prompt'

// Keep track of whether we're in batch mode
let isBatchMode = false

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
    height: 500
  })

  function updateDescription(node: ComponentNode | ComponentSetNode, description: string) {
    node.description = description
  }

  // Function to send current selection to UI
  function sendSelectionToUI() {
    const selection = figma.currentPage.selection
    
    if (selection.length === 1) {
      // Single selection mode
      const node = selection[0]
      
      if (node.type === "COMPONENT" || node.type === "COMPONENT_SET" || node.type === "INSTANCE") {
        const hasDescription = Boolean(
          node.type === "INSTANCE" 
            ? node.mainComponent?.description 
            : node.description
        )
        
        const description = node.type === "INSTANCE"
          ? node.mainComponent?.description || ""
          : node.description || ""
        
        const componentInfo: ComponentInfo = {
          id: node.id,
          name: node.name,
          type: node.type,
          description,
          hasDescription
        }
        
        emit('selection-change', componentInfo)
        isBatchMode = false
      }
    } else if (selection.length > 1) {
      // Batch selection mode
      const components: ComponentInfo[] = []
      
      // Process each selected node
      selection.forEach(node => {
        if (node.type === "COMPONENT" || node.type === "COMPONENT_SET" || node.type === "INSTANCE") {
          const hasDescription = Boolean(
            node.type === "INSTANCE" 
              ? node.mainComponent?.description 
              : node.description
          )
          
          const description = node.type === "INSTANCE"
            ? node.mainComponent?.description || ""
            : node.description || ""
          
          const componentInfo: ComponentInfo = {
            id: node.id,
            name: node.name,
            type: node.type,
            description,
            hasDescription
          }
          
          components.push(componentInfo)
        }
      })
      
      if (components.length > 0) {
        emit('batch-selection-change', components)
        isBatchMode = true
      }
    }
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
      const systemMessage = await figma.clientStorage.getAsync(SYSTEM_MESSAGE_KEY) || DEFAULT_SYSTEM_MESSAGE
      const userPrompt = await figma.clientStorage.getAsync(USER_PROMPT_KEY) || DEFAULT_USER_PROMPT
      
      emit('prompt-templates-response', { 
        systemMessage, 
        userPrompt,
        isDefault: systemMessage === DEFAULT_SYSTEM_MESSAGE && userPrompt === DEFAULT_USER_PROMPT
      })
    } catch (error) {
      console.error('Error retrieving prompt templates:', error)
      emit('prompt-templates-response', { 
        systemMessage: DEFAULT_SYSTEM_MESSAGE, 
        userPrompt: DEFAULT_USER_PROMPT,
        isDefault: true
      })
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
      // Reset to default templates
      await figma.clientStorage.setAsync(SYSTEM_MESSAGE_KEY, DEFAULT_SYSTEM_MESSAGE)
      await figma.clientStorage.setAsync(USER_PROMPT_KEY, DEFAULT_USER_PROMPT)
      
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
      
      if (node.type === 'COMPONENT') {
        description = node.description || ''
      } else if (node.type === 'INSTANCE' && node.mainComponent) {
        description = node.mainComponent.description || ''
      } else if (node.type === 'COMPONENT_SET') {
        // For component sets, we can use the description directly
        description = node.description || ''
      }
      
      // Generate synonyms using the AI service
      const result = await generateSynonyms({
        name,
        imageBase64,
        existingDescription: description,
        apiKey
      })
      
      if (result.error) {
        emit('generate-error', { 
          error: result.error,
          componentId: nodeId 
        })
        return
      }
      
      // Process synonyms into a flat list
      const synonymsList = processSynonyms(result.synonyms)
      
      // Emit the synonyms with the component ID
      emit('synonyms-generated', { 
        synonyms: synonymsList,
        componentId: nodeId
      })
      
    } catch (error: any) {
      console.error('Error processing component:', error)
      emit('generate-error', {
        error: error.message || 'Unknown error occurred',
        componentId: nodeId
      })
    }
  }

  // Handle messages from the UI
  on('generate-synonyms', async () => {
    try {
      // Get API key from storage
      const apiKey = await figma.clientStorage.getAsync(STORAGE_KEY)
      
      if (!apiKey) {
        emit('generate-error', {
          error: 'API key not found. Please set your OpenAI API key in the Settings tab.'
        })
        return
      }
      
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
      
      // Generate synonyms using the AI service
      const result = await generateSynonyms({
        name,
        imageBase64,
        existingDescription: description,
        apiKey
      })
      
      if (result.error) {
        emit('generate-error', { error: result.error })
        return
      }
      
      // Process synonyms into a flat list
      const synonymsList = processSynonyms(result.synonyms)
      
      emit('synonyms-generated', { synonyms: synonymsList })
      
    } catch (error: any) {
      console.error('Error in generate-synonyms handler:', error)
      emit('generate-error', {
        error: error.message || 'Unknown error occurred'
      })
      figma.notify("Error generating synonyms")
    }
  })

  // Handle batch generation of synonyms
  on('generate-batch-synonyms', async (componentIds: string[]) => {
    try {
      // Process components sequentially to avoid rate limiting issues
      for (const componentId of componentIds) {
        await processSingleComponent(componentId)
      }
    } catch (error: any) {
      console.error('Error in batch-generate-synonyms handler:', error)
      emit('generate-error', {
        error: error.message || 'Unknown error occurred during batch processing'
      })
    }
  })

  // Then update the 'update-description' handler:
  on('update-description', (data: { 
    synonyms?: string[], 
    rawDescription?: string, 
    isManualEdit?: boolean,
    componentId?: string 
  }) => {
    try {
      if (data.componentId) {
        // Batch mode: Update a specific component
        const node = figma.getNodeById(data.componentId)
        
        if (!node || (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET')) {
          console.error('Node not found or not a component/component set')
          return
        }
        
        let newDescription: string
        
        if (data.rawDescription) {
          // If raw description is provided, use it directly
          newDescription = data.rawDescription
        } else if (data.synonyms && data.synonyms.length > 0) {
          // Otherwise, use synonyms if available
          newDescription = data.synonyms.join(', ')
        } else {
          // No valid description data
          return
        }
        
        // Update the node description
        updateDescription(node, newDescription)
        
        // Let the UI know the description was updated
        emit('description-updated', {
          description: newDescription,
          hasDescription: true,
          componentId: data.componentId
        })
      } else {
        // Single mode: Use the current selection
        // For backward compatibility with the original implementatio
        updateComponentDescription(
          data.rawDescription || (data.synonyms ? data.synonyms.join(', ') : ''),
          !!data.isManualEdit
        )
      }
    } catch (error: any) {
      console.error('Error updating description:', error)
    }
  })

  function updateComponentDescription(newSynonyms: string, isManualEdit: boolean = false): boolean {
    const selection = figma.currentPage.selection
    
    if (selection.length !== 1) {
      return false
    }
    
    const node = selection[0]
    
    if (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET' && node.type !== 'INSTANCE') {
      return false
    }
    
    let targetNode: ComponentNode | ComponentSetNode | null = null
    
    if (node.type === 'INSTANCE' && node.mainComponent) {
      targetNode = node.mainComponent
    } else if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      targetNode = node
    }
    
    if (!targetNode) {
      return false
    }
    
    // Update the description
    targetNode.description = newSynonyms
    
    // Emit an event to notify the UI that the description was updated
    emit('description-updated', {
      description: newSynonyms,
      hasDescription: true
    })
    
    return true
  }

  // Initial send of selection to UI
  sendSelectionToUI()

  // Listen for selection changes in Figma
  figma.on('selectionchange', () => {
    sendSelectionToUI()
  })
} 