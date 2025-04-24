import { h, Fragment } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { ComponentInfo } from './ComponentInfo'
import { Settings } from './Settings'
import { Button, Container, Text, VerticalSpace, IconButton } from '@create-figma-plugin/ui'
import type { ComponentInfo as ComponentInfoType } from '../types/index'
import type { SynonymGroup } from '../types/index'

export function App() {
  const [activeTab, setActiveTab] = useState<string>('main')
  const [componentInfo, setComponentInfo] = useState<ComponentInfoType | null>(null)
  const [synonymGroups, setSynonymGroups] = useState<SynonymGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSynonyms, setSelectedSynonyms] = useState<string[]>([])

  useEffect(() => {
    // Listen for selection changes
    on('selection-change', (data: ComponentInfoType) => {
      setComponentInfo(data)
      setError(null)
    })

    // Listen for generated synonyms
    on('synonyms-generated', (data: { groups: SynonymGroup[] }) => {
      console.log('Received synonym groups:', data.groups)
      setSynonymGroups(data.groups)
      setLoading(false)
      setError(null)
    })

    // Listen for errors
    on('generate-error', (data: { error: string }) => {
      setError(data.error)
      setLoading(false)
    })
  }, [])

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
  }

  const handleGenerateSynonyms = () => {
    setLoading(true)
    setError(null)
    setSynonymGroups([])
    emit('generate-synonyms')
  }

  const handleSynonymClick = (synonym: string) => {
    setSelectedSynonyms(prev => 
      prev.includes(synonym)
        ? prev.filter(s => s !== synonym)
        : [...prev, synonym]
    )
  }

  const handleApplySelected = () => {
    if (selectedSynonyms.length > 0) {
      emit('update-description', { synonyms: selectedSynonyms })
      setSelectedSynonyms([])
    }
  }

  return (
    <Container space="medium">
      <VerticalSpace space="medium" />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {activeTab === 'settings' && (
          <Button onClick={() => handleTabChange('main')}>
            Back
          </Button>
        )}
        {activeTab === 'main' && (
          <div style={{ width: 28 }}></div> // Empty space for layout balance
        )}
        
        <Text>
          <strong>{activeTab === 'main' ? 'Icon Synonyms' : 'Settings'}</strong>
        </Text>
        
        {activeTab === 'main' ? (
          <IconButton onClick={() => handleTabChange('settings')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.48543 2.52686C6.48543 2.23607 6.72151 2 7.01229 2H8.98777C9.27856 2 9.51464 2.23607 9.51464 2.52686V2.84745C9.51464 3.09792 9.68582 3.30741 9.92584 3.3746C10.0181 3.40019 10.1091 3.42894 10.1988 3.46076C10.4266 3.54253 10.6909 3.48269 10.8645 3.30908L11.0933 3.08024C11.3015 2.87204 11.6349 2.87204 11.8431 3.08024L13.1698 4.40695C13.378 4.61514 13.378 4.94855 13.1698 5.15675L12.941 5.38558C12.7674 5.5592 12.7076 5.82349 12.7893 6.05132C12.8211 6.14098 12.8499 6.23195 12.8755 6.32421C12.9426 6.56424 13.1521 6.73542 13.4026 6.73542H13.7232C14.0139 6.73542 14.25 6.9715 14.25 7.26229V9.23777C14.25 9.52856 14.0139 9.76464 13.7232 9.76464H13.4026C13.1521 9.76464 12.9426 9.93582 12.8755 10.1758C12.8499 10.2681 12.8211 10.3591 12.7893 10.4487C12.7076 10.6766 12.7674 10.9408 12.941 11.1145L13.1698 11.3433C13.378 11.5515 13.378 11.8849 13.1698 12.0931L11.8431 13.4198C11.6349 13.628 11.3015 13.628 11.0933 13.4198L10.8645 13.191C10.6909 13.0174 10.4266 12.9575 10.1988 13.0393C10.1091 13.0711 10.0181 13.0999 9.92584 13.1254C9.68582 13.1926 9.51464 13.4021 9.51464 13.6526V13.9732C9.51464 14.264 9.27856 14.5 8.98777 14.5H7.01229C6.72151 14.5 6.48543 14.264 6.48543 13.9732V13.6526C6.48543 13.4021 6.31425 13.1926 6.07422 13.1254C5.98196 13.0999 5.89099 13.0711 5.80133 13.0393C5.5735 12.9575 5.30921 13.0174 5.13559 13.191L4.90675 13.4198C4.69856 13.628 4.36515 13.628 4.15695 13.4198L2.83024 12.0931C2.62204 11.8849 2.62204 11.5515 2.83024 11.3433L3.05907 11.1145C3.23269 10.9408 3.29253 10.6766 3.21076 10.4487C3.17894 10.3591 3.15019 10.2681 3.1246 10.1758C3.05741 9.93582 2.84792 9.76464 2.59745 9.76464H2.27686C1.98607 9.76464 1.75 9.52856 1.75 9.23777V7.26229C1.75 6.9715 1.98607 6.73542 2.27686 6.73542H2.59745C2.84792 6.73542 3.05741 6.56424 3.1246 6.32421C3.15019 6.23195 3.17894 6.14098 3.21076 6.05132C3.29253 5.82349 3.23269 5.5592 3.05907 5.38558L2.83024 5.15675C2.62204 4.94855 2.62204 4.61514 2.83024 4.40695L4.15695 3.08024C4.36515 2.87204 4.69856 2.87204 4.90675 3.08024L5.13559 3.30908C5.30921 3.48269 5.5735 3.54253 5.80133 3.46076C5.89099 3.42894 5.98196 3.40019 6.07422 3.3746C6.31425 3.30741 6.48543 3.09792 6.48543 2.84745V2.52686ZM8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z" fill="currentColor"/>
            </svg>
          </IconButton>
        ) : (
          <div style={{ width: 28 }}></div> // Empty space for layout balance
        )}
      </div>
      
      <VerticalSpace space="medium" />

      {activeTab === 'main' ? (
        <Fragment>
          {componentInfo && (
            <ComponentInfo
              name={componentInfo.name}
              type={componentInfo.type}
              description={componentInfo.description}
              hasDescription={componentInfo.hasDescription}
            />
          )}

          <VerticalSpace space="large" />

          <Button fullWidth onClick={handleGenerateSynonyms} disabled={loading || !componentInfo}>
            {loading ? 'Generating...' : 'Generate Synonyms'}
          </Button>

          {error && (
            <Fragment>
              <VerticalSpace space="medium" />
              <Text style={{ color: 'var(--figma-color-text-danger)' }}>{error}</Text>
            </Fragment>
          )}

          {synonymGroups.length > 0 && (
            <Fragment>
              <VerticalSpace space="large" />
              {synonymGroups.map((group, index) => (
                <div key={index}>
                  <Text>{group.title}</Text>
                  <VerticalSpace space="small" />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {group.synonyms.map((synonym, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: selectedSynonyms.includes(`${group.title.toLowerCase()}: ${synonym}`)
                            ? 'var(--figma-color-bg-selected)'
                            : 'var(--figma-color-bg-secondary)',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleSynonymClick(`${group.title.toLowerCase()}: ${synonym}`)}
                      >
                        <Text>{synonym}</Text>
                      </div>
                    ))}
                  </div>
                  <VerticalSpace space="medium" />
                </div>
              ))}

              {selectedSynonyms.length > 0 && (
                <Fragment>
                  <VerticalSpace space="medium" />
                  <Button fullWidth onClick={handleApplySelected}>
                    Apply Selected ({selectedSynonyms.length})
                  </Button>
                </Fragment>
              )}
            </Fragment>
          )}
        </Fragment>
      ) : (
        <Settings />
      )}
    </Container>
  )
} 