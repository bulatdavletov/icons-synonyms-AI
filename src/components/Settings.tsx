import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { Button, Container, Text, TextboxMultiline, VerticalSpace } from '@create-figma-plugin/ui'

export function Settings() {
  const [apiKey, setApiKey] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    // Request current API key when component mounts
    emit('get-api-key')

    // Listen for API key from main thread
    on('api-key-response', (data: { apiKey: string }) => {
      setApiKey(data.apiKey || '')
    })

    // Listen for save responses
    on('api-key-saved', () => {
      setIsSaving(false)
      setSaveStatus({ type: 'success', message: 'API key saved successfully!' })
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null)
      }, 3000)
    })

    on('api-key-save-error', (data: { error: string }) => {
      setIsSaving(false)
      setSaveStatus({ type: 'error', message: data.error })
    })
  }, [])

  const handleSaveApiKey = () => {
    setIsSaving(true)
    setSaveStatus(null)
    emit('save-api-key', { apiKey })
  }

  return (
    <Container space="medium">
      <VerticalSpace space="large" />
      <Text><strong>API Key Settings</strong></Text>
      <VerticalSpace space="small" />
      <Text>Enter your OpenAI API key. This will be stored securely on your device and won't be shared with anyone else.</Text>
      
      <VerticalSpace space="medium" />
      <TextboxMultiline
        placeholder="sk-..."
        value={apiKey}
        onValueInput={value => setApiKey(value)}
        rows={2}
      />
      
      <VerticalSpace space="medium" />
      <Button 
        fullWidth 
        onClick={handleSaveApiKey} 
        disabled={isSaving || !apiKey.trim()}
      >
        {isSaving ? 'Saving...' : 'Save API Key'}
      </Button>

      {saveStatus && (
        <div>
          <VerticalSpace space="small" />
          <Text style={{ 
            color: saveStatus.type === 'success' 
              ? 'var(--figma-color-text-success)' 
              : 'var(--figma-color-text-danger)' 
          }}>
            {saveStatus.message}
          </Text>
        </div>
      )}
    </Container>
  )
} 