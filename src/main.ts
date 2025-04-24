import { emit, on, showUI } from '@create-figma-plugin/utilities'
import { exportNodeAsBase64, getBestNodeToExport } from './utils/icon-exporter'
import { generateSynonyms } from './services/ai-service'
import { Handler } from './types/index'

const STORAGE_KEY = 'openai-api-key'

/**
 * Groups synonyms by category
 * @param synonyms Array of category-prefixed synonym strings
 * @returns Grouped synonyms by category
 */
function groupSynonymsByCategory(synonyms: string[]) {
  return [
    {
      title: 'Usage',
      synonyms: synonyms
        .filter(s => s.toLowerCase().startsWith('usage:'))
        .map(s => s.replace(/^usage:\s*/i, '').trim())
    },
    {
      title: 'Object',
      synonyms: synonyms
        .filter(s => s.toLowerCase().startsWith('object:'))
        .map(s => s.replace(/^object:\s*/i, '').trim())
        .flatMap(s => s.split(',').map(term => term.trim()))
        .filter(s => s.length > 0)
    },
    {
      title: 'Modificator',
      synonyms: synonyms
        .filter(s => s.toLowerCase().startsWith('modificator:'))
        .map(s => s.replace(/^modificator:\s*/i, '').trim())
        .flatMap(s => s.split(',').map(term => term.trim()))
        .filter(s => s.length > 0)
    },
    {
      title: 'Shapes',
      synonyms: synonyms
        .filter(s => s.toLowerCase().startsWith('shapes:'))
        .map(s => s.replace(/^shapes:\s*/i, '').trim())
        .flatMap(s => s.split(',').map(term => term.trim()))
        .filter(s => s.length > 0)
    }
  ].filter(group => group.synonyms.length > 0) // Only include groups with synonyms
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
      
      // Group synonyms by category
      const groups = groupSynonymsByCategory(result.synonyms)
      
      console.log('Grouped synonyms:', groups)
      
      emit('synonyms-generated', { groups })
      
      figma.notify("Synonyms generated successfully!")
    } catch (error: any) {
      console.error('Error in generate-synonyms handler:', error)
      emit('generate-error', {
        error: error.message || 'Unknown error occurred'
      })
      figma.notify("Error generating synonyms")
    }
  })

  on('update-description', (data: { synonyms: string[] }) => {
    const selection = figma.currentPage.selection[0]
    if (selection && (selection.type === "COMPONENT" || selection.type === "COMPONENT_SET")) {
      try {
        const existingDescription = selection.description || ''
        
        // Group synonyms by category using the helper function
        const synonymsByCategory = {
          usage: data.synonyms.filter(s => s.toLowerCase().startsWith('usage:'))
            .map(s => s.replace(/^usage:\s*/i, '').trim()),
          object: data.synonyms.filter(s => s.toLowerCase().startsWith('object:'))
            .map(s => s.replace(/^object:\s*/i, '').trim()),
          modificator: data.synonyms.filter(s => s.toLowerCase().startsWith('modificator:'))
            .map(s => s.replace(/^modificator:\s*/i, '').trim()),
          shapes: data.synonyms.filter(s => s.toLowerCase().startsWith('shapes:'))
            .map(s => s.replace(/^shapes:\s*/i, '').trim())
        }

        // Build the new description lines
        const newLines = []
        if (synonymsByCategory.usage.length > 0) newLines.push(`Usage: ${synonymsByCategory.usage.join(', ')}`)
        if (synonymsByCategory.object.length > 0) newLines.push(`Object: ${synonymsByCategory.object.join(', ')}`)
        if (synonymsByCategory.modificator.length > 0) newLines.push(`Modificator: ${synonymsByCategory.modificator.join(', ')}`)
        if (synonymsByCategory.shapes.length > 0) newLines.push(`Shapes: ${synonymsByCategory.shapes.join(', ')}`)
        
        // Add the new description to the component
        selection.description = newLines.join('\n')
        
        // Notify the UI that the description was updated
        emit('description-updated', {
          description: selection.description,
          hasDescription: Boolean(selection.description)
        })
        
        figma.notify('Description updated successfully!')
      } catch (error: any) {
        console.error('Error updating description:', error)
        emit('generate-error', { 
          error: error.message || 'Failed to update description'
        })
      }
    } else {
      emit('generate-error', { 
        error: 'No component selected'
      })
    }
  })

  // Initialize
  figma.on('selectionchange', sendSelectionToUI)
  
  // Initial state
  sendSelectionToUI()
} 