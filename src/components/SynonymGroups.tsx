import { h } from 'preact'
import { Text, Stack, VerticalSpace, Button } from '@create-figma-plugin/ui'
import { useState } from 'preact/hooks'
import { emit } from '@create-figma-plugin/utilities'

interface SynonymGroup {
  title: string
  synonyms: string[]
}

interface Props {
  groups?: SynonymGroup[]
  loading?: boolean
}

export function SynonymGroups({ 
  groups = [], 
  loading = false 
}: Props) {
  const [selectedSynonyms, setSelectedSynonyms] = useState<Set<string>>(new Set())

  const toggleSynonym = (synonym: string) => {
    const newSelected = new Set(selectedSynonyms)
    if (newSelected.has(synonym)) {
      newSelected.delete(synonym)
    } else {
      newSelected.add(synonym)
    }
    setSelectedSynonyms(newSelected)
  }

  const handleApply = () => {
    emit('UPDATE_DESCRIPTION', Array.from(selectedSynonyms))
  }

  if (loading) {
    return (
      <div class="loading">
        <Text>Generating synonyms...</Text>
      </div>
    )
  }

  if (groups.length === 0) {
    return null
  }

  return (
    <Stack space="medium">
      <Text>
        <strong>Generated Synonyms</strong>
      </Text>
      <Text>Click on synonyms to select/deselect them</Text>
      
      {groups.map(group => (
        <div class="synonyms-group" key={group.title}>
          <Text>
            <strong>{group.title}</strong>
          </Text>
          <VerticalSpace space="small" />
          <div class="synonyms-list">
            {group.synonyms.map(synonym => (
              <div
                key={synonym}
                class={`synonym-tag ${selectedSynonyms.has(synonym) ? 'selected' : ''}`}
                onClick={() => toggleSynonym(synonym)}
              >
                <Text>{synonym}</Text>
              </div>
            ))}
          </div>
        </div>
      ))}

      <VerticalSpace space="medium" />
      
      <Button 
        fullWidth 
        onClick={handleApply}
        disabled={selectedSynonyms.size === 0}
      >
        Apply to Description
      </Button>
    </Stack>
  )
} 