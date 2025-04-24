import { h } from 'preact'
import { Text, Stack, VerticalSpace } from '@create-figma-plugin/ui'

interface Props {
  name?: string
  type?: string
  description?: string
  hasDescription?: boolean
}

export function ComponentInfo({ 
  name = 'Select a component',
  type = '',
  description = 'No component selected',
  hasDescription = false 
}: Props) {
  return (
    <div class="component-info">
      <Stack space="small">
        <Text>
          <strong>{name}</strong>
        </Text>
        
        {type && (
          <Text>
            <small>{type}</small>
          </Text>
        )}
        
        <VerticalSpace space="small" />
        
        <Text>
          {hasDescription ? description : (
            <em>No description</em>
          )}
        </Text>
      </Stack>
    </div>
  )
} 