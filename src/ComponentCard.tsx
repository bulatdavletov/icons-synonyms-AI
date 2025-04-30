import { h, Fragment } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Text, VerticalSpace, Button, Textbox, IconWarningSmall24, IconRefresh16, IconComponent16, IconComponentSet16, LoadingIndicator, IconButton } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import type { ComponentWithSynonyms } from './types'

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

  // Update the editable description when the component description changes from outside
  useEffect(() => {
    setEditableDescription(component.description || '')
    setOriginalDescription(component.description || '')
    setIsDescriptionChanged(false)
  }, [component.description, component.id])

  // Reset used synonyms when component changes
  useEffect(() => {
    setUsedSynonyms([])
  }, [component.id])

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
        {/* Component name and type */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            {component.type === 'COMPONENT_SET' ? <IconComponentSet16 /> : <IconComponent16 />}
            <Text style={{ flex: 1 }}>
              <strong>{component.name}</strong>
            </Text>
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
        
        <VerticalSpace space="small" />
        
        {/* Description textarea - always visible */}
        <Textbox
          value={editableDescription}
          placeholder="Enter a description for this component..."
          onValueInput={handleDescriptionChange}
          style={{ width: '100%' }}
        />
        
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