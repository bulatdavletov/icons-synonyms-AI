import { h, Fragment } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Text, VerticalSpace, Button, Textbox, TextboxMultiline, IconWarningSmall24, IconRefresh16, IconComponent16, IconComponentSet16, IconInstance16, LoadingIndicator, IconButton, Layer } from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import type { ComponentWithSynonyms, ComponentInfo } from './types'

interface Props {
  component: ComponentWithSynonyms
  onRegenerateSynonyms: (componentId: string) => void
  onDescriptionChange: (description: string, componentId: string) => void
  onClearSynonyms: (componentId: string) => void
  showDivider: boolean
}

export function ComponentCard({
  component,
  onRegenerateSynonyms,
  onDescriptionChange,
  onClearSynonyms,
  showDivider
}: Props) {
  const [selectedSynonyms, setSelectedSynonyms] = useState<string[]>([])
  const [editableDescription, setEditableDescription] = useState(component.description || '')
  const [originalDescription, setOriginalDescription] = useState(component.description || '')
  const [usedSynonyms, setUsedSynonyms] = useState<string[]>([])
  const [isDescriptionChanged, setIsDescriptionChanged] = useState(false)
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  // New states for image preview
  const [imageData, setImageData] = useState<string | null>(null)
  const [isLoadingImage, setIsLoadingImage] = useState(false)

  // Update the editable description when the component description changes from outside
  useEffect(() => {
    
    setEditableDescription(component.description || '')
    setOriginalDescription(component.description || '')
    setIsDescriptionChanged(false)
  }, [component.description, component.id])

  // Reset used synonyms when component changes
  useEffect(() => {
    setUsedSynonyms([])
    // Reset selected layer when component changes
    setSelectedLayerId(null)
    // Reset image data when component changes
    setImageData(null)
    // Request image for the component
    requestComponentImage()
  }, [component.id])

  // Add click outside listener to reset selected layer
  useEffect(() => {
    const handleClickOutside = () => {
      setSelectedLayerId(null)
    }
    
    document.addEventListener('click', handleClickOutside)
    
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  // Request component image from Figma
  const requestComponentImage = () => {
    setIsLoadingImage(true)
    emit('get-component-image', { componentId: component.id })
    
    // Set up listener for the image response
    const handleImageResponse = (data: { imageData: string, componentId: string }) => {
      if (data.componentId === component.id) {
        setImageData(data.imageData)
        setIsLoadingImage(false)
      }
    }
    
    // Add listener for the image response
    on('image-response', handleImageResponse)
    
    // Set a timeout to stop loading if no response
    setTimeout(() => {
      setIsLoadingImage(false)
    }, 3000)
  }

  // Handle selection of a synonym
  const handleSynonymSelect = (synonym: string) => {
    // Add synonym to the editable description
    const newDescription = editableDescription ? 
      `${editableDescription}, ${synonym}` : 
      synonym;
    
    setEditableDescription(newDescription)
    setIsDescriptionChanged(newDescription !== originalDescription)
    
    // Mark this synonym as used
    setUsedSynonyms(prev => [...prev, synonym])
  }

  // Handle saving the description when Save button is clicked
  const handleSaveDescription = () => {
    emit('update-description', {
      rawDescription: editableDescription,
      componentId: component.id
    })
    
    // Clear used synonyms after saving
    setUsedSynonyms([])
    
    // Remove synonyms completely from the component
    onClearSynonyms(component.id)
    
    setOriginalDescription(editableDescription)
    setIsDescriptionChanged(false)
  }

  // Handle canceling description edits
  const handleCancelDescription = () => {
    setEditableDescription(originalDescription)
    setIsDescriptionChanged(false)
    setUsedSynonyms([])
  }

  // Handle description input change
  const handleDescriptionChange = (value: string) => {
    setEditableDescription(value)
    setIsDescriptionChanged(value !== originalDescription)
  }

  // Handle regenerate synonyms for this component
  const handleRegenerateSynonyms = () => {
    setSelectedSynonyms([])
    setUsedSynonyms([])
    onRegenerateSynonyms(component.id)
  }

  // Handle zoom to component
  const handleZoomToComponent = (componentId: string, event: MouseEvent) => {
    // Stop event propagation to prevent the document click handler from firing
    event.stopPropagation()
    
    // Set this as the selected layer
    setSelectedLayerId(componentId)
    
    emit('zoom-to-component', { componentId })
  }

  // Handle navigation to main component for instances
  const handleNavigateToMainComponent = (component: ComponentInfo, event: MouseEvent) => {
    // Stop event propagation to prevent the document click handler from firing
    event.stopPropagation()
    
    // Set this as the selected layer
    setSelectedLayerId(component.id)
    
    // Navigate to component set if available, or to main component
    if (component.componentSetId) {
      emit('zoom-to-component', { componentId: component.componentSetId })
    } else if (component.mainComponentId) {
      emit('zoom-to-component', { componentId: component.mainComponentId })
    } else {
      emit('zoom-to-component', { componentId: component.id })
    }
  }

  return (
    <Fragment>
      {/* Component card header */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        padding: '12px',
        backgroundColor: 'var(--figma-color-bg-secondary)',
        borderRadius: '4px',
        marginBottom: '8px'
      }}>
        {/* New layout with icon on left, content on right */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Left column: Icon preview */}
          <div style={{ 
            flexShrink: 0,
            width: '100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* Component preview image */}
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'var(--figma-color-bg)',
              borderRadius: '4px',
              width: '100px',
              minHeight: '40px',
              maxHeight: '120px',
              border: '1px solid var(--figma-color-border)',
              position: 'relative',
            }}>
              {isLoadingImage ? (
                <LoadingIndicator />
              ) : imageData ? (
                <>
                  <img 
                    src={`data:image/png;base64,${imageData}`} 
                    alt={component.name}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                  <div 
                    style={{ 
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      transform: 'scale(0.8)',
                    }}
                    className="image-refresh-button"
                  >
                    <IconButton onClick={requestComponentImage}>
                      <IconRefresh16 />
                    </IconButton>
                  </div>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: '10px', color: 'var(--figma-color-text-secondary)' }}>
                    No preview
                  </Text>
                  <div 
                    style={{ 
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      transform: 'scale(0.8)',
                    }}
                  >
                    <IconButton onClick={requestComponentImage}>
                      <IconRefresh16 />
                    </IconButton>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Right column: Component details */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header with component name and regenerate button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                {/* Main component name layer */}
                <Layer
                  icon={
                    component.type === 'INSTANCE' ? <IconInstance16 /> :
                    component.type === 'COMPONENT_SET' ? <IconComponentSet16 /> : 
                    <IconComponent16 />
                  }
                  bold={true}
                  component={true}
                  value={selectedLayerId === component.id}
                  onClick={
                    component.type === 'INSTANCE' && (component.mainComponentId || component.componentSetId)
                      ? (event) => handleNavigateToMainComponent(component, event)
                      : (event) => handleZoomToComponent(component.id, event)
                  }
                >
                  {component.name}
                </Layer>
                
                {/* Size variant layers */}
                {component.sizeVariants && component.sizeVariants.length > 0 && (
                  <div style={{ marginLeft: '24px' }}>
                    {component.sizeVariants.map(variant => (
                      <Layer
                        key={variant.id}
                        icon={
                          variant.type === 'INSTANCE' ? <IconInstance16 /> :
                          variant.type === 'COMPONENT_SET' ? <IconComponentSet16 /> : 
                          <IconComponent16 />
                        }
                        component={true}
                        value={selectedLayerId === variant.id}
                        onClick={
                          variant.type === 'INSTANCE' && (variant.mainComponentId || variant.componentSetId)
                            ? (event) => handleNavigateToMainComponent(variant, event)
                            : (event) => handleZoomToComponent(variant.id, event)
                        }
                        description={
                          variant.description !== component.description && variant.description 
                            ? variant.description 
                            : undefined
                        }
                      >
                        {variant.name}
                      </Layer>
                    ))}
                  </div>
                )}
              </div>
              
              {component.synonyms.length > 0 && (
                <IconButton 
                  onClick={handleRegenerateSynonyms}
                  disabled={component.isLoading}
                >
                  <IconRefresh16 />
                </IconButton>
              )}
            </div>
            
            <VerticalSpace space="extraSmall" />
            
            {/* Description textarea - aligned with component name */}
            <TextboxMultiline
              value={editableDescription}
              placeholder="Enter a description for this component..."
              onValueInput={handleDescriptionChange}
              style={{ width: '100%' }}
              grow
              rows={Math.min(3, Math.max(1, (editableDescription.match(/\n/g) || []).length + 1))}
            />
          </div>
        </div>
        
        <style>{`
          div:hover .image-refresh-button {
            opacity: 1;
          }
        `}</style>
        
        {/* Synonyms section directly in the card */}
        {(component.synonyms.length > 0 || component.isLoading || component.isError) && (
          <Fragment>
            <VerticalSpace space="medium" />
            <div style={{ 
              borderTop: '1px solid var(--figma-color-border)',
              paddingTop: '12px' 
            }}>
              
              {/* Display loading, error, or synonyms */}
              {component.isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}>
                  <LoadingIndicator />
                </div>
              ) : component.isError ? (
                <div style={{ 
                  backgroundColor: 'var(--figma-color-bg-danger-secondary)',
                  color: 'var(--figma-color-text-danger)',
                  padding: '8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <IconWarningSmall24 />
                  <Text style={{ color: 'var(--figma-color-text-danger)' }}>
                    {component.errorMessage || 'An error occurred while generating synonyms'}
                  </Text>
                </div>
              ) : component.synonyms.length === 0 ? (
                <div style={{ 
                  backgroundColor: 'var(--figma-color-bg-disabled)',
                  padding: '8px',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <Text style={{ opacity: 0.7 }}>
                    No synonyms generated yet. Click the refresh button to generate.
                  </Text>
                </div>
              ) : (
                <Fragment>
                  {/* Synonyms tags */}
                  <div style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {component.synonyms.map(synonym => (
                      <div 
                        key={synonym}
                        style={{ 
                          padding: '4px 8px',
                          backgroundColor: usedSynonyms.includes(synonym)
                            ? 'var(--figma-color-bg-selected)'
                            : 'var(--figma-color-bg-secondary)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          border: usedSynonyms.includes(synonym)
                            ? '1px solid var(--figma-color-border-selected)'
                            : '1px solid var(--figma-color-border)'
                        }}
                        onClick={() => handleSynonymSelect(synonym)}
                      >
                        <Text style={{ 
                          color: usedSynonyms.includes(synonym)
                            ? 'var(--figma-color-text-selected)'
                            : 'var(--figma-color-text)'
                        }}>
                          {synonym}
                        </Text>
                      </div>
                    ))}
                  </div>
                </Fragment>
              )}
            </div>
          </Fragment>
        )}
                
                
        {/* Save/Cancel buttons - only visible when description has changed */}
        {isDescriptionChanged && (
          <Fragment>
            <VerticalSpace space="medium" />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
              <Button
                onClick={handleSaveDescription}
              >
                Save Description
              </Button>
              <Button
                onClick={handleCancelDescription}
                secondary
              >
                Cancel
              </Button>
            </div>
          </Fragment>
        )}

      </div>
    </Fragment>
  )
} 