import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { Text, Stack, VerticalSpace, TextboxMultiline, Button, Toggle, Divider } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'

interface VariantDescription {
  name: string;
  description: string;
  hasDescription: boolean;
}

interface Props {
  name?: string
  type?: string
  description?: string
  hasDescription?: boolean
  selectedSynonyms?: string[]
  onDescriptionChange?: (description: string) => void
  updateAllVariants?: boolean
  onUpdateAllVariantsChange?: (value: boolean) => void
  relatedVariants?: {
    names: string[]
    count: number
    descriptions?: VariantDescription[]
  }
}

export function ComponentInfo({ 
  name = 'Select a component',
  type = '',
  description = 'No component selected',
  hasDescription = false,
  selectedSynonyms = [],
  onDescriptionChange,
  updateAllVariants = true,
  onUpdateAllVariantsChange,
  relatedVariants = { names: [], count: 0, descriptions: [] }
}: Props) {
  const [editedDescription, setEditedDescription] = useState(description)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const processedSynonyms = useRef<string[]>([])
  
  console.log('ComponentInfo rendered with description:', description);
  console.log('Related variants full object:', JSON.stringify(relatedVariants, null, 2));
  console.log('Related variants count:', relatedVariants?.count);
  console.log('Related variants names:', relatedVariants?.names);
  console.log('Related variants descriptions:', relatedVariants?.descriptions);
  
  // Update local state when props change
  useEffect(() => {
    console.log('description prop changed:', description);
    if (!hasPendingChanges) {
      setEditedDescription(description || '')
      console.log('Updated editedDescription state to:', description || '');
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
    console.log('[USER ACTION] ComponentInfo - Description text changed');
    setEditedDescription(value);
    setHasPendingChanges(value !== description);
    console.log('[USER ACTION] ComponentInfo - hasPendingChanges set to:', value !== description);
    
    // Notify parent if callback provided - always call this to keep parent state in sync
    if (onDescriptionChange) {
      console.log('[USER ACTION] ComponentInfo - Calling parent onDescriptionChange');
      // Always call parent callback to keep the state in sync
      onDescriptionChange(value);
    }
  }
  
  const handleSave = () => {
    console.log('[USER ACTION] ComponentInfo - Save button clicked');
    console.log('[USER ACTION] ComponentInfo - Current edited description:', editedDescription);
    console.log('[USER ACTION] ComponentInfo - Update all variants:', updateAllVariants);
    
    if (editedDescription && editedDescription.trim() !== description?.trim()) {
      // Send the edited description to be updated as is, without processing
      emit('update-description', { 
        rawDescription: editedDescription,  // Send the raw text directly
        isManualEdit: true,
        updateAllVariants: updateAllVariants
      })
      setHasPendingChanges(false)
    }
  }

  const handleToggleUpdateAll = (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.checked;
    console.log('[USER ACTION] ComponentInfo - Toggle "Apply to all size variations":', newValue);
    // Notify parent component instead of updating local state
    if (onUpdateAllVariantsChange) {
      onUpdateAllVariantsChange(newValue);
    }
  }
  
  // Function to get size indicator based on name
  const getSizeIndicator = (name: string): string => {
    const sizeMatch = name.match(/@(\d+)x(\d+)$/);
    if (!sizeMatch) return '⚪'; // Default
    
    const size = parseInt(sizeMatch[1], 10);
    if (size <= 14) return '⚪'; // Small
    if (size <= 20) return '◉'; // Medium
    return '⬤'; // Large
  }
  
  // Extract size from name for display
  const getSizeLabel = (name: string): string => {
    const sizeMatch = name.match(/@(\d+)x(\d+)$/);
    return sizeMatch ? `${sizeMatch[1]}×${sizeMatch[2]}` : 'Default';
  }
  
  // Get clean component name without size suffix
  const getCleanName = (name: string): string => {
    const baseName = name.replace(/@\d+x\d+$/, '');
    return baseName;
  }
  
  // Has multiple size variations
  const hasMultipleVariants = relatedVariants.count > 1;
  
  return (
    <div class="component-info">
      <Stack space="small">
        <Text>
          <strong>{getCleanName(name)}</strong>
        </Text>
        
        {hasMultipleVariants && (
          <div class="variants-list">
            <Text>Size variations:</Text>
            <VerticalSpace space="extraSmall" />
            <Stack space="extraSmall">
              {relatedVariants.names.map((variantName, index) => {
                // Find description for this variant if available
                const variantDesc = relatedVariants.descriptions?.find(d => d.name === variantName);
                const hasVariantDesc = variantDesc?.hasDescription || false;
                
                return (
                  <div key={index} class="variant-item">
                    <Stack space="extraSmall" style={{ alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Text style={{ marginRight: '4px' }}>{getSizeIndicator(variantName)}</Text>
                        <Text style={{ fontSize: '12px' }}>{getSizeLabel(variantName)}</Text>
                      </div>
                      {hasVariantDesc && (
                        <Text style={{ fontSize: '11px', color: 'var(--figma-color-text-secondary)', marginLeft: '18px' }}>
                          {variantDesc?.description && variantDesc.description.length > 30 
                            ? variantDesc.description.substring(0, 30) + '...' 
                            : variantDesc?.description}
                        </Text>
                      )}
                    </Stack>
                  </div>
                );
              })}
            </Stack>
            <VerticalSpace space="small" />
            <Divider />
            <VerticalSpace space="small" />
          </div>
        )}
        
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
            
            {hasMultipleVariants && (
              <Toggle 
                value={updateAllVariants} 
                onChange={handleToggleUpdateAll}
              >
                <Text>Apply to all size variations</Text>
              </Toggle>
            )}
          </Stack>
        )}
      </Stack>
    </div>
  )
} 