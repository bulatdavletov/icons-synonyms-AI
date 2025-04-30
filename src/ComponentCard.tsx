import { h, Fragment } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Text, VerticalSpace, Button, Textbox, IconWarningSmall24, IconRefresh16, Divider, IconFrame16, LoadingIndicator } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import type { ComponentWithSynonyms } from './types'

interface Props {
  component: ComponentWithSynonyms
  onRegenerateSynonyms: (componentId: string) => void
  onDescriptionChange: (description: string, componentId: string) => void
  showDivider: boolean
}

export function ComponentCard({
  component,
  onRegenerateSynonyms,
  onDescriptionChange,
  showDivider
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedSynonyms, setSelectedSynonyms] = useState<string[]>([])
  const [editableDescription, setEditableDescription] = useState(component.description || '')
  const [isEditing, setIsEditing] = useState(false)

  // Update the editable description when the component description changes
  useEffect(() => {
    setEditableDescription(component.description || '')
  }, [component.description])

  // Handle selection of a synonym
  const handleSynonymSelect = (synonym: string) => {
    setSelectedSynonyms(prev => {
      if (prev.includes(synonym)) {
        return prev.filter(s => s !== synonym)
      } else {
        return [...prev, synonym]
      }
    })
  }

  // Handle saving the description
  const handleSaveDescription = () => {
    emit('update-description', {
      rawDescription: editableDescription,
      componentId: component.id
    })
    setIsEditing(false)
  }

  // Handle using selected synonyms
  const handleUseSynonyms = () => {
    if (selectedSynonyms.length === 0) return
    
    emit('update-description', {
      synonyms: selectedSynonyms,
      componentId: component.id
    })
    
    setSelectedSynonyms([])
  }

  // Handle cancel editing
  const handleCancelEdit = () => {
    setEditableDescription(component.description || '')
    setIsEditing(false)
  }

  // Handle regenerate synonyms for this component
  const handleRegenerateSynonyms = () => {
    setSelectedSynonyms([])
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconFrame16 />
            <Text>
              <strong>{component.name}</strong>
            </Text>
          </div>
          <div>
            <Text>
              <small style={{ opacity: 0.7 }}>{component.type}</small>
            </Text>
          </div>
        </div>
        
        <VerticalSpace space="small" />
        
        {/* Description section */}
        {isEditing ? (
          <Fragment>
            <Textbox
              value={editableDescription}
              placeholder="Enter a description for this component..."
              onValueInput={setEditableDescription}
              style={{ width: '100%' }}
            />
            <VerticalSpace space="extraSmall" />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button
                onClick={handleCancelEdit}
                secondary
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveDescription}
              >
                Save
              </Button>
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                {component.description ? (
                  <Text style={{ wordBreak: 'break-word' }}>
                    {component.description}
                  </Text>
                ) : (
                  <Text style={{ opacity: 0.5, fontStyle: 'italic' }}>
                    No description available
                  </Text>
                )}
              </div>
              <Button 
                onClick={() => setIsEditing(true)}
                secondary
              >
                Edit
              </Button>
            </div>
          </Fragment>
        )}
        
        {/* Expand/collapse button for synonyms */}
        <VerticalSpace space="small" />
        <Button 
          secondary 
          fullWidth 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide Synonyms' : 'Show Synonyms'}
        </Button>
      </div>
      
      {/* Expanded synonyms section */}
      {isExpanded && (
        <div style={{ 
          backgroundColor: 'var(--figma-color-bg)',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '8px',
          border: '1px solid var(--figma-color-border)'
        }}>
          {/* Synonyms section header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>
              <strong>Synonyms</strong>
            </Text>
            <Button 
              onClick={handleRegenerateSynonyms}
              secondary
              disabled={component.isLoading}
            >
              <IconRefresh16 />
            </Button>
          </div>
          
          <VerticalSpace space="small" />
          
          {/* Display loading, error, or synonyms */}
          {component.isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
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
                      backgroundColor: selectedSynonyms.includes(synonym) 
                        ? 'var(--figma-color-bg-selected)' 
                        : 'var(--figma-color-bg-secondary)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: selectedSynonyms.includes(synonym)
                        ? '1px solid var(--figma-color-border-selected)'
                        : '1px solid var(--figma-color-border)'
                    }}
                    onClick={() => handleSynonymSelect(synonym)}
                  >
                    <Text style={{ 
                      color: selectedSynonyms.includes(synonym) 
                        ? 'var(--figma-color-text-selected)' 
                        : 'var(--figma-color-text)'
                    }}>
                      {synonym}
                    </Text>
                  </div>
                ))}
              </div>
              
              {/* Use selected synonyms button */}
              {selectedSynonyms.length > 0 && (
                <Fragment>
                  <VerticalSpace space="small" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>
                      <small>{selectedSynonyms.length} selected</small>
                    </Text>
                    <Button onClick={handleUseSynonyms}>
                      Use Selected
                    </Button>
                  </div>
                </Fragment>
              )}
            </Fragment>
          )}
        </div>
      )}
      
      {/* Divider between components */}
      {showDivider && (
        <Fragment>
          <VerticalSpace space="small" />
          <Divider />
          <VerticalSpace space="small" />
        </Fragment>
      )}
    </Fragment>
  )
} 