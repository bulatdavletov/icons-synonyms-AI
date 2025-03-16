import { h, Fragment } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { 
  Button,
  Container,
  Text,
  VerticalSpace,
  LoadingIndicator,
  Divider
} from '@create-figma-plugin/ui'
import { ComponentInfo, SynonymGroup } from '../types'

export function App() {
  const [componentInfo, setComponentInfo] = useState<ComponentInfo | null>(null)
  const [synonymGroups, setSynonymGroups] = useState<SynonymGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Listen for selection changes
    const removeSelectionChangeListener = on('SELECTION_CHANGE', (componentInfo: ComponentInfo) => {
      setComponentInfo(componentInfo)
      setSynonymGroups([])
      setError(null)
    })

    // Listen for synonym generation results
    const removeSynonymsGeneratedListener = on('SYNONYMS_GENERATED', (data: { groups: SynonymGroup[] }) => {
      setLoading(false)
      setSynonymGroups(data.groups)
      setError(null)
    })

    // Listen for errors
    const removeErrorListener = on('GENERATE_ERROR', (data: { error: string }) => {
      setLoading(false)
      setError(data.error)
    })

    return () => {
      removeSelectionChangeListener()
      removeSynonymsGeneratedListener()
      removeErrorListener()
    }
  }, [])

  const handleGenerateSynonyms = () => {
    setLoading(true)
    setError(null)
    emit('GENERATE_SYNONYMS')
  }

  const handleSynonymClick = (synonyms: string[]) => {
    emit('UPDATE_DESCRIPTION', { synonyms })
  }

  return (
    <Container space="medium">
      {componentInfo ? (
        <Fragment>
          <VerticalSpace space="large" />
          <Text>{componentInfo.name}</Text>
          <VerticalSpace space="small" />
          <Text>{componentInfo.type}</Text>
          
          {componentInfo.description && (
            <Fragment>
              <VerticalSpace space="medium" />
              <Text>Current description:</Text>
              <Text>{componentInfo.description}</Text>
            </Fragment>
          )}

          <VerticalSpace space="medium" />
          <Button 
            fullWidth
            onClick={handleGenerateSynonyms}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Synonyms'}
          </Button>
          
          {loading && (
            <Fragment>
              <VerticalSpace space="medium" />
              <LoadingIndicator />
            </Fragment>
          )}
          
          {error && (
            <Fragment>
              <VerticalSpace space="medium" />
              <Text style={{ color: 'var(--figma-color-text-danger)' }}>
                {error}
              </Text>
            </Fragment>
          )}

          {synonymGroups.length > 0 && (
            <Fragment>
              <VerticalSpace space="large" />
              <Divider />
              <VerticalSpace space="medium" />
              {synonymGroups.map((group) => (
                <div key={group.title}>
                  <Text>{group.title}</Text>
                  <VerticalSpace space="small" />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {group.synonyms.map((synonym) => (
                      <Button
                        key={synonym}
                        onClick={() => handleSynonymClick([synonym])}
                        secondary
                      >
                        {synonym.replace(/^(object:|action:|visual:)/, '')}
                      </Button>
                    ))}
                  </div>
                  <VerticalSpace space="medium" />
                </div>
              ))}
            </Fragment>
          )}
          <VerticalSpace space="large" />
        </Fragment>
      ) : (
        <Fragment>
          <VerticalSpace space="large" />
          <Text align="center">Select a component to get started</Text>
          <VerticalSpace space="large" />
        </Fragment>
      )}
    </Container>
  )
} 