import { h, Fragment } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { Button, Container, Text, TextboxMultiline, VerticalSpace, Link } from '@create-figma-plugin/ui'

export function Settings() {
  const [apiKey, setApiKey] = useState<string>('')
  const [userPrompt, setUserPrompt] = useState<string>('')
  const [systemMessage, setSystemMessage] = useState<string>('') // We still need to store it, just not edit it
  const [isDefaultPrompt, setIsDefaultPrompt] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    // Request current API key and prompt templates when component mounts
    emit('get-api-key')
    emit('get-prompt-templates')

    // Listen for API key from main thread
    on('api-key-response', (data: { apiKey: string }) => {
      setApiKey(data.apiKey || '')
    })

    // Listen for prompt templates from main thread
    on('prompt-templates-response', (data: { systemMessage: string, userPrompt: string, isDefault: boolean }) => {
      setSystemMessage(data.systemMessage || '')
      setUserPrompt(data.userPrompt || '')
      setIsDefaultPrompt(data.isDefault)
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

    on('prompt-templates-saved', () => {
      setIsSaving(false)
      setSaveStatus({ type: 'success', message: 'Prompt template saved successfully!' })
      setIsDefaultPrompt(false)
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null)
      }, 3000)
    })

    on('prompt-templates-reset', () => {
      setIsSaving(false)
      setSaveStatus({ type: 'success', message: 'Prompt template reset to default!' })
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null)
      }, 3000)
    })

    on('prompt-templates-save-error', (data: { error: string }) => {
      setIsSaving(false)
      setSaveStatus({ type: 'error', message: data.error })
    })
  }, [])

  const handleSaveApiKey = () => {
    setIsSaving(true)
    setSaveStatus(null)
    emit('save-api-key', { apiKey })
  }

  const handleSavePromptTemplate = () => {
    setIsSaving(true)
    setSaveStatus(null)
    // Pass the current system message unchanged to preserve it
    emit('save-prompt-templates', { systemMessage, userPrompt })
  }

  const handleResetPromptTemplate = () => {
    setIsSaving(true)
    setSaveStatus(null)
    emit('reset-prompt-templates')
  }

  return (
    <Container space="medium">
      <VerticalSpace space="large" />
      
      {/* API Key Section */}
      <Text><strong>OpenAI API Key</strong></Text>
      <VerticalSpace space="small" />
      <Text><Link href="https://platform.openai.com/api-keys" target="_blank">Generate it here.</Link> Requires OpenAI account and about 5$.</Text>
      
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
      
      <VerticalSpace space="extraLarge" />
      
      {/* Prompt Template Section */}
      <Text><strong>Prompt</strong></Text>      
      <VerticalSpace space="medium" />
      <TextboxMultiline
        placeholder="Enter user prompt..."
        value={userPrompt}
        onValueInput={value => setUserPrompt(value)}
        rows={12}
      />
      
      <VerticalSpace space="medium" />
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button 
          onClick={handleSavePromptTemplate} 
          disabled={isSaving || !userPrompt.trim()}
        >
          {isSaving ? 'Saving...' : 'Save Template'}
        </Button>
        
        <Button
          secondary
          onClick={handleResetPromptTemplate}
          disabled={isSaving || isDefaultPrompt}
        >
          Reset to Default
        </Button>
      </div>

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