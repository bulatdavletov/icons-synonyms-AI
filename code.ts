import { emit, on, showUI } from '@create-figma-plugin/utilities'
import { exportNodeAsBase64, getBestNodeToExport } from './src/utils/icon-exporter'
import { generateSynonyms } from './src/services/ai-service'
import { Handler } from './src/types'

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
        apiKey: ''  // This will use the hardcoded API key in the service
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

  on('update-description', (data: { synonyms: string[] }) => {
    const selection = figma.currentPage.selection[0]
    
    if (selection && (selection.type === "COMPONENT" || selection.type === "COMPONENT_SET")) {
      try {
        // Join all synonyms without separating by groups
        const newDescription = data.synonyms.join(', ')
        
        // Basic approach - directly set the description
        if (selection.type === "COMPONENT") {
          const component = selection as ComponentNode;
          component.description = newDescription;
        } else if (selection.type === "COMPONENT_SET") {
          const componentSet = selection as ComponentSetNode;
          componentSet.description = newDescription;
        }
        
        // Try to force a UI update by modifying a non-visible property
        selection.setRelaunchData({ description: newDescription });
        
        // Try to update the selection to force a refresh
        const currentSelection = figma.currentPage.selection;
        figma.currentPage.selection = [];
        setTimeout(() => {
          figma.currentPage.selection = currentSelection;
        }, 100);
        
        // Notify UI about the updated description
        emit('description-updated', {
          description: newDescription,
          hasDescription: true
        })
        
        figma.notify('Description updated successfully!')
      } catch (error: any) {
        console.error('Error updating description:', error);
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
