import { emit, on, showUI } from '@create-figma-plugin/utilities'
import { exportNodeAsBase64, getBestNodeToExport } from './utils/icon-exporter'
import { generateSynonyms } from './services/ai-service'
import { Handler } from './types/index'

const STORAGE_KEY = 'openai-api-key'

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
      // Get the content after the colon
      const content = line.substring(colonIndex + 1).trim();
      
      // Split by commas if present and add each term
      if (content.includes(',')) {
        const terms = content.split(',').map(term => term.trim()).filter(term => term.length > 0);
        processedSynonyms.push(...terms);
      } else if (content.length > 0) {
        // Add the whole content if no commas and not empty
        processedSynonyms.push(content);
      }
    }
  }
  
  // Remove duplicates and return
  return Array.from(new Set(processedSynonyms));
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
      
      console.log('Raw synonyms from AI:', result.synonyms)
      
      // Process synonyms into a flat list
      const synonymsList = processSynonyms(result.synonyms)
      
      console.log('Processed synonyms:', synonymsList)
      
      emit('synonyms-generated', { synonyms: synonymsList })
      
      figma.notify("Synonyms generated successfully!")
    } catch (error: any) {
      console.error('Error in generate-synonyms handler:', error)
      emit('generate-error', {
        error: error.message || 'Unknown error occurred'
      })
      figma.notify("Error generating synonyms")
    }
  })

  // Add this function somewhere in the main.ts file
  function updateComponentDescription(newDescription: string): boolean {
    console.log('Direct function call to update component description:', newDescription);
    
    const selection = figma.currentPage.selection[0];
    if (!selection) {
      console.error('No selection found');
      return false;
    }
    
    console.log('Selected node:', {
      id: selection.id,
      name: selection.name,
      type: selection.type
    });
    
    if (selection.type !== 'COMPONENT' && selection.type !== 'COMPONENT_SET') {
      console.error('Selected node is not a component or component set');
      return false;
    }
    
    try {
      // Type assertion to access description property
      if (selection.type === 'COMPONENT') {
        (selection as ComponentNode).description = newDescription;
      } else {
        (selection as ComponentSetNode).description = newDescription;
      }
      
      console.log('Description set successfully');
      
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
    console.log('Received update-description event');
    
    // Join synonyms and update description
    const newDescription = data.synonyms.join(', ');
    const success = updateComponentDescription(newDescription);
    
    if (success) {
      // Notify UI about the update
      emit('description-updated', {
        description: newDescription,
        hasDescription: true
      });
      figma.notify('Description updated successfully!');
    } else {
      emit('generate-error', {
        error: 'Failed to update component description'
      });
      figma.notify('Failed to update description');
    }
  });

  // Initialize
  figma.on('selectionchange', sendSelectionToUI)
  
  // Initial state
  sendSelectionToUI()
} 