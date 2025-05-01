import { h, Fragment } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { Container, Text, VerticalSpace, IconButton, Button, IconSettingsSmall24, IconNavigateBack24 } from '@create-figma-plugin/ui'
import type { JSX } from 'preact'
import { Home } from './Home'
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
        
        {activeTab === 'settings' ? (
          <div style={{ width: 28 }}></div> // Empty space for layout balance
        ) : (
          <div style={{ width: 28 }}></div> // Empty space for layout balance
        )}
      </div>
      
      <VerticalSpace space="medium" />

      {activeTab === 'main' ? (
        <Home onSettingsClick={() => handleTabChange('settings')} />
      ) : (
        <Settings />
      )}
    </Container>
  )
} 