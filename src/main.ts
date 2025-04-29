import { emit, on, showUI } from '@create-figma-plugin/utilities'
import { exportNodeAsBase64, getBestNodeToExport } from './utils/icon-exporter'
import { generateSynonyms } from './services/ai-service'
import { Handler } from './types/index'
import { DEFAULT_SYSTEM_MESSAGE, DEFAULT_USER_PROMPT } from '../prompt'

const STORAGE_KEY = 'openai-api-key'
const SYSTEM_MESSAGE_KEY = 'icon-synonyms-system-message'
const USER_PROMPT_KEY = 'icon-synonyms-user-prompt'

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
        
        emit('selection-change', {
          name: node.name,
          type: node.type,
          description,
          hasDescription
        })
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
      
      // No longer showing notification here
      
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
      
      // Removed notification here - no longer showing Figma notification
    } catch (error: any) {
      console.error('Error in generate-synonyms handler:', error)
      emit('generate-error', {
        error: error.message || 'Unknown error occurred'
      })
      // Still show error notification for better user experience
      figma.notify("Error generating synonyms")
    }
  })

  // Add this function somewhere in the main.ts file
  function updateComponentDescription(newSynonyms: string): boolean {
    
    const selection = figma.currentPage.selection[0];
    if (!selection) {
      console.error('No selection found');
      return false;
    }
    
    if (selection.type !== 'COMPONENT' && selection.type !== 'COMPONENT_SET') {
      console.error('Selected node is not a component or component set');
      return false;
    }
    
    try {
      // Get the existing description
      let existingDescription = "";
      if (selection.type === 'COMPONENT') {
        existingDescription = (selection as ComponentNode).description || "";
      } else {
        existingDescription = (selection as ComponentSetNode).description || "";
      }
      
      // Create the new description by preserving existing and appending new synonyms
      let fullDescription = "";
      if (existingDescription.trim() === "") {
        // If no existing description, just use the new synonyms
        fullDescription = newSynonyms;
      } else {
        // If there's an existing description, append an empty line and the new synonyms
        fullDescription = `${existingDescription}\n\n${newSynonyms}`;
      }
      
      // Type assertion to access description property
      if (selection.type === 'COMPONENT') {
        (selection as ComponentNode).description = fullDescription;
      } else {
        (selection as ComponentSetNode).description = fullDescription;
      }
      
      // Force a UI update
      const currentSelection = figma.currentPage.selection;
      figma.currentPage.selection = [];
      figma.currentPage.selection = currentSelection;
      
      return true;
    } catch (error) {
      console.error('Error setting description:', error);
      return false;
    }
  }

  // Then update the 'update-description' handler:
  on('update-description', (data: { synonyms: string[] }) => {
    
    // Join synonyms
    const synonymsText = data.synonyms.join(', ');
    const success = updateComponentDescription(synonymsText);
    
    if (success) {
      // Get the final description after update
      const selection = figma.currentPage.selection[0];
      let finalDescription = "";
      
      if (selection) {
        if (selection.type === 'COMPONENT') {
          finalDescription = (selection as ComponentNode).description || "";
        } else if (selection.type === 'COMPONENT_SET') {
          finalDescription = (selection as ComponentSetNode).description || "";
        }
      }
      
      // Notify UI about the update with the complete final description
      emit('description-updated', {
        description: finalDescription,
        hasDescription: true
      });
    } else {
      emit('generate-error', {
        error: 'Failed to update component description'
      });
    }
  });

  // Initialize
  figma.on('selectionchange', sendSelectionToUI)
  
  // Initial state
  sendSelectionToUI()
} 