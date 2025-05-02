import { h, Fragment } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { Button, Container, Text, TextboxMultiline, VerticalSpace, Link, Textbox, Dropdown, IconButton, IconNavigateBack24 } from '@create-figma-plugin/ui'

// OpenAI model options
const MODEL_OPTIONS = [
  { value: 'gpt-4o', text: 'GPT-4o' },
  { value: 'gpt-4o-mini', text: 'GPT-4o Mini' },
  { value: 'gpt-4.1-mini', text: 'GPT-4.1 Mini' },
  { value: 'gpt-4.1-nano', text: 'GPT-4.1 Nano' }
]

interface SettingsProps {
  onNavigateToHome: () => void
}

export function Settings({ onNavigateToHome }: SettingsProps) {
  const [apiKey, setApiKey] = useState<string>('')
  const [userPrompt, setUserPrompt] = useState<string>('')
  const [systemMessage, setSystemMessage] = useState<string>('') // We still need to store it, just not edit it
  const [isDefaultPrompt, setIsDefaultPrompt] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4.1-mini')
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    // Request current API key and prompt templates when component mounts
    emit('get-api-key')
    emit('get-prompt-templates')
    emit('get-ai-model')

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
    
    // Listen for AI model from main thread
    on('ai-model-response', (data: { model: string }) => {
      setSelectedModel(data.model || 'gpt-4o')
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
    
    on('ai-model-saved', () => {
      setIsSaving(false)
      setSaveStatus({ type: 'success', message: 'AI model saved successfully!' })
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null)
      }, 3000)
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
  
  const handleSaveModel = () => {
    setIsSaving(true)
    setSaveStatus(null)
    emit('save-ai-model', { model: selectedModel })
  }

  return (
    <Fragment>
      <VerticalSpace space="small" />
      
      {/* Header with back button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton onClick={onNavigateToHome}>
          <IconNavigateBack24 />
        </IconButton>
        
        <Text align="center">
          <strong>Settings</strong>
        </Text>
        
        <div style={{ width: 28 }}></div> {/* Empty space for layout balance */}
      </div>
      
      <VerticalSpace space="medium" />
      
      {/* Settings Content */}
      <Container space="extraSmall">
        {/* API Key Section */}
        <Text><strong>OpenAI API Key</strong></Text>
        <VerticalSpace space="small" />
        <Text><Link href="https://platform.openai.com/api-keys" target="_blank">Obtain here</Link> or just ask Bulat</Text>
        
        <VerticalSpace space="medium" />
        <Textbox
          placeholder="sk-..."
          value={apiKey}
          onValueInput={value => setApiKey(value)}
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
        
        {/* Model Selection Section */}
        <Text><strong>AI Model</strong></Text>
        <VerticalSpace space="small" />
        <Text>Select the OpenAI model to use for generating synonyms</Text>
        
        <VerticalSpace space="medium" />
        <Dropdown
          options={MODEL_OPTIONS}
          value={selectedModel}
          onChange={event => {
            const value = event.currentTarget.value
            setSelectedModel(value)
          }}
        />
        
        <VerticalSpace space="medium" />
        <Button 
          fullWidth 
          onClick={handleSaveModel} 
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Model Selection'}
        </Button>
        
        <VerticalSpace space="extraLarge" />
        
        {/* Prompt Template Section */}
        <Text><strong>Prompt</strong></Text>      
        <VerticalSpace space="small" />
        <TextboxMultiline
          placeholder="Enter user prompt..."
          value={userPrompt}
          onValueInput={value => setUserPrompt(value)}
          rows={24}
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
  
        <VerticalSpace space="large" />
  
      </Container>
    </Fragment>
  )
} 