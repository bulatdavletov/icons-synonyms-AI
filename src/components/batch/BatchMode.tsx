import { h, Fragment } from 'preact'
import { useState } from 'preact/hooks'
import { Text, VerticalSpace, Button, Textbox, IconWarningSmall24 } from '@create-figma-plugin/ui'

export function BatchMode() {
  const [components, setComponents] = useState<any[]>([])

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
          <strong>Batch Mode - Coming Soon</strong>
        </Text>
        <VerticalSpace space="small" />
        <Text align="center">
          This feature will allow you to process multiple components at once.
          Stay tuned for updates!
        </Text>
      </div>
      
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
        <Button fullWidth disabled>
          Generate Batch Synonyms
        </Button>
      </div>
    </Fragment>
  )
} 