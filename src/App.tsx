import { h } from 'preact'
import { useState } from 'preact/hooks'
import { Container } from '@create-figma-plugin/ui'
import { Home } from './Home'
import { Settings } from './Settings'

export function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'settings'>('home')
  
  const navigateTo = (page: 'home' | 'settings') => {
    setCurrentPage(page)
  }

  return (
    <Container space="medium">
      {currentPage === 'home' ? (
        <Home onSettingsClick={() => navigateTo('settings')} />
      ) : (
        <Settings onNavigateToHome={() => navigateTo('home')} />
      )}
    </Container>
  )
} 