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

  function updateDescription(node: ComponentNode | ComponentSetNode, description: string) {
    node.description = description
  }

  // Function to send current selection to UI
  function sendSelectionToUI() {
    const selection = figma.currentPage.selection
    
    // Process selection as batch
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
    description?: string
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
        
        emit('description-updated', { 
          description: description, 
          hasDescription: true,
          componentId: data.componentId
        })
        
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

  // Send initial selection to UI
  sendSelectionToUI()
} 