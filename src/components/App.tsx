import { h, Fragment } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { ComponentInfo } from './ComponentInfo'
import { Settings } from './Settings'
import { Container, Text, VerticalSpace, IconButton, Button, IconSettingsSmall24, IconNavigateBack24 } from '@create-figma-plugin/ui'
import type { ComponentInfo as ComponentInfoType } from '../types/index'
import type { SynonymGroup } from '../types/index'
import type { JSX } from 'preact'

export function App() {
  const [activeTab, setActiveTab] = useState<string>('main')
  const [componentInfo, setComponentInfo] = useState<ComponentInfoType | null>(null)
  const [synonyms, setSynonyms] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSynonyms, setSelectedSynonyms] = useState<string[]>([])
  const [newlySelectedSynonyms, setNewlySelectedSynonyms] = useState<string[]>([])
  const [descriptionText, setDescriptionText] = useState<string>('')

  useEffect(() => {
    // Listen for selection changes
    on('selection-change', (data: ComponentInfoType) => {
      setComponentInfo(data)
      setDescriptionText(data.description || '')
      setError(null)
      setSelectedSynonyms([]) // Reset selected synonyms when selection changes
      setNewlySelectedSynonyms([]) // Also reset newly selected synonyms
      setSynonyms([]) // Clear generated synonyms
    })

    // Listen for generated synonyms
    on('synonyms-generated', (data: { synonyms: string[] }) => {
      setSynonyms(data.synonyms || [])
      setLoading(false)
      setError(null)
    })

    // Listen for errors
    on('generate-error', (data: { error: string }) => {
      setError(data.error)
      setLoading(false)
    })
    
    // Listen for description updates
    on('description-updated', (data: { description: string, hasDescription: boolean }) => {
      console.log('Received description-updated event:', data);
      setComponentInfo(prevInfo => {
        if (!prevInfo) return null
        return {
          ...prevInfo,
          description: data.description,
          hasDescription: data.hasDescription
        }
      })
      setDescriptionText(data.description || '')
      setSelectedSynonyms([])
      setNewlySelectedSynonyms([])
    })

    // Listen for request to get current synonyms
    on('get-current-synonyms', () => {
      console.log('Received get-current-synonyms event');
      // If we have generated synonyms but none selected, send all of them
      // Otherwise send the selected ones
      const synmsToSend = selectedSynonyms.length > 0 ? selectedSynonyms : synonyms;
      console.log('Sending current synonyms:', synmsToSend);
      emit('current-synonyms-response', { synonyms: synmsToSend });
    })
  }, [selectedSynonyms, synonyms])

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
  }

  const handleGenerateSynonyms = () => {
    setLoading(true)
    setError(null)
    setSynonyms([])
    emit('generate-synonyms')
  }

  const handleDescriptionChange = (value: string) => {
    setDescriptionText(value || '')
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
        <Fragment>
          {/* Content container with padding at the bottom to make room for fixed button */}
          <div style={{ paddingBottom: '60px' }}>
            {error && (
              <Fragment>
                <Text style={{ color: 'var(--figma-color-text-danger)' }}>{error}</Text>
                <VerticalSpace space="medium" />
              </Fragment>
            )}

            {componentInfo && (
              <ComponentInfo
                name={componentInfo.name}
                type={componentInfo.type}
                description={componentInfo.description}
                hasDescription={componentInfo.hasDescription}
                selectedSynonyms={newlySelectedSynonyms}
                onDescriptionChange={handleDescriptionChange}
                generatedSynonyms={synonyms}
                isGeneratingSynonyms={loading}
              />
            )}
          </div>

          {/* Fixed button at the bottom */}
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
            <Button fullWidth onClick={handleGenerateSynonyms} disabled={loading || !componentInfo}>
              {loading ? 'Generating...' : 'Generate Synonyms'}
            </Button>
          </div>
        </Fragment>
      ) : (
        <Settings />
      )}
    </Container>
  )
} 