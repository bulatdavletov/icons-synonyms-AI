import { emit, on, showUI } from '@create-figma-plugin/utilities'
import { exportNodeAsBase64, getBestNodeToExport } from './icon-exporter'
import { generateSynonyms } from './ai-service'
import { Handler } from './types'

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
        existingDescription: description
      })
      
      console.log('Raw synonyms from AI:', result.synonyms)
      
      // Group synonyms by category according to Answer Structure
      const groups = [
        {
          title: 'Usage',
          synonyms: result.synonyms
            .filter(s => s.toLowerCase().startsWith('usage:'))
            .map(s => s.replace(/^usage:\s*/i, '').trim())
        },
        {
          title: 'Object',
          synonyms: result.synonyms
            .filter(s => s.toLowerCase().startsWith('object:'))
            .map(s => s.replace(/^object:\s*/i, '').trim())
            .flatMap(s => s.split(',').map(term => term.trim()))
            .filter(s => s.length > 0)
        },
        {
          title: 'Modificator',
          synonyms: result.synonyms
            .filter(s => s.toLowerCase().startsWith('modificator:'))
            .map(s => s.replace(/^modificator:\s*/i, '').trim())
            .flatMap(s => s.split(',').map(term => term.trim()))
            .filter(s => s.length > 0)
        },
        {
          title: 'Shapes',
          synonyms: result.synonyms
            .filter(s => s.toLowerCase().startsWith('shapes:'))
            .map(s => s.replace(/^shapes:\s*/i, '').trim())
            .flatMap(s => s.split(',').map(term => term.trim()))
            .filter(s => s.length > 0)
        }
      ].filter(group => group.synonyms.length > 0) // Only include groups with synonyms
      
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
        
        // Group synonyms by category
        const usageTerms = data.synonyms.filter(s => s.toLowerCase().startsWith('usage:'))
          .map(s => s.replace(/^usage:\s*/i, '').trim())
        const objectTerms = data.synonyms.filter(s => s.toLowerCase().startsWith('object:'))
          .map(s => s.replace(/^object:\s*/i, '').trim())
        const modificatorTerms = data.synonyms.filter(s => s.toLowerCase().startsWith('modificator:'))
          .map(s => s.replace(/^modificator:\s*/i, '').trim())
        const shapeTerms = data.synonyms.filter(s => s.toLowerCase().startsWith('shapes:'))
          .map(s => s.replace(/^shapes:\s*/i, '').trim())

        // Build the new description lines
        const newLines = []
        if (usageTerms.length > 0) newLines.push(`Usage: ${usageTerms.join(', ')}`)
        if (objectTerms.length > 0) newLines.push(`Object: ${objectTerms.join(', ')}`)
        if (modificatorTerms.length > 0) newLines.push(`Modificator: ${modificatorTerms.join(', ')}`)
        if (shapeTerms.length > 0) newLines.push(`Shapes: ${shapeTerms.join(', ')}`)
        
        // Combine existing description with new lines
        const newDescription = existingDescription
          ? `${existingDescription}\n${newLines.join('\n')}`
          : newLines.join('\n')
        
        selection.description = newDescription
        figma.notify('Description updated successfully!')
      } catch (error: any) {
        emit('generate-error', {
          error: 'Failed to update description: ' + error.message
        })
      }
    }
  })

  // Listen for selection changes
  figma.on("selectionchange", () => {
    sendSelectionToUI()
  })

  // Initial selection check
  sendSelectionToUI()
} 