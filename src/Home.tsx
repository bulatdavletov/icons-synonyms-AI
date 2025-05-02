import { h, Fragment } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { Text, VerticalSpace, Button, Textbox, IconInteractive24, Divider, Stack, LoadingIndicator, IconButton, IconSettingsSmall24 } from '@create-figma-plugin/ui'
import { ComponentCard } from './ComponentCard'
import type { ComponentInfo, ComponentWithSynonyms, ComponentsMap } from './types'

interface HomeProps {
  onSettingsClick: () => void
}

export function Home({ onSettingsClick }: HomeProps) {
  const [components, setComponents] = useState<ComponentWithSynonyms[]>([])
  const [componentsMap, setComponentsMap] = useState<ComponentsMap>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Handle selection and component data management
  useEffect(() => {
    // Listen for selection changes
    const handleSelectionChange = (data: ComponentInfo[]) => {
      if (!data || data.length === 0) {
        // Clear the component state when no selection
        setComponentsMap(new Map())
        setComponents([])
        return
      }

      // Create component map from selection data
      const newComponentsMap = new Map<string, ComponentWithSynonyms>()
      
      // Process each component in the selection
      data.forEach(component => {
        // Check if we already have this component in our map
        const existingComponent = componentsMap.get(component.id)
        
        if (existingComponent) {
          // Update the existing component with new data while preserving state
          newComponentsMap.set(component.id, {
            ...existingComponent,
            name: component.name,
            type: component.type,
            description: component.description,
            hasDescription: component.hasDescription
          })
        } else {
          // Add new component to the map
          newComponentsMap.set(component.id, {
            ...component,
            synonyms: []
          })
        }
      })
      
      // Update state with new components map
      setComponentsMap(newComponentsMap)
      
      // Convert map to array for rendering
      setComponents(Array.from(newComponentsMap.values()))
      
      setIsInitialized(true)
    }

    // Listen for generated synonyms for a specific component
    const handleSynonymsGenerated = (data: { synonyms: string[], componentId?: string }) => {
      if (!data.componentId) return

      const componentId = data.componentId as string;
      
      // Update the component with the generated synonyms
      setComponentsMap(prev => {
        const newMap = new Map(prev)
        const component = newMap.get(componentId)
        
        if (component) {
          newMap.set(componentId, {
            ...component,
            synonyms: data.synonyms,
            isLoading: false
          })
        }
        
        return newMap
      })
      
      // Update the components array
      setComponents(prev => 
        prev.map(component => 
          component.id === componentId
            ? { ...component, synonyms: data.synonyms, isLoading: false }
            : component
        )
      )
    }

    // Listen for generation errors
    const handleGenerationError = (data: { error: string, componentId?: string }) => {
      if (!data.componentId) {
        setError(data.error)
        return
      }

      const componentId = data.componentId as string;
      
      // Update the component with the error
      setComponentsMap(prev => {
        const newMap = new Map(prev)
        const component = newMap.get(componentId)
        
        if (component) {
          newMap.set(componentId, {
            ...component,
            isError: true,
            errorMessage: data.error,
            isLoading: false
          })
        }
        
        return newMap
      })
      
      // Update the components array
      setComponents(prev => 
        prev.map(component => 
          component.id === componentId
            ? { ...component, isError: true, errorMessage: data.error, isLoading: false }
            : component
        )
      )
    }

    // Listen for description updates
    const handleDescriptionUpdated = (data: { description: string, hasDescription: boolean, componentId?: string }) => {
      if (!data.componentId) return

      const componentId = data.componentId as string;
      
      // Update the component with the new description
      setComponentsMap(prev => {
        const newMap = new Map(prev)
        const component = newMap.get(componentId)
        
        if (component) {
          newMap.set(componentId, {
            ...component,
            description: data.description,
            hasDescription: data.hasDescription,
            isEdited: true
          })
        }
        
        return newMap
      })
      
      // Update the components array
      setComponents(prev => 
        prev.map(component => 
          component.id === componentId
            ? { 
                ...component, 
                description: data.description, 
                hasDescription: data.hasDescription, 
                isEdited: true 
              }
            : component
        )
      )
    }
    
    // Listen for processing complete event
    const handleProcessingComplete = () => {
      // Reset global loading state
      setLoading(false)
    }

    // Register event listeners
    on('selection-change', handleSelectionChange)
    on('synonyms-generated', handleSynonymsGenerated)
    on('generate-error', handleGenerationError)
    on('description-updated', handleDescriptionUpdated)
    on('processing-complete', handleProcessingComplete)

    return () => {
      // Clean up event listeners if needed
    }
  }, [componentsMap, isInitialized])

  const handleRegenerateSynonyms = (componentId: string) => {
    // Mark component as loading
    setComponentsMap(prev => {
      const newMap = new Map(prev)
      const component = newMap.get(componentId)
      
      if (component) {
        newMap.set(componentId, {
          ...component,
          isLoading: true,
          isError: false,
          errorMessage: undefined
        })
      }
      
      return newMap
    })
    
    // Update the components array
    setComponents(prev => 
      prev.map(component => 
        component.id === componentId
          ? { ...component, isLoading: true, isError: false, errorMessage: undefined }
          : component
      )
    )
    
    // Emit event to generate synonyms for this specific component
    emit('generate-synonyms', [componentId])
  }

  const handleClearSynonyms = (componentId: string) => {
    // Update the component to remove synonyms
    setComponentsMap(prev => {
      const newMap = new Map(prev)
      const component = newMap.get(componentId)
      
      if (component) {
        newMap.set(componentId, {
          ...component,
          synonyms: [],
          isLoading: false,
          isError: false,
          errorMessage: undefined
        })
      }
      
      return newMap
    })
    
    // Update the components array
    setComponents(prev => 
      prev.map(component => 
        component.id === componentId
          ? { ...component, synonyms: [], isLoading: false, isError: false, errorMessage: undefined }
          : component
      )
    )
  }

  const handleGenerateSynonyms = () => {
    // Mark all components as loading
    const updatedMap = new Map(componentsMap)
    let anyComponentsToUpdate = false
    
    updatedMap.forEach((component, id) => {
      updatedMap.set(id, {
        ...component,
        isLoading: true,
        isError: false,
        errorMessage: undefined
      })
      anyComponentsToUpdate = true
    })
    
    if (!anyComponentsToUpdate) return
    
    setComponentsMap(updatedMap)
    
    // Update all components with loading state
    setComponents(prev => 
      prev.map(component => ({
        ...component,
        isLoading: true,
        isError: false,
        errorMessage: undefined
      }))
    )
    
    // Set global loading state
    setLoading(true)
    setError(null)
    
    // Emit event to generate synonyms for all components
    emit('generate-synonyms', Array.from(updatedMap.keys()))
  }

  const handleDescriptionChange = (description: string, componentId: string) => {
    // Handle description changes in the UI
    // Component cards will handle the state updates themselves
  }

  // Conditional rendering based on component state
  if (!isInitialized || components.length === 0) {
    return (
      <Fragment>
        
        {/* Empty state */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 'calc(100vh - 120px)', // Full height minus header/footer space
        }}>
          <IconInteractive24 />
          <VerticalSpace space="small" />
          <Text align="center">
            Select components
          </Text>
        </div>
        
        {/* Fixed button at the bottom - always visible */}
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          width: '100%', 
          padding: '16px 16px',
          backgroundColor: 'var(--figma-color-bg)',
          boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.1)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ display: 'block', width: '100%' }}>
            <Button 
              fullWidth
              style={{ 
                width: '100%',
                display: 'block',
                boxSizing: 'border-box'
              }}
              onClick={handleGenerateSynonyms} 
              disabled={true}
            >
              Generate Synonyms
            </Button>
          </div>
          <IconButton onClick={onSettingsClick}>
            <IconSettingsSmall24 />
          </IconButton>
        </div>
      </Fragment>
    )
  }

  return (
    <Fragment>
      <VerticalSpace space="medium" />
    
      {/* Display error if any */}
      {error && (
        <Fragment>
          <Text style={{ color: 'var(--figma-color-text-danger)' }}>{error}</Text>
          <VerticalSpace space="medium" />
        </Fragment>
      )}

      {/* Content container with padding at the bottom for the fixed button */}
      <div style={{ 
        paddingBottom: '60px', 
        minHeight: 'calc(100vh - 120px)', // Full height minus header/footer space 
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Component cards */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {components.map((component, index) => (
            <ComponentCard
              key={component.id}
              component={component}
              onRegenerateSynonyms={handleRegenerateSynonyms}
              onDescriptionChange={handleDescriptionChange}
              onClearSynonyms={handleClearSynonyms}
              showDivider={index < components.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Fixed button at the bottom */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        width: '100%', 
        padding: '16px 16px',
        backgroundColor: 'var(--figma-color-bg)',
        boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.1)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{ display: 'block', width: '100%' }}>
          <Button 
            fullWidth
            style={{ 
              width: '100%',
              display: 'block',
              boxSizing: 'border-box'
            }}
            onClick={handleGenerateSynonyms} 
            disabled={loading || components.length === 0}
          >
            {loading 
              ? 'Generating...' 
              : components.length === 1 
                ? 'Generate Synonyms' 
                : `Generate Synonyms • ${components.length}`
            }
          </Button>
        </div>
        <IconButton onClick={onSettingsClick}>
          <IconSettingsSmall24 />
        </IconButton>
      </div>
    </Fragment>
  )
} 