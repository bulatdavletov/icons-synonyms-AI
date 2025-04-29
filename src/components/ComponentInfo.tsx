import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { Text, Stack, VerticalSpace, TextboxMultiline, Button } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'

interface Props {
  name?: string
  type?: string
  description?: string
  hasDescription?: boolean
  selectedSynonyms?: string[]
  onDescriptionChange?: (description: string) => void
}

export function ComponentInfo({ 
  name = 'Select a component',
  type = '',
  description = 'No component selected',
  hasDescription = false,
  selectedSynonyms = [],
  onDescriptionChange
}: Props) {
  const [editedDescription, setEditedDescription] = useState(description)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const processedSynonyms = useRef<string[]>([])
  
  // Update local state when props change
  useEffect(() => {
    if (!hasPendingChanges) {
      setEditedDescription(description || '')
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
    setEditedDescription(value)
    setHasPendingChanges(value !== description)
    
    // Notify parent if callback provided
    if (onDescriptionChange) {
      onDescriptionChange(value)
    }
  }
  
  const handleSave = () => {
    if (editedDescription && editedDescription.trim() !== description?.trim()) {
      // Send the edited description to be updated as is, without processing
      emit('update-description', { 
        rawDescription: editedDescription,  // Send the raw text directly
        isManualEdit: true
      })
      setHasPendingChanges(false)
    }
  }
  
  return (
    <div class="component-info">
      <Stack space="small">
        <Text>
          <strong>{name}</strong>
        </Text>
        
        {type === '' ? (
        <Text>
            <em>No component selected</em>
          </Text>
        ) : (
          <Stack space="extraSmall">
            <TextboxMultiline
              value={editedDescription || ''}
              onValueInput={handleDescriptionChange}
              placeholder={hasDescription ? "" : "Enter description..."}
              style={{ width: '100%', minHeight: '80px' }}
              rows={4}
            />
            
            {hasPendingChanges && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Button onClick={handleSave}>
                  Save Description
                </Button>
              </div>
          )}
          </Stack>
        )}
      </Stack>
    </div>
  )
} 