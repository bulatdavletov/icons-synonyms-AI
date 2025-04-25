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
        
        // Get description using our helper function that checks multiple sources
        let description = ""
        if (node.type === "INSTANCE" && node.mainComponent) {
          description = getNodeDescription(node.mainComponent)
        } else {
          description = getNodeDescription(node)
        }
        
        emit('selection-change', {
          name: node.name,
          type: node.type,
          description,
          hasDescription: description.trim() !== ""
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
        const synonymsText = data.synonyms.join(', ')
        console.log('Synonyms text to add:', synonymsText)
        
        // Get the current description using a different approach
        figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(() => {
          // Get current description using the original approach
          let currentDescription = ""
          
          if (selection.type === "COMPONENT") {
            currentDescription = (selection as ComponentNode).description || ""
          } else if (selection.type === "COMPONENT_SET") {
            currentDescription = (selection as ComponentSetNode).description || ""
          }
          
          console.log('Current description:', currentDescription)
          
          // Create new description by preserving existing and appending synonyms
          let newText = ""
          if (currentDescription.trim() === "") {
            // If no existing description, just use the synonyms
            newText = synonymsText
          } else {
            // If there's an existing description, append an empty line and then the synonyms
            newText = `${currentDescription}\n\n${synonymsText}`
          }
          
          console.log('New combined text:', newText)
          
          try {
            // APPROACH 1: Try the traditional approach first
            if (selection.type === "COMPONENT") {
              (selection as ComponentNode).description = newText
            } else {
              (selection as ComponentSetNode).description = newText
            }
            
            // APPROACH 2: Also store the description in relaunchData as backup
            // We'll use a custom key to store our description
            const relaunchData = {
              'custom-description': newText,
              'timestamp': Date.now().toString()
            }
            
            selection.setRelaunchData(relaunchData)
            
            // APPROACH 3: Also try updating via plugin data
            selection.setPluginData('custom-description', newText)
            
            // Force a refresh of Figma's UI to ensure our changes take effect
            const currentSelection = figma.currentPage.selection
            figma.currentPage.selection = []
            setTimeout(() => {
              figma.currentPage.selection = currentSelection
              
              // Check if the update was successful
              let updatedDescription = ""
              if (selection.type === "COMPONENT") {
                updatedDescription = (selection as ComponentNode).description
              } else {
                updatedDescription = (selection as ComponentSetNode).description
              }
              
              console.log('Updated description:', updatedDescription)
              
              // Check if we need a fallback
              if (updatedDescription !== newText) {
                console.warn('Description did not update correctly, using relaunchData approach')
                figma.notify('Using alternative method to update description')
                
                // Update UI with the data we stored in relaunchData
                emit('description-updated', {
                  description: newText, // Use what we tried to set
                  hasDescription: true
                })
              } else {
                // Success case - description updated correctly
                emit('description-updated', {
                  description: updatedDescription,
                  hasDescription: true
                })
              }
              
              figma.notify('Description updated successfully!')
            }, 100)
          } catch (error) {
            console.error('Error updating description:', error)
            figma.notify('Error updating description', { error: true })
            
            // Try fallback approach
            try {
              const fallbackDescription = currentDescription + "\n\n" + synonymsText
              selection.setPluginData('custom-description', fallbackDescription)
              selection.setRelaunchData({ 'custom-description': fallbackDescription })
              
              emit('description-updated', {
                description: fallbackDescription,
                hasDescription: true
              })
              
              figma.notify('Used fallback approach to update description')
            } catch (fallbackError) {
              console.error('Fallback approach failed:', fallbackError)
              emit('generate-error', {
                error: 'Failed to update description: ' + (error as Error).message
              })
            }
          }
        }).catch(error => {
          console.error('Error loading font:', error)
          figma.notify('Error loading font', { error: true })
          emit('generate-error', {
            error: 'Failed to load font: ' + (error as Error).message
          })
        })
      } catch (error: any) {
        console.error('Error in update-description handler:', error)
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

  // Function to read description (for future use)
  function getNodeDescription(node: SceneNode): string {
    // Try to get native description
    let description = ""
    if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
      description = (node as any).description || ""
    }
    
    // Check if we have a custom description stored
    const customDescription = node.getPluginData('custom-description')
    if (customDescription && customDescription.length > 0) {
      // Prefer the custom description if available
      return customDescription
    }
    
    return description
  }

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

