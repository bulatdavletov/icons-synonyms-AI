import { EventHandler } from '@create-figma-plugin/utilities'

/**
 * Represents a group of synonyms in a specific category
 * 
 * Categories:
 * - Usage: How the icon is used in the IDE (actions/features)
 * - Name of object: Main object representation in the icon
 * - Modificator: Additional states or modifiers (usually small icons)
 * - Synonyms: Additional related terms and shapes
 */
export interface SynonymGroup {
  title: string
  synonyms: string[]
}

// Interface for variant description
export interface VariantDescription {
  name: string
  description: string
  hasDescription: boolean
}

export interface ComponentInfo {
  name: string
  type: string
  description: string
  hasDescription: boolean
  relatedVariants?: {
    names: string[]
    count: number
    descriptions?: VariantDescription[]
  }
}

export interface Handler {
  'selection-change': (componentInfo: ComponentInfo) => void
  'generate-synonyms': () => void
  'synonyms-generated': (data: { synonyms: string[] }) => void
  'generate-error': (data: { error: string }) => void
  'update-description': (data: { 
    synonyms?: string[], 
    rawDescription?: string, 
    isManualEdit?: boolean,
    updateAllVariants?: boolean 
  }) => void
}

export type HandlerEvent<K extends keyof Handler> = {
  type: K
  data: Parameters<Handler[K]>[0]
} 