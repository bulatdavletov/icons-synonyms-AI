import { h, Fragment } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { Text, VerticalSpace, Button, Textbox, IconWarningSmall24, Divider, Stack, LoadingIndicator } from '@create-figma-plugin/ui'
import { ComponentCard } from './ComponentCard'
import type { ComponentInfo, ComponentWithSynonyms, ComponentsMap } from './types'

export function Mode() {
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

    // Register event listeners
    on('selection-change', handleSelectionChange)
    on('synonyms-generated', handleSynonymsGenerated)
    on('generate-error', handleGenerationError)
    on('description-updated', handleDescriptionUpdated)

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
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '200px',
          padding: '20px',
          border: '1px dashed var(--figma-color-border)',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <IconWarningSmall24 />
          <VerticalSpace space="small" />
          <Text align="center">
            <strong>No Components Selected</strong>
          </Text>
          <VerticalSpace space="small" />
          <Text align="center">
            Please select one or more components in Figma.
          </Text>
        </div>
      </Fragment>
    )
  }

  return (
    <Fragment>
      {/* Display error if any */}
      {error && (
        <Fragment>
          <Text style={{ color: 'var(--figma-color-text-danger)' }}>{error}</Text>
          <VerticalSpace space="medium" />
        </Fragment>
      )}

      {/* Content container with padding at the bottom for the fixed button */}
      <div style={{ paddingBottom: '60px' }}>
        <Text>
          <strong>{components.length} component{components.length !== 1 ? 's' : ''} selected</strong>
        </Text>
        <VerticalSpace space="small" />

        {/* Component cards */}
        {components.map((component, index) => (
          <ComponentCard
            key={component.id}
            component={component}
            onRegenerateSynonyms={handleRegenerateSynonyms}
            onDescriptionChange={handleDescriptionChange}
            showDivider={index < components.length - 1}
          />
        ))}
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
        zIndex: 100
      }}>
        <Button fullWidth onClick={handleGenerateSynonyms} disabled={loading || components.length === 0}>
          {loading 
            ? 'Generating...' 
            : components.length === 1 
              ? 'Generate Synonyms' 
              : `Generate Synonyms for All (${components.length})`
          }
        </Button>
      </div>
    </Fragment>
  )
} 