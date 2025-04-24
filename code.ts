import { emit, on, showUI } from '@create-figma-plugin/utilities'
import { exportNodeAsBase64, getBestNodeToExport } from './src/icon-exporter'
import { generateSynonyms } from './src/ai-service'
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
        
        emit('SELECTION_CHANGE', {
          name: node.name,
          type: node.type,
          description,
          hasDescription
        })
      }
    }
  }

  // Handle messages from the UI
  on('GENERATE_SYNONYMS', async () => {
    try {
      // Show loading state
      figma.notify("Generating synonyms...")
      
      // Get the current selection
      const selection = figma.currentPage.selection
      
      // Find the best node to export
      const nodeToExport = getBestNodeToExport(selection)
      
      if (!nodeToExport) {
        emit('GENERATE_ERROR', {
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
      
      // Group synonyms by category
      const groups = [
        {
          title: 'Objects',
          synonyms: result.synonyms.filter(s => s.startsWith('object:'))
        },
        {
          title: 'Actions',
          synonyms: result.synonyms.filter(s => s.startsWith('action:'))
        },
        {
          title: 'Visual',
          synonyms: result.synonyms.filter(s => s.startsWith('visual:'))
        }
      ]
      
      emit('SYNONYMS_GENERATED', { groups })
      
      figma.notify("Synonyms generated successfully!")
    } catch (error: any) {
      console.error('Error in generate-synonyms handler:', error)
      emit('GENERATE_ERROR', {
        error: error.message || 'Unknown error occurred'
      })
      figma.notify("Error generating synonyms")
    }
  })

  on('UPDATE_DESCRIPTION', (data: { synonyms: string[] }) => {
    const selection = figma.currentPage.selection[0]
    if (selection && (selection.type === "COMPONENT" || selection.type === "COMPONENT_SET")) {
      try {
        selection.description = data.synonyms.join(', ')
        figma.notify('Description updated successfully!')
      } catch (error: any) {
        emit('GENERATE_ERROR', {
          error: 'Failed to update description: ' + error.message
        })
      }
    }
  })

  // Request UI to check for selection on startup
  on('UI_READY', () => {
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
