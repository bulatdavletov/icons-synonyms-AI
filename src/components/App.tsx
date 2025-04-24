import { h, Fragment } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { ComponentInfo } from './ComponentInfo'
import { Settings } from './Settings'
import { Button, Container, Text, VerticalSpace, Tabs } from '@create-figma-plugin/ui'
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

  const handleTabChange = (event: any) => {
    setActiveTab(event.currentTarget.value)
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
      <Tabs 
        onChange={handleTabChange}
        value={activeTab}
        options={[
          { children: 'Synonyms', value: 'main' },
          { children: 'Settings', value: 'settings' }
        ]}
      />
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