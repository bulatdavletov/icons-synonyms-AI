import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'

import { 
  Text, 
  Stack, 
  VerticalSpace, 
  TextboxMultiline, 
  Button, 
  Layer, 
  IconComponent16, 
  Inline
} from '@create-figma-plugin/ui'

interface Props {
  name?: string
  type?: string
  description?: string
  hasDescription?: boolean
  selectedSynonyms?: string[]
  onDescriptionChange?: (description: string) => void
  generatedSynonyms?: string[]
  isGeneratingSynonyms?: boolean
}

export function SingleComponentCard({ 
  name = 'Select a component',
  type = '',
  description = 'No component selected',
  hasDescription = false,
  selectedSynonyms = [],
  onDescriptionChange,
  generatedSynonyms = [],
  isGeneratingSynonyms = false
}: Props) {
  const [editedDescription, setEditedDescription] = useState(description)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const [isManuallyEdited, setIsManuallyEdited] = useState(false)
  const processedSynonyms = useRef<string[]>([])
  const [localSelectedSynonyms, setLocalSelectedSynonyms] = useState<string[]>([])
  
  // Update local state when props change
  useEffect(() => {
    if (!hasPendingChanges) {
      setEditedDescription(description || '')
      setIsManuallyEdited(false) // Reset manual edit flag when description prop changes
    }
  }, [description, hasPendingChanges])
  
  // Handle adding new synonyms to the description
  useEffect(() => {
    // Ensure selectedSynonyms exists and has items before proceeding
    if (!selectedSynonyms || selectedSynonyms.length === 0) return
    
    try {
      // Filter out synonyms we've already processed
      const newSynonyms = selectedSynonyms.filter(
        synonym => !processedSynonyms.current.includes(synonym)
      )
      
      if (newSynonyms.length === 0) return
      
      // Track the synonyms we've processed
      processedSynonyms.current = [...processedSynonyms.current, ...newSynonyms]
      
      // Add new synonyms to the existing description
      const synonymsText = newSynonyms.join(', ')
      
      if (!editedDescription || editedDescription.trim() === '') {
        // If description is empty, just use synonyms
        setEditedDescription(synonymsText)
      } else {
        // Add to existing text with comma
        const currentText = editedDescription.trim()
        const lastChar = currentText.slice(-1)
        const separator = (lastChar === ',' || lastChar === '') ? ' ' : ', '
        setEditedDescription(currentText + separator + synonymsText)
      }
      
      setHasPendingChanges(true)
    } catch (error) {
      console.error('Error processing synonyms:', error)
    }
  }, [selectedSynonyms, editedDescription])
  
  // Reset processed synonyms when description is updated externally
  useEffect(() => {
    processedSynonyms.current = []
  }, [description])

  const handleDescriptionChange = (value: string) => {
    setEditedDescription(value);
    // Always set hasPendingChanges when the value is different from the original description
    const hasChanges = value !== description;
    setHasPendingChanges(hasChanges);
    setIsManuallyEdited(true); // Mark as manually edited whenever text field changes
    
    // Notify parent if callback provided - always call this to keep parent state in sync
    if (onDescriptionChange) {
      // Always call parent callback to keep the state in sync
      onDescriptionChange(value);
    }
  }
  
  const handleSave = () => {
    if (editedDescription && editedDescription.trim() !== description?.trim()) {
      // Always treat edits in the text field as manual edits, regardless of how they originated
      emit('update-description', { 
        rawDescription: editedDescription,  // Send the raw text directly
        isManualEdit: true
      })
      setHasPendingChanges(false)
      setIsManuallyEdited(false) // Reset after saving
      // Reset selected synonyms after saving
      setLocalSelectedSynonyms([])
    }
  }
  
  const handleCancel = () => {
    setEditedDescription(description || '')
    setHasPendingChanges(false)
    setIsManuallyEdited(false) // Reset after canceling
    // Reset selected synonyms on cancel
    setLocalSelectedSynonyms([])
  }

  const handleSynonymClick = (synonym: string) => {
    if (!synonym) return
    
    // Toggle the synonym in the localSelectedSynonyms array
    setLocalSelectedSynonyms(prev => {
      const isSelected = prev.includes(synonym)
      if (isSelected) {
        return prev.filter(s => s !== synonym)
      } else {
        // For a new selection, add the synonym to the description text
        addSynonymToDescription(synonym)
        return [...prev, synonym]
      }
    })

    // Mark that we have pending changes when synonyms are selected
    setHasPendingChanges(true)
  }

  // Helper function to add a synonym to the description
  const addSynonymToDescription = (synonym: string) => {
    let newDescription: string;
    
    // Add the synonym to the description text
    if (!editedDescription || editedDescription.trim() === '') {
      // If description is empty, just use the new synonym
      newDescription = synonym;
      setEditedDescription(newDescription);
    } else {
      // Add to existing text with comma
      const currentText = editedDescription.trim()
      const lastChar = currentText.slice(-1)
      const separator = (lastChar === ',' || lastChar === '') ? ' ' : ', '
      newDescription = currentText + separator + synonym;
      setEditedDescription(newDescription);
    }

    // Notify parent component of the change if needed
    if (onDescriptionChange) {
      onDescriptionChange(newDescription);
    }
  }
  
  const handleApplySynonyms = () => {
    if (localSelectedSynonyms.length > 0) {
      // If the description has been manually edited after selecting synonyms,
      // treat it as a manual edit
      if (isManuallyEdited) {
        emit('update-description', { 
          rawDescription: editedDescription,
          isManualEdit: true
        })
      } else {
        emit('update-description', { 
          synonyms: localSelectedSynonyms,
          isManualEdit: false
        })
      }
      
      // Reset selected synonyms after applying
      setLocalSelectedSynonyms([])
      setHasPendingChanges(false)
      setIsManuallyEdited(false)
    }
  }
  
  return (
    <div class="component-info">
      <Stack space="small">
        <Layer component value={false} icon={<IconComponent16 />} description={description} onChange={() => {}}>
          <strong>{name}</strong>
        </Layer>
        
        {type === '' ? (
        <Layer component value={false} icon={<IconComponent16 />} description="No component is currently selected" onChange={() => {}}>
            <em>No component selected</em>
          </Layer>
        ) : (
          <Stack space="extraSmall">
            <TextboxMultiline
              value={editedDescription || ''}
              onValueInput={handleDescriptionChange}
              placeholder={hasDescription ? "" : "Enter description..."}
              style={{ width: '100%', minHeight: '80px' }}
              rows={4}
            />
            
            {/* Synonyms UI */}
            {generatedSynonyms && generatedSynonyms.length > 0 && (
              <Stack space="extraSmall">
                <Text><strong>Select Synonyms</strong></Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  {generatedSynonyms.map((synonym, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: localSelectedSynonyms.includes(synonym)
                          ? 'var(--figma-color-bg-selected)'
                          : 'var(--figma-color-bg-secondary)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSynonymClick(synonym)}
                    >
                      <Text>{synonym}</Text>
                    </div>
                  ))}
                </div>
              </Stack>
            )}
            
            {/* Action buttons */}
            {hasPendingChanges && (
              <Stack space="extraSmall" style={{ flexDirection: 'row', marginTop: '8px' }}>
                <Button onClick={handleSave}>Save</Button>
                <Button secondary onClick={handleCancel}>Cancel</Button>
                {localSelectedSynonyms.length > 0 && (
                  <Button onClick={handleApplySynonyms}>Apply Selected</Button>
                )}
              </Stack>
            )}
            
            {/* Loading indicator */}
            {isGeneratingSynonyms && (
              <Text style={{ fontStyle: 'italic' }}>Generating synonyms...</Text>
            )}
          </Stack>
        )}
      </Stack>
    </div>
  )
} 