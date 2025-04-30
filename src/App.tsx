import { h, Fragment } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { Container, Text, VerticalSpace, IconButton, Button, IconSettingsSmall24, IconNavigateBack24 } from '@create-figma-plugin/ui'
import type { JSX } from 'preact'
import { Mode } from './Mode'
import { Settings } from './Settings'

export function App() {
  const [activeTab, setActiveTab] = useState<string>('main')
  
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
  }

  return (
    <Container space="medium">
      <VerticalSpace space="medium" />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {activeTab === 'settings' && (
          <IconButton onClick={() => handleTabChange('main')}>
            <IconNavigateBack24 />
          </IconButton>
        )}
        {activeTab === 'main' && (
          <div style={{ width: 28 }}></div> // Empty space for layout balance
        )}
        
        <Text>
          <strong>{activeTab === 'main' ? 'Icon Synonyms' : 'Settings'}</strong>
        </Text>
        
        {activeTab === 'main' ? (
          <IconButton onClick={() => handleTabChange('settings')}>
            <IconSettingsSmall24 />
          </IconButton>
        ) : (
          <div style={{ width: 28 }}></div> // Empty space for layout balance
        )}
      </div>
      
      <VerticalSpace space="medium" />

      {activeTab === 'main' ? (
        <Mode />
      ) : (
        <Settings />
      )}
    </Container>
  )
} 